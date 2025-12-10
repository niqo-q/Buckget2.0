"""
Application configuration using Pydantic Settings.
Loads from environment variables or .env file.
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    app_name: str = "BuckGet API"
    debug: bool = True
    secret_key: str = "your-super-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # TiDB Database Connection
    tidb_host: str = "gateway01.us-west-2.prod.aws.tidbcloud.com"
    tidb_port: int = 4000
    tidb_user: str = "buckget_user"
    tidb_password: str = ""
    tidb_database: str = "buckget"
    
    # Direct database URL (optional - overrides TiDB settings)
    database_url: Optional[str] = None
    
    # Google Gemini API Key (for AI Agent)
    gemini_api_key: str = ""
    
    # Frontend URL (for CORS)
    frontend_url: str = "http://localhost:5173"
    
    # SSL CA Certificate path (optional for TiDB)
    ssl_ca_path: str = ""
    
    @property
    def db_url(self) -> str:
        """Get database URL - either direct or constructed from TiDB settings."""
        if self.database_url:
            return self.database_url
        
        # Base TiDB connection URL
        url = (
            f"mysql+pymysql://{self.tidb_user}:{self.tidb_password}"
            f"@{self.tidb_host}:{self.tidb_port}/{self.tidb_database}"
        )
        
        # Add SSL parameters for TiDB Serverless
        if self.ssl_ca_path:
            # Use specific CA cert if provided
            url += f"?ssl_ca={self.ssl_ca_path}"
        else:
            # Enable SSL without cert verification (works for most TiDB setups)
            url += "?ssl=true"
        
        return url
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Create global settings instance
settings = Settings()

