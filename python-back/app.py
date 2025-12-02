from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import database utilities
from utils.database import init_db

# Import routers
from routes import auth, machines, components, csv_upload, failure_items

# Create FastAPI app
app = FastAPI(
    title="Factory Reliability API",
    description="Backend API for Factory Reliability Function application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        # Add production frontend URL here when deploying
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(machines.router)
app.include_router(components.router)
app.include_router(failure_items.router)
app.include_router(csv_upload.router)

@app.on_event("startup")
def on_startup():
    """
    Initialize database on startup.
    Creates tables if they don't exist.
    """
    print("🚀 Starting Factory Reliability API...")
    init_db()
    print("✓ Server is ready!")

@app.get("/")
def root():
    """
    Root endpoint - health check.
    """
    return {
        "message": "Factory Reliability API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn

    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))

    uvicorn.run(
        "app:app",
        host=HOST,
        port=PORT,
        reload=True  # Auto-reload on code changes (development only)
    )
