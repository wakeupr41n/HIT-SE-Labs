from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pathlib
import os

# Manual .env parser to bypass pip install failures
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip().strip('"').strip("'")

from .database import engine, Base
from .routers import users, health, ai

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

# --- Static File Serving (for First Iteration Demo) ---
# Locate the frontend/dist directory
frontend_dist = pathlib.Path(__file__).parent.parent.parent / "frontend" / "dist"

if frontend_dist.exists():
    # Serve static assets (js, css, images) from /assets
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="assets")

    # Serve index.html for all other routes (SPA support)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Prevent catching API routes (though routers should take precedence)
        if full_path.startswith("api/"):
            return {"error": "Not Found"}
        return FileResponse(frontend_dist / "index.html")

@app.get("/")
def root():
    # If dist exists, serve frontend index, otherwise return API message
    if (frontend_dist / "index.html").exists():
        return FileResponse(frontend_dist / "index.html")
    return {"message": "办公室健康监测系统 API (Frontend dist not found)", "docs": "/docs"}
