[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/YHSq4TPZ)
# To-Do App – Preliminary Assignment Submission
⚠️ Please complete **all sections marked with the ✍️ icon** — these are required for your submission.

👀 Please Check ASSIGNMENT.md file in this repository for assignment requirements.

## 🚀 Project Setup & Usage
**How to install and run your project:**  
✍️  
Example (replace with your actual steps)  
- `npm install`  
- `npm run dev`

## 🔗 Deployed Web URL or APK file
✍️ http://karlkarl.io.vn/


## 🎥 Demo Video
**Demo video link (≤ 2 minutes):**  
📌 **Video Upload Guideline:** when uploading your demo video to YouTube, please set the visibility to **Unlisted**.  
- “Unlisted” videos can only be viewed by users who have the link.  
- The video will not appear in search results or on your channel.  
- Share the link in your README so mentors can access it.  

✍️ https://youtu.be/JN74txmOxtY


## 💻 Project Introduction

### a. Overview

✍️ This project, **TaskMaster**, is a comprehensive productivity application designed for students and professionals. It goes beyond a simple to-do list by integrating three core modules: **AI-powered Task Management**, an **Advanced Schedule Planner (Timetable)**, and an **Analytics Dashboard**.

The application leverages Firebase for its backend, providing real-time data synchronization and robust user authentication. The user interface is built with React and TypeScript, featuring a modern, responsive design with both light and dark themes to ensure a comfortable user experience across all devices.

### b. Key Features & Function Manual

✍️ The application is designed to be intuitive, but here is a breakdown of its key features:

  * **User Authentication**: Secure user registration and login system. New users are automatically provided with a set of default task categories (e.g., 'Homework', 'Sport') to get started quickly.
  * **AI-Powered Task Creation**: Users can add tasks using natural language. For instance, typing "Submit the history essay tomorrow at 5 PM" will be automatically parsed by the Gemini AI into a structured task with the correct title, date, and time.
  * **Advanced Schedule Planner**: This is a powerful timetable management system.
      * **Create Subjects**: Users can add courses or recurring events, specifying details like course code, instructor, location, and a unique color for easy identification.
      * **Multiple Time Slots**: Each subject can have multiple weekly time slots (e.g., a lecture on Monday and a lab on Wednesday).
      * **Date Range Duplication**: Subjects can be defined for a specific period (e.g., a semester from "2024-09-01" to "2024-12-15"), and the app will automatically generate all the individual class sessions within that range.
  * **Conflict Detection**: The system automatically checks for scheduling conflicts between different subjects or between a subject and a scheduled task, helping users avoid double-booking themselves.
  * **Responsive Design & Theming**: The app features a clean, responsive layout that works on desktops, tablets, and mobile phones. Users can switch between a light and dark theme for their viewing preference.

### c. Unique Features (What’s special about this app?) 

✍️   * **Natural Language Processing (NLP) for Task Entry**: The integration with the **Google Gemini API** is a standout feature. It removes the friction of filling out forms by allowing users to create tasks conversationally, making the app faster and more intuitive to use than traditional to-do applications.
  * **Integrated Schedule and Task Management**: Unlike apps that handle either tasks or schedules, TaskMaster combines both. Its most powerful feature is the **automatic conflict detection** not just between classes, but also between classes and one-off tasks, providing a holistic view of a user's commitments.
  * **Automated Session Generation**: The feature to duplicate a subject across a date range (e.g., an entire semester) saves users a significant amount of manual data entry required to set up their academic or work schedule.


### d. Technology Stack and Implementation Methods

✍️   * **Frontend**:
      * **Framework/Library**: React, TypeScript
      * **UI Components**: Ant Design
      * **Routing**: React Router
      * **Build Tool**: Vite
  * **Backend (BaaS)**:
      * **Database**: Google Firestore (a NoSQL, real-time database)
      * **Authentication**: Firebase Authentication
  * **AI Integration**:
      * **Service**: Google Generative AI (Gemini API) for natural language understanding and task parsing.
  * **Styling**:
      * CSS with Custom Properties (Variables) for easy theming (light/dark mode).

### e. Service Architecture & Database structure (when used)

✍️ The application uses a **Backend-as-a-Service (BaaS)** architecture with a React single-page application (SPA) as the client. The client communicates directly with Firebase services, which handle the backend logic.

**Firestore Database Structure:**

The database is structured in a NoSQL format to be scalable and flexible.

  * `users/{userId}`: Stores public user profile information.
      * `uid`, `email`, `username`, `name`, `createdAt`
  * `subjects/{subjectId}`: A top-level collection for all subjects created by users.
      * `userId`, `name`, `code`, `color`, `timeSlots[]`, `semester`, `fromDate`, `toDate`
  * `classSessions/{sessionId}`: A collection for every individual occurrence of a class, generated from a subject's date range.
      * `subjectId`, `userId`, `date`, `timeSlot`, `attended`, `notes`
  * `scheduleTemplates/{templateId}`: Stores user-created schedule templates for reuse.
      * `userId`, `name`, `subjects[]`

-----

## 🧠 Reflection

### a. If you had more time, what would you expand?

✍️ 1.  **Implement the Analytics Dashboard**: Build out the `/dashboard` page to provide users with visualizations of their productivity, such as task completion rates by category, hours spent per subject, and attendance tracking.
2.  **Add Notifications**: Integrate a notification system (e.g., using Firebase Cloud Messaging) to send users reminders for upcoming tasks and classes.
3.  **Improve Offline Capabilities**: Use service workers to cache application data, allowing users to view their schedule and tasks even when they are offline. Changes made offline would sync automatically when the connection is restored.
4.  **Collaboration Features**: Introduce the ability for users to share a task list or a schedule with others, which would be useful for group projects or team planning.


### b. If you integrate AI APIs more for your app, what would you do?

✍️ I would deepen the AI integration to make the application a proactive assistant rather than just a reactive tool:

1.  **AI-Powered Smart Scheduling**: Develop a feature where a user can ask, "Find a time for me to study for 2 hours for my CS101 exam next week." The AI would analyze their existing timetable and task list to find and suggest optimal, conflict-free time slots.
2.  **Automatic Task Breakdown**: Allow users to input a large project or goal, like "Write a 10-page research paper." The AI could break this down into smaller, actionable sub-tasks (e.g., "Research topic," "Create outline," "Write first draft") and help schedule them.
3.  **Productivity Insights**: Use AI to analyze a user's habits and provide personalized recommendations. For example, it might notice that tasks scheduled on Sunday evenings are frequently postponed and suggest moving them to a more productive time for the user.
4.  **Enhanced Conversational AI**: Expand the AI from a simple parser to a full conversational assistant. Users could ask follow-up questions, modify tasks ("Change my meeting to 3 PM"), and query their schedule ("What do I have on my plate for this Friday?").

-----



## ✅ Checklist
  - [x] Code runs without errors
  - [x] All required features implemented (add/edit/delete/complete tasks)
  - [x] All ✍️ sections are filled
