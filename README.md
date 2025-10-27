# TaskMaster - AI-Powered Productivity App

**TaskMaster** is a comprehensive productivity application designed to help students and professionals manage their tasks, schedules, and analyze their productivity patterns. It integrates AI-powered task management, an advanced schedule planner, and an analytics dashboard into a seamless experience.

---

## ✨ Key Features

* **User Authentication**: Secure registration and login system using Firebase Authentication. Default task categories are provided for new users.
* **AI-Powered Task Creation**: Add tasks using natural language (e.g., "Submit history essay tomorrow 5 PM"). The app uses the Google Gemini API to parse and structure the task automatically.
* **Advanced Schedule Planner (Timetable)**:
    * Create subjects/courses with details like code, instructor, location, and color-coding.
    * Assign multiple weekly time slots per subject.
    * Define a date range (e.g., a semester) for a subject, and the app automatically generates all individual sessions.
* **Conflict Detection**: Automatically checks for scheduling conflicts between subjects and tasks, preventing double-booking.
* **Analytics Dashboard**: (Planned Feature) Visualize productivity metrics like task completion rates and time spent per subject.
* **Responsive Design & Theming**: Clean UI built with Ant Design, adaptable to various screen sizes, featuring both light and dark themes.
* **Real-time Updates**: Leverages Firebase Firestore for real-time data synchronization across devices.
* **Focus Mode**: A dedicated timer to help users concentrate on specific tasks.
* **Notifications**: In-app notification system for updates and warnings (like schedule conflicts).

---

## 🛠️ Technology Stack

* **Frontend**: React, TypeScript, Vite
* **UI Library**: Ant Design
* **Routing**: React Router
* **State Management**: React Context API (for Auth, Theme, Loading, Notifications)
* **Backend (BaaS)**: Firebase (Authentication, Firestore Database)
* **AI Integration**: Google Generative AI (Gemini API)
* **Styling**: CSS with Custom Properties (for theming)

---

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

* Node.js (v18.0.0 or later recommended)
* npm (v8.0.0 or later recommended)
* A Firebase project set up with Authentication and Firestore enabled.

### Firebase Setup 🔥

1.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Authentication:** In your Firebase project, go to the "Authentication" section and enable the "Email/Password" sign-in method.
3.  **Enable Firestore:** Go to the "Firestore Database" section and create a database. Start in **test mode** for easier development (you can configure security rules later). Choose a server location.
4.  **Get Firebase Config:** In your Firebase project settings (⚙️ > Project settings), find your web app configuration details. It looks like this:
    ```javascript
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    ```
5.  **Update Project Config:** Open the `src/firebase.ts` file in the project. Replace the placeholder `firebaseConfig` object with your actual Firebase project configuration values. **Do not commit your actual API keys to a public repository!** Consider using environment variables for better security in a real-world scenario.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/WuWuyn/task-master.git.
    cd task-master
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
    This command reads the `package.json` and `package-lock.json` files to install all the necessary libraries.

### Running the Project

1.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This command uses Vite to start a local development server.
2.  **Open the app:** Open your web browser and navigate to the local URL provided in the terminal (usually `http://localhost:5173`).
