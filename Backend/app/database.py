"""
Database connection and session management for TiDB.
"""
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import QueuePool
import ssl
from .config import settings

# SSL configuration for TiDB Serverless
connect_args = {}
if "tidbcloud.com" in settings.tidb_host or settings.ssl_ca_path:
    # Enable SSL for TiDB Cloud connections
    ssl_context = ssl.create_default_context()
    if settings.ssl_ca_path:
        ssl_context.load_verify_locations(settings.ssl_ca_path)
    else:
        # For TiDB Serverless, we can use default system CA
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ssl_context

# Create engine with connection pooling
engine = create_engine(
    settings.db_url,
    poolclass=QueuePool,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=3600,   # Recycle connections after 1 hour
    echo=settings.debug,  # Log SQL in debug mode
    connect_args=connect_args,
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base class for ORM models
Base = declarative_base()


def get_db():
    """
    Dependency that provides a database session.
    Ensures the session is closed after request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables.
    Call this at application startup.
    """
    from . import models  # Import models to register them
    Base.metadata.create_all(bind=engine)

