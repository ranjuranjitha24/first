<<<<<<< HEAD
# 🚀 HR Recruiter Pro — Full Stack Setup

## Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017)

## 🚀 Deployment

### Backend (Render)
1. Create a new **Web Service** on Render.
2. Connect your repository.
3. Set **Build Command**: `pip install -r backend/requirements.txt`
4. Set **Start Command**: `cd backend && gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT`
5. Add Environment Variables:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `PORT`: `5000`

### Frontend (Vercel)
1. Create a new **Project** on Vercel.
2. Select the `frontend` directory.
3. Set **Framework Preset**: `Vite`.
4. Add Environment Variable:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://hr-backend.onrender.com`).

---

## 🛠️ Tech Stack

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
