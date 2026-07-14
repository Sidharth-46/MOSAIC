from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "MOSAIC API"
    VERSION: str = "2.4.1"
    DESCRIPTION: str = "Multi-source Observation System for Analytics, Intelligence & Crime"
    API_V1_STR: str = "/api/v1"
    
    # Use PostgreSQL for local development
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/mosaic"
    
    # Ingestion Layer Provider ('mock', 'csv', 'api', 'database')
    INGESTION_PROVIDER: str = "mock"

    class Config:
        case_sensitive = True

settings = Settings()
