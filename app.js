// Global Application State
let cvReady = false;
let streaming = false;
let video = document.getElementById('webcam');
let canvas = document.getElementById('outputCanvas');
let ctx = canvas.getContext('2d');

// Computer Vision & Tracking Engine State
let nextGrainId = 1;
let trackedGrains = []; // Array of { id, cx, cy, area, bbox, owner, score }
let selectedGrainId = null;
let voiceEnabled = true;

// Dynamic Settings
const DIST_THRESHOLD = 35; // Maximum pixel displacement for tracking matching
const MIN_GRAIN_AREA = 35; // Minimum contour area
const MAX_GRAIN_AREA = 1000; // Maximum contour area

function onOpenCvReady() {
  cv['onRuntimeInitialized'] = () => {
    cvReady = true;
    document.getElementById('status-badge').innerText = "SYSTEM READY";
    document.getElementById('status-badge').className = "text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-mono";
    document.getElementById('btnStart').disabled = false;
    logEvent("OpenCV WASM Engine operational.");
  };
}

async function toggleCamera() {
  if (streaming) {
    stopCamera();
    return;
  }
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
    video.srcObject = stream;
    video.play();
    streaming = true;
    document.getElementById('btnStart').innerText = "STOP CAMERA";
    document.getElementById('btnStart').className = "px-4 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 border border-red-800/50 font-medium text-xs rounded transition uppercase tracking-wider";
    logEvent("Webcam stream online. Initiating vision tracking loop.");
    requestAnimationFrame(processVideoFrame);
  } catch (err) {
    logEvent("ERROR: Failed to access camera feed.");
    alert("Camera Access Error: " + err.message);
  }
}

function stopCamera() {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
  }
  streaming = false;
  document.getElementById('btnStart').innerText = "START CAMERA";
  document.getElementById('btnStart').className = "px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded transition uppercase tracking-wider";
  logEvent("Webcam stream offline.");
}

// Processing Core Engine
function processVideoFrame() {
  if (!streaming || !cvReady) return;

  // Sync canvas size to match video resolution
  if (canvas.width !== video.videoWidth && video.videoWidth > 0) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  // OpenCV Frame Processing Setup
  let src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
  let gray = new cv.Mat();
  let blur = new cv.Mat();
  let thresh = new cv.Mat();
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();

  let cap = new cv.VideoCapture(video);
  cap.read(src);

  // Computer Vision Processing Pipeline
  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  cv.GaussianBlur(gray, blur, new cv.Size(5, 5), 0);
  // Binary thresholding optimized for dark background + light rice
  cv.threshold(blur, thresh, 120, 255, cv.THRESH_BINARY);

  // Contour Detection
  cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  let currentDetections = [];

  // Extract Valid Grains
  for (let i = 0; i < contours.size(); ++i) {
    let cnt = contours.get(i);
    let area = cv.contourArea(cnt);

    if (area >= MIN_GRAIN_AREA && area <= MAX_GRAIN_AREA) {
      let moments = cv.moments(cnt);
      let cx = Math.round(moments.m10 / moments.m00);
      let cy = Math.round(moments.m01 / moments.m00);
      let rect = cv.boundingRect(cnt);

      currentDetections.push({ cx, cy, area: Math.round(area), rect });
    }
  }

  // Update Object Tracking Logic (Centroid Match)
  updateTracking(currentDetections);

  // Render Graphical Overlays
  renderHUD(src);

  // Cleanup OpenCV WASM Memory Allocation
  src.delete(); gray.delete(); blur.delete(); thresh.delete(); contours.delete(); hierarchy.delete();

  if (streaming) {
    requestAnimationFrame(processVideoFrame);
  }
}

// Centroid Tracking Algorithm for Consistent ID Maintenance
function updateTracking(detections) {
  let updatedGrains = [];

  detections.forEach(det => {
    let bestMatch = null;
    let minDistance = Infinity;

    // Distance comparison against existing tracked objects
    trackedGrains.forEach(grain => {
      let dist = Math.hypot(grain.cx - det.cx, grain.cy - det.cy);
      if (dist < minDistance && dist < DIST_THRESHOLD) {
        minDistance = dist;
        bestMatch = grain;
      }
    });

    if (bestMatch) {
      // Retain identity and update coordinates
      updatedGrains.push({
        ...bestMatch,
        cx: det.cx,
        cy: det.cy,
        area: det.area,
        rect: det.rect
      });
      // Mark as re-matched
      bestMatch._matched = true;
    } else {
      // Assign new identity
      updatedGrains.push({
        id: nextGrainId++,
        cx: det.cx,
        cy: det.cy,
        area: det.area,
        rect: det.rect,
        owner: null,
        score: (85 + Math.random() * 14.9).toFixed(1) // Serious-looking pseudo confidence score
      });
    }
  });

  trackedGrains = updatedGrains;
  updateMetricsHUD();
}

