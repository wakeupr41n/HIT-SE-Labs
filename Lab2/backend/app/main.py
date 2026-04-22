from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pathlib
import os

from dotenv import load_dotenv
load_dotenv()

from .database import engine, Base
from .routers import users, health, ai, reminders, reports

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="办公室健康监测系统",
    description="基于 AI 的办公室员工健康监测与建议系统",
    version="1.0.0",
)

# CORS - allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(health.router)
app.include_router(ai.router)
app.include_router(reminders.router)
app.include_router(reports.router)

# --- Static File Serving (for First Iteration Demo) ---
# Locate the frontend/dist directory explicitly matching the project structure
_app_file = pathlib.Path(__file__).resolve()
# backend/app/main.py -> backend/app -> backend -> Lab2 -> frontend/dist
frontend_dist = _app_file.parent.parent.parent / "frontend" / "dist"

if frontend_dist.exists():
    # Serve static assets (js, css, images) from /assets
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Serve index.html for all other routes (SPA support)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            return {"error": "Not Found"}
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"error": "Frontend build (index.html) not found"}

@app.get("/")
def root():
    index_path = frontend_dist / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return {
        "message": "Aura API Online", 
        "debug_info": {
            "resolved_dist_path": str(frontend_dist.resolve()),
            "index_exists": index_path.exists(),
            "cwd": os.getcwd()
        }
    }
