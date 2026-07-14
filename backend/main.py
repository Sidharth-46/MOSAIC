from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings

from routers import dashboard, cases, analytics, misc, predictions, copilot
from database.connection import engine, Base

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB (In a real app, use alembic for migrations)
@app.on_event("startup")
async def startup():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"Warning: Could not connect to local database during startup: {e}")
        print("Continuing with Catalyst / Mock endpoints.")

# Mount routers
from routers import dashboard, cases, analytics, misc, predictions, copilot, masters, geo, auth

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["dashboard"])
app.include_router(cases.router, prefix=f"{settings.API_V1_STR}/cases", tags=["cases"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(predictions.router, prefix=f"{settings.API_V1_STR}/predictions", tags=["predictions"])
app.include_router(copilot.router, prefix=f"{settings.API_V1_STR}/copilot", tags=["copilot"])
app.include_router(masters.router, prefix=settings.API_V1_STR, tags=["masters"])
app.include_router(geo.router, prefix=f"{settings.API_V1_STR}/geo", tags=["geo"])
app.include_router(misc.router, prefix=f"{settings.API_V1_STR}/misc", tags=["misc"])

@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}"}