// Visual HUD Canvas Renderer
function renderHUD(srcMat) {
  // Draw base frame onto canvas
  cv.imshow(canvas, srcMat);

  // Overlay HUD Elements
  trackedGrains.forEach(grain => {
    const isSelected = grain.id === selectedGrainId;
    
    // Bounding Box / Marker styling
    ctx.lineWidth = isSelected ? 3 : 1.5;
    ctx.strokeStyle = isSelected ? '#3b82f6' : (grain.owner ? '#10b981' : '#f59e0b');
    
    // Draw Bounding Rect
    ctx.strokeRect(grain.rect.x, grain.rect.y, grain.rect.width, grain.rect.height);

    // Label Text
    ctx.fillStyle = ctx.strokeStyle;
    ctx.font = '10px monospace';
    const label = `#${String(grain.id).padStart(3, '0')} ${grain.owner ? '[' + grain.owner + ']' : ''}`;
    ctx.fillText(label, grain.rect.x, grain.rect.y - 4);
  });
}

// Click Detection: Select Nearest Grain
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  
  const clickX = (e.clientX - rect.left) * scaleX;
  const clickY = (e.clientY - rect.top) * scaleY;

  let closestGrain = null;
  let minDistance = 30; // Radius tolerance

  trackedGrains.forEach(grain => {
    let dist = Math.hypot(grain.cx - clickX, grain.cy - clickY);
    if (dist < minDistance) {
      minDistance = dist;
      closestGrain = grain;
    }
  });

  if (closestGrain) {
    selectedGrainId = closestGrain.id;
    updateInspectorHUD(closestGrain);
    logEvent(`Grain #${closestGrain.id} isolated and selected.`);
    speak(`Grain number ${closestGrain.id} selected.`);
  }
});

// Ownership Claim System
function claimGrain() {
  if (!selectedGrainId) {
    alert("CRITICAL ERROR: No target grain selected.");
    return;
  }

  let grain = trackedGrains.find(g => g.id === selectedGrainId);
  if (grain) {
    const ownerName = document.getElementById('ownerSelect').value;
    grain.owner = ownerName;
    updateInspectorHUD(grain);
    updateMetricsHUD();
    logEvent(`Grain #${grain.id} assigned to ${ownerName}. Destiny fulfilled.`);
    speak(`Grain number ${grain.id} has found its destiny. It belongs to ${ownerName}.`);
  }
}

// Text to Speech
function speak(text) {
  if (!voiceEnabled || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); // Stop prior speech
  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 0.95; // Slightly authoritative cadence
  msg.pitch = 1.0;
  window.speechSynthesis.speak(msg);
}

function toggleVoice() {
  voiceEnabled = !voiceEnabled;
  document.getElementById('voiceStatus').innerText = voiceEnabled ? "ON" : "OFF";
  document.getElementById('voiceStatus').className = voiceEnabled ? "text-emerald-400" : "text-red-400";
}

// UI Helpers
function updateMetricsHUD() {
  const total = trackedGrains.length;
  const claimed = trackedGrains.filter(g => g.owner !== null).length;
  
  document.getElementById('stat-detected').innerText = total;
  document.getElementById('stat-assigned').innerText = claimed;
  document.getElementById('stat-unassigned').innerText = total - claimed;
}

function updateInspectorHUD(grain) {
  document.getElementById('prof-id').innerText = `#${String(grain.id).padStart(3, '0')}`;
  document.getElementById('prof-status').innerText = grain.owner ? "CLAIMED" : "UNBOUND";
  document.getElementById('prof-status').className = grain.owner ? "text-emerald-400 font-bold" : "text-amber-400 font-bold";
  document.getElementById('prof-owner').innerText = grain.owner ? grain.owner : "—";
  document.getElementById('prof-area').innerText = `${grain.area} px²`;
  document.getElementById('prof-score').innerText = `${grain.score}%`;
}

function logEvent(msg) {
  const logBox = document.getElementById('systemLog');
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  const entry = document.createElement('div');
  entry.innerText = `[${time}] ${msg}`;
  logBox.appendChild(entry);
  logBox.scrollTop = logBox.scrollHeight;
}

function confirmReset() {
  if (confirm("Are you sure you want to erase the destiny of all grains?")) {
    trackedGrains = [];
    nextGrainId = 1;
    selectedGrainId = null;
    logEvent("All grain identities and destinies purged.");
    updateMetricsHUD();
  }
}