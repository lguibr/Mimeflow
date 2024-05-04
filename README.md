# Mime Flow 🕺💃

Welcome to **Mime Flow**! This alpha version of our versatile pose matching application lets you engage interactively to practice and perfect your poses across various disciplines, from dance to martial arts, and yoga. Powered by cutting-edge technology, it's designed to adapt to your skills, helping you refine your movements with precision.

### How to Play:

1. **Start at the Homepage:** Drag and drop a video file to begin. Supported formats include commonly used video types.
2. **Automatic Redirection:** Once the file is loaded, you'll be redirected to the playback page.
3. **Track and Score:** As you mimic the poses in the video, the system tracks each pose's accuracy, scoring them from 0 to 1.
4. **Final Score:** After the video ends, you'll automatically be taken to the score page to view your cumulative score, which is the sum of all frame scores throughout the session.

### Origin Story:

Mime Flow began as an innovation to overcome the limitations of traditional systems like Kinect and Just Dance, which were constrained by outdated games and music. Inspired by the need for a more adaptable and modern approach to pose matching, this project evolved from enhancing dance sessions to supporting a broad spectrum of physical activities.

### Key Features:

- **Universal Pose Matching:** Leverages TensorFlow.js with BlazePose for real-time feedback on a wide variety of physical activities. 🌟
- **Progress Tracking:** Every move is scored based on its accuracy, helping you improve by understanding your performance in real time. 📊
- **Seamless User Experience:** React and Next.js provide a fluid, responsive interface that enhances your interaction without complexity. 🌐

### Alpha Version Note:

Please note that this is the initial alpha version of Mime Flow. We encourage users to report any issues and contribute to the development. Your feedback is invaluable as we continue to enhance and expand Mime Flow's capabilities.

### Getting Started:

Set up Mime Flow on your local system with these simple steps:

1. **Clone the repository:**
   ```
   git clone https://github.com/lguibr/Mimeflow.git
   ```
2. **Navigate to the project directory:**
   ```
   cd Mimeflow
   ```
3. **Install dependencies:**
   ```
   yarn
   ```
4. **Launch the development server:**
   ```
   yarn dev
   ```

### Technologies Used:

- **Frontend:** React, Next.js, Styled Components
- **Pose Estimation:** TensorFlow.js, BlazePose
- **State Management:** React Context API

### Pose Similarity Calculation

Our enhanced pose similarity calculation method uses detailed features for a more precise assessment, crucial for various real-world applications. Key aspects include:

- **Centralize axis in user center**: Uses the center point between shoulders and hips as origin of the coordinates to improve the propagation of poses.
- **Cosine Similarity in a Five-Dimensional Vector**: We analyze positions and angles of connected 3D points in spherical coordinates.
- **Weighted by Model Confidence**: Feature weighting is adjusted by the model’s confidence score on a normalized scale from 0 to 1.
- **Sigmoid Transformation for Human Stances**: A sigmoid transformation, centered at 0.8 with a curvature of 8, emphasizes similarities in typical human stances, such as standing, enhancing match accuracy and reducing noise.

### Enhanced UI Features

Our user interface offers engaging features for an enhanced interaction experience:

- **Stars Spherical Panorama**: Navigate a panoramic view using various controls, featuring dynamic, light-reflecting spheres for visual appeal.
- **3D Pose Drawing Using WebGL**: Visualize poses in 3D with helpful guides like axis and a cubic grid, supporting webcam and video tracked poses.
- **Dynamic Coloring and Sketching**: Colors for sketches are generated using Perlin noise for a natural look.
- **2D Overlay Sketch**: Enhances visibility and understanding of poses with an additional sketch layer.

### Performance and Dynamic Frame Ratio

Optimized for devices of all specifications, our app adapts its performance dynamically:

- **Dynamic Frame Handling**: Starts with a 1:1 frame processing ratio and adjusts based on device capability to maintain optimal performance.
- **Non-Blocking Video Performance**: Ensures responsiveness, even on lower-spec devices.
- **Optimized Rendering Technologies**: Prioritizes WebGPU, with fallbacks to WebAssembly and WebGL, supported by MediaPipe and TensorFlow.js for efficiency.

### Security and Offline Capability

We prioritize security with all processing done locally, offering offline functionality:

- **Client-Side Processing**: No data leaves your device, ensuring privacy and reducing latency.
- **Offline Functionality**: Operates as a Progressive Web App (PWA), functional without an internet connection and easily accessible from your device’s home screen.

By leveraging advanced web technologies, our application ensures a secure, responsive, and user-friendly experience for all users.

### Contributing:

Mime Flow is still in its early stages, and we are open to all contributions! If you have ideas on how to improve it, please fork the project, make your changes, and submit a pull request. Don't hesitate to create issues if you encounter any problems. Your involvement truly makes a difference!

### License:

Mime Flow is distributed under the MIT License. See the [LICENSE](LICENSE) file for more information.
