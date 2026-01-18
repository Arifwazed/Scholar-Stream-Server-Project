# 💰 Money Flow — Expense Tracker (Client)

![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-fast-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-utility--first-38BDF8)
![Firebase](https://img.shields.io/badge/Firebase-Authentication-orange)
![Deployment](https://img.shields.io/badge/Deployed-Firebase-success)

---

📌 Project Overview

Money Flow is a modern expense tracking web application that allows users to record, manage, and analyze their income and expenses efficiently.

The application supports secure authentication, role-based access (Admin & User), interactive financial reports, and a clean responsive UI.

This repository contains the frontend (client-side) implementation built with React.

🔗 Live URL

Frontend (Firebase Hosting): https://money-flow.web.app

Backend API: https://money-flow-server-api.vercel.app

🏗️ System Architecture

Client (React + Vite)
→ REST API (HTTP)
→ Server (Node.js + Express)
→ MongoDB Atlas

The client handles UI rendering, authentication state, and user interactions.
The backend manages business logic, authorization, and database operations.

🛠️ Tech Stack
Frontend

React (JSX, Hooks, Context API)

Vite

Tailwind CSS

React Router DOM

Recharts

SweetAlert2

Authentication

Firebase Authentication

Deployment

Firebase Hosting

🚀 Core Features

User authentication using Firebase

Role-based access control (Admin & User)

Add, update, delete income and expense transactions

View transaction history

Admin dashboard with access to all users’ transactions

Interactive charts and financial reports

Sorting and filtering transactions

Responsive layout for all devices

Public pages: Home, About, Contact

🔌 Backend Integration

The frontend communicates with the backend through RESTful APIs.

Examples:

Fetch user-specific transactions using email

Admin-only routes for all transactions

Secure update and delete operations

Role verification handled by the server

Example API call:
fetch(/transactions?email=user@email.com)

📦 Dependencies

Main libraries used in this project:

react

react-router-dom

firebase

recharts

sweetalert2

tailwindcss

▶️ Run the Client Locally
1. Clone the Repository

git clone https://github.com/your-username/money-flow-client.git

cd money-flow-client

2. Install Dependencies

npm install

3. Set Environment Variables

Create a .env file in the root directory and add:

VITE_apiKey=your_firebase_api_key
VITE_authDomain=your_firebase_auth_domain
VITE_projectId=your_firebase_project_id
VITE_storageBucket=your_firebase_storage_bucket
VITE_messagingSenderId=your_firebase_sender_id
VITE_appId=your_firebase_app_id

4. Run the Project

npm run dev

🖼️ Screenshots

Add screenshots in a screenshots folder and reference them like this:








👨‍💻 Developer

MD Arif Wazed Hossain
MERN Stack Developer | Frontend Focused
GitHub: https://github.com/arifwazed
