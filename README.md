<<<<<<< HEAD
# 🚀 HR Recruiter Pro — Full Stack Setup

## Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017)

---

## ▶️ Step 1 — Install Backend
```bash
cd "c:\hr recruiter\backend"
npm install
```

## ▶️ Step 2 — Install Frontend
```bash
cd "c:\hr recruiter\frontend"
npm install
```

## ▶️ Step 3 — Start Backend (Terminal 1)
```bash
cd "c:\hr recruiter\backend"
npm run dev
# Server: http://localhost:5000
```

## ▶️ Step 4 — Start Frontend (Terminal 2)
```bash
cd "c:\hr recruiter\frontend"
npm run dev
# App: http://localhost:5173
```

---

## 🌐 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/employees | Get all employees |
| POST | /api/employees | Add employee |
| PUT | /api/employees/:id | Update employee |
| DELETE | /api/employees/:id | Delete employee |
| GET | /api/employees/stats | Dashboard stats |
| GET | /api/interviews | Get all interviews |
| GET | /api/interviews/upcoming | Upcoming scheduled |
| POST | /api/interviews | Schedule interview |
| PUT | /api/interviews/:id | Update status |
| DELETE | /api/interviews/:id | Delete interview |

## 📁 Structure
```
hr-management-system/
├── frontend/   → React + Vite (port 5173)
└── backend/    → Node + Express + MongoDB (port 5000)
```
=======
# first
Flask-based student attendance tracking system with real-time login/logout capture and SQLite database. Supports 500+ students with cloud deployment.
>>>>>>> a667ae8f90f7c92cb399d4dfd6e9f0b595cb1518
