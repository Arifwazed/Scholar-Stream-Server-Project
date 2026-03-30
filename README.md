# 💰 Money Flow — Expense Tracker (Client)

![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-fast-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-utility--first-38BDF8)
![Firebase](https://img.shields.io/badge/Firebase-Authentication-orange)
![Deployment](https://img.shields.io/badge/Deployed-Firebase-success)

---

# 🎓 Scholar Stream — Backend Server

A scalable and secure backend service for the **Scholar Stream** platform, designed to manage scholarships, users, applications, and reviews.

🔗 **Live API:** https://your-backend-url.vercel.app  

---

## 🧠 Overview

This backend powers a full-stack scholarship management system where users can explore, apply, and manage scholarships based on their roles (**Student, Moderator, Admin**).

It follows a **RESTful API architecture** with role-based access control and optimized database queries.

---

## 🔗 Live URL

- **Frontend:** [https://money-flow.web.app](https://money-flow.web.app)  
- **Backend API:** [https://money-flow-server-api.vercel.app](https://money-flow-server-api.vercel.app)

---
---

## ⚙️ Tech Stack

| Technology | Purpose |
|-----------|--------|
| Node.js | Runtime environment |
| Express.js | Backend framework |
| MongoDB | Database |
| Firebase Admin / JWT | Authentication & Authorization |
| Vercel | Deployment |

---

## 🔐 Key Features

### 👤 User Management
- Role-based system: **Student / Moderator / Admin**
- Promote and demote users dynamically
- Secure user deletion

### 🎓 Scholarship Management
- Add, update, and delete scholarships
- Categorization (Full Fund, Partial, Self Fund)
- Deadline and eligibility tracking

### 📄 Application System
- Students can apply for scholarships
- Moderators manage applications
- Application status updates

### ⭐ Review System
- Users can submit reviews
- Moderators can manage and control reviews

### 🔍 Search & Filter
- Search users by **name or email**
- Filter users by role
- Optimized MongoDB queries using `$regex`

### 🛡️ Security
- Protected API routes
- Environment-based configuration
- CORS handling for frontend integration

---

## 📡 API Endpoints (Sample)

### 🔹 Users
  GET /users → Get all users (with search & filter)

  PATCH /users/:id/role → Update user role

  DELETE /users/:id → Remove user

### 🔹 Scholarships
GET /scholarships

POST /scholarships

PATCH /scholarships/:id

DELETE /scholarships/:id

### 🔹 Applications
GET /applications

POST /applications

PATCH /applications/:id

---

## 🧪 Query Example

GET /users?search=arif&role=Admin
✔️ Supports:

Case-insensitive search

Multi-field search (name, email)
---

## 📁 Project Structure
backend/
│
├── index.js # Main server file
├── routes/ # API routes (optional)
├── middleware/ # Auth / role middleware (optional)
├── vercel.json # Vercel configuration
├── package.json
└── .env # Environment variables

---

## 🔑 Environment Variables

Create a '.env' file in the root:

--- env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
⚠️ Never expose .env in public repositories
---

## ▶️ Run Locally

```bash
npm install
npm run dev
🌐 Deployment

This backend is deployed using Vercel (Serverless Functions).

Deploy manually:
vercel --prod
🔗 Frontend Integration

Make sure your frontend uses:
baseURL: "https://your-backend-url.vercel.app"
🔒 CORS Configuration
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-frontend.web.app"
  ],
  credentials: true
}));
---

## 👨‍💻 Author

**Arif Wazed Hossain**  
🔗 GitHub: https://github.com/your-username  

---

## 📌 Highlights

✔️ Production-ready backend  
✔️ Clean REST API design  
✔️ Role-based authorization system  
✔️ Real-world project structure  

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub — it helps a lot!







## 🏗️ System Architecture

Client (React + Vite)
↓
REST API
↓
Server (Node.js + Express)
↓
MongoDB Atlas

The frontend handles **UI rendering**, **authentication state**, and **user interactions**.  
The backend manages **authorization**, **business logic**, and **database operations**.

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router DOM
- Recharts
- SweetAlert2

### Authentication
- Firebase Authentication

### Deployment
- Firebase Hosting

---

## 🚀 Core Features

- User authentication with Firebase  
- Role-based access (**Admin** & **User**)  
- Add, update, delete income and expense transactions  
- View transaction history  
- Admin access to all users’ transactions  
- Interactive charts and reports  
- Responsive UI  

---

## 🔌 Backend Integration

The frontend communicates with the backend using **REST APIs**:

- `GET /transactions?email=user@email.com` — Get user transactions  
- `PATCH /transactions/:id` — Update transaction  
- `DELETE /transactions/:id` — Delete transaction  

---

## 📦 Dependencies

- react  
- react-router-dom  
- firebase  
- recharts  
- sweetalert2  
- tailwindcss  

---

## ▶️ Run the Client Locally

### Clone the Repository

```bash
git clone https://github.com/your-username/money-flow-client.git
cd money-flow-client
