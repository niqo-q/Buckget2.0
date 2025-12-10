"""
BuckGet API - FastAPI Backend
Main application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .database import init_db
from .routers import auth, users, buckets, transactions, roles, settings as settings_router, ai_agent


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Runs on startup and shutdown.
    """
    # Startup
    print(f"🚀 Starting {settings.app_name}...")
    
    # Initialize database tables
    try:
        init_db()
        print("✅ Database initialized")
    except Exception as e:
        print(f"⚠️ Database initialization skipped: {e}")
        print("   Make sure to configure your database connection!")
    
    yield
    
    # Shutdown
    print(f"👋 Shutting down {settings.app_name}...")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="""
    BuckGet API - Your Financial Copilot
    
    A fintech API for managing wages, savings buckets, and getting AI-powered financial advice.
    
    ## Features
    
    - 🔐 JWT Authentication
    - 💰 Wallet Management
    - 🪣 Savings Buckets (Goals)
    - 💸 Transaction Tracking
    - 🤖 AI Financial Advisor
    - 👥 User Management
    - 🔑 Role-Based Access Control
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_url,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(buckets.router)
app.include_router(transactions.router)
app.include_router(roles.router)
app.include_router(settings_router.router)
app.include_router(ai_agent.router)


@app.get("/")
async def root():
    """Root endpoint - API information."""
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/api")
async def api_info():
    """API information endpoint."""
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "users": "/api/users",
            "buckets": "/api/buckets",
            "transactions": "/api/transactions",
            "roles": "/api/roles",
            "settings": "/api/settings",
            "ai_agent": "/api/ai-agent"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )

