<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# Rice Destiny 


## Basic Details
### Team Name: Infinix


### Team Members
- Team Lead : Sandra M C - Mar Athanasius College of Engineering, Kothamangalam
- Member 2 :Joanna Mariyam Raju - Mar Athanasius College of Engineering, Kothamangalam

### Project Description
RiceDestiny is a fun rice detection and “destiny assignment” web app that uses your camera or uploaded image to identify individual rice grains, track them, and randomly decide who gets to eat them. Because, Lalettan said: “ഓരോ അരിമണിയിലും അത് കഴിക്കേണ്ട ആളുടെ പേരുണ്ട്!” 
Scan the rice, add the names, and let GrainDestiny reveal the ultimate fate of every grain. 💀✨

### The Problem (that doesn't exist)

Have you ever stared at a rice grain and thought, “Who does this tiny carbohydrate belong to?” In a world where rice grains are constantly separated from their destined humans, dining-table identity crises are becoming a completely imaginary emergency.

### The Solution (that nobody asked for)
Rice Destiny uses advanced-ish image processing to detect rice grains and a completely unnecessary random destiny engine to decide which person each grain belongs to. Add names, scan some rice, and discover who the rice gods have chosen!

## Technical Details
### Technologies/Components Used
For Software:
JavaScript (vanilla, no frameworks)
HTML5 / CSS3
Canvas API — getImageData, flood-fill blob detection, frame-to-frame grain tracking
MediaDevices getUserMedia — live camera feed
Web Speech API (SpeechSynthesis) — voice announcements
Single-file app, no build tools required

### Implementation
For Software:
The application uses browser-based image processing to identify bright, low-saturation regions that resemble rice grains. It filters regions based on size and shape, tracks detected grains, and displays their information in a dashboard.
The destiny assignment system randomly selects a registered person and assigns all detected grains in the current frame to that person.

# Installation
Clone the repository:

git clone https://github.com/Joanna-07/RiceDestiny.git

Open the project folder in VS Code.

Open index.html in a browser.

# Run
1. Open the index.html file in a modern browser (like Chrome).
2. Enter the names of the participants.
3. Click "Start Camera".
4. Point the camera at the scattered grains of rice.
5. Watch the magic happen as your destined grains get discovered!

### Project Documentation
For Software:

# Screenshots (Add at least 3)
![Screenshot1](SS1.png)
A screenshot showing the main interface where participants can add their names and image of rice.


![Screenshot2](SS2.png)
Uploaded rice image with 22 grains detected and highlighted individually.

![Screenshot3](SS3.png)


![Screenshot4](SS4.png)
Rice Destiny assigns all 22 detected grains to Sandra and displays the assignment details in the diagnostic log and grain registry.

# Diagrams
![Workflow](workflow.png)
This diagram illustrates the project's workflow, from user input to OpenCV detection and voice output.


### Project Demo
# Video
[Demo Video](https://drive.google.com/file/d/1fSQtICxVKDe06YUtW6tNCAdTspaBQOLI/view?usp=drive_link)
This video demonstrates the full functionality of the Rice Destiny application, from adding participants to grain detection and the voice feature.


## Team Contributions
- Sandra M C:  Implemented the computer vision logic for grain detection and tracking. Contributed to the front-end structure and functionality.
- Joanna Mariyam Raju : Implemented the Web Speech API features, including the funny voice responses and multilingual support. Contributed to the front-end design, and wrote the project's README file.

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)



