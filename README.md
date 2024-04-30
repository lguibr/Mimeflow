# Mime Flow 🕺💃

Welcome to **Mime Flow**! This versatile pose matching application lets you engage in an interactive way to practice and perfect your poses across various disciplines, from dance to martial arts, and yoga. Powered by cutting-edge technology, it's designed to adapt to your skills, helping you refine your movements with precision.

### Origin Story:

Mime Flow began as an innovation to overcome the limitations of traditional systems like Kinect and Just Dance, which were constrained by outdated games and music. Inspired by the need for a more adaptable and modern approach to pose matching, this project evolved from enhancing dance sessions to supporting a broad spectrum of physical activities.

### Key Features:

- **Universal Pose Matching:** Leverages TensorFlow.js with BlazePose for real-time feedback on a wide variety of physical activities. 🌟
- **Progress Tracking:** Every move is scored based on its accuracy, helping you improve by understanding your performance in real time. 📊
- **Seamless User Experience:** React and Next.js provide a fluid, responsive interface that enhances your interaction without complexity. 🌐

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

### How to Play:

1. **Start at the Homepage:** Drag and drop a video file to begin. Supported formats include commonly used video types.
2. **Automatic Redirection:** Once the file is loaded, you'll be redirected to the playback page.
3. **Track and Score:** As you mimic the poses in the video, the system tracks each pose's accuracy, scoring them from 0 to 1.
4. **Final Score:** After the video ends, you'll automatically be taken to the score page to view your cumulative score, which is the sum of all frame scores throughout the session.

### Technologies Used:

- **Frontend:** React, Next.js, Styled Components
- **Pose Estimation:** TensorFlow.js, BlazePose
- **State Management:** React Context API

### Contributing:

Your contributions can help make Mime Flow even better! Fork the project, tweak it, and submit a pull request. We appreciate your input and engagement! 🌟

### License:

Mime Flow is distributed under the MIT License. See the `LICENSE` file for more information.
