# 💰 Money Flow — Expense Tracker (Client)

![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-fast-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-utility--first-38BDF8)
![Firebase](https://img.shields.io/badge/Firebase-Authentication-orange)
![Deployment](https://img.shields.io/badge/Deployed-Firebase-success)

---

📌 Project Overview

Money Flow is a modern expense tracking web application that helps users manage income and expenses efficiently.
It provides secure authentication, role-based access control, interactive financial insights, and a clean responsive UI.

This repository contains the client-side (frontend) implementation.

🔗 Live URL

Frontend: https://money-flow.web.app

Backend API: https://money-flow-server-api.vercel.app

🏗️ System Architecture

Client (React + Vite)
→ REST API
→ Server (Node.js + Express)
→ MongoDB Atlas

The frontend handles UI rendering, authentication state, and user interactions.
The backend manages authorization, business logic, and database operations.

🛠️ Tech Stack
Frontend

React

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

User authentication with Firebase

Role-based access (Admin & User)

Add, update, delete income and expense transactions

View transaction history

Admin access to all users’ transactions

Interactive charts and reports

Responsive UI

🔌 Backend Integration

The frontend communicates with the backend using REST APIs.

GET /transactions?email=user@email.com

PATCH /transactions/:id

DELETE /transactions/:id

📦 Dependencies

react

react-router-dom

firebase

recharts

sweetalert2

tailwindcss

▶️ Run the Client Locally
Clone the Repository

git clone https://github.com/your-username/money-flow-client.git

cd money-flow-client

Install Dependencies

npm install

Environment Variables

Create a .env file in the root directory:

VITE_apiKey=your_firebase_api_key
VITE_authDomain=your_firebase_auth_domain
VITE_projectId=your_firebase_project_id
VITE_storageBucket=your_firebase_storage_bucket
VITE_messagingSenderId=your_firebase_sender_id
VITE_appId=your_firebase_app_id

Run the Project

npm run dev

🖼️ Screenshots






👨‍💻 Developer

MD Arif Wazed Hossain
MERN Stack Developer | Frontend Focused

GitHub: https://github.com/arifwazed
