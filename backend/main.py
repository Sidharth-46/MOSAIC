import os
import sys
import platform

# Use Linux vendored dependencies ONLY when deployed to Catalyst (Linux)
if platform.system() == 'Linux':
    vendor_dir = os.path.join(os.path.dirname(__file__), "vendor")
    sys.path.insert(0, vendor_dir)

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from config import settings

from routers import dashboard, cases, analytics, misc, predictions, copilot
from database.connection import engine, Base

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION
)



@app.middleware("http")
async def catalyst_initializer_middleware(request: Request, call_next):
    from catalyst_db.client import get_catalyst_client
    # Initialize the singleton with the request to guarantee AppSail has context
    get_catalyst_client(request=request)
    response = await call_next(request)
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    error_msg = str(exc)
    print(f"Global Error Caught: {error_msg}")
    print(traceback.format_exc())
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An internal server error occurred.",
            "error": error_msg,
            "path": request.url.path
        }
    )

@app.get("/list_tables")
async def list_tables(request: Request):
    import zcatalyst_sdk
    try:
        app = zcatalyst_sdk.initialize(req=request)
        tables = app.datastore().get_all_tables()
        return {"tables": [t.get_name() for t in tables]}
    except Exception as e:
        return {"error": str(e)}

@app.get("/debug_env")
async def debug_env(request: Request):
    import zcatalyst_sdk
    try:
        zcatalyst_sdk.initialize()
        return {"status": "success no req"}
    except Exception as e1:
        try:
            app_cat = zcatalyst_sdk.initialize(req=request)
            ds = app_cat.datastore()
            return {
                "status": "success with req",
                "ds_methods": dir(ds),
                "app_methods": dir(app_cat)
            }
        except Exception as e2:
            return {"error1": str(e1), "error2": str(e2)}

@app.get("/init_db_force")
async def init_db_force(request: Request):
    import zcatalyst_sdk
    try:
        catalyst_app = zcatalyst_sdk.initialize(req=request)
        zcql = catalyst_app.zcql()
        tables = [
            "CREATE TABLE Cases (id bigint, title varchar(255), description varchar(2000), status varchar(50), priority varchar(50), latitude float, longitude float);",
            "CREATE TABLE MasterData (id bigint, type varchar(50), key varchar(255), value varchar(255));",
            "CREATE TABLE Analytics (id bigint, metric_name varchar(255), metric_value float, recorded_at timestamp);"
        ]
        results = []
        for query in tables:
            try:
                zcql.execute_query(query)
                results.append(f"Success: {query}")
            except Exception as e:
                results.append(f"Error for {query}: {str(e)}")
        return {"status": "completed", "details": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/seed_data_force")
async def seed_data_force_api(request: Request):
    import seed_data
    try:
        seed_data.seed(req=request)
        return {"status": "success", "message": "Datastore seeded successfully with 5000+ records"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

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

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("X_ZOHO_CATALYST_LISTEN_PORT", 9000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
