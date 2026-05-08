from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import employee_routes, interview_routes, auth_routes
from routes import job_routes, candidate_routes, leave_routes, review_routes
from controllers.auth_controller import seed_admin

load_dotenv()

app = FastAPI(title="HR Recruiter API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed default admin on startup
@app.on_event("startup")
def startup():
    seed_admin()

# ── ROUTES ──
app.include_router(auth_routes.router,       prefix="/api/auth",       tags=["Auth"])
app.include_router(employee_routes.router,   prefix="/api/employees",  tags=["Employees"])
app.include_router(interview_routes.router,  prefix="/api/interviews", tags=["Interviews"])
app.include_router(job_routes.router,        prefix="/api/jobs",       tags=["Jobs"])
app.include_router(candidate_routes.router,  prefix="/api/candidates", tags=["Candidates"])
app.include_router(leave_routes.router,      prefix="/api/leaves",     tags=["Leaves"])
app.include_router(review_routes.router,     prefix="/api/reviews",    tags=["Reviews"])

@app.get("/api/health")
def health():
    return {"success": True, "message": "🚀 HR Recruiter API v2 is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
