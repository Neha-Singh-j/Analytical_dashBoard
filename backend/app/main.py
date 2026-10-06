from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database.connection import init_db
from .services.ingestion_service import ingest_all_datasets
from .api.routes import ingest, analytics, orders, products, shipments, auth, countries

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    init_db()
    # Auto-ingest provided dataset on startup
    try:
        ingest_all_datasets()
        print("Initial dataset ingested successfully into SQLite database")
    except Exception as e:
        print(f"Warning: Startup dataset ingestion encountered error: {e}")
    yield

app = FastAPI(
    title="Data Analytics Dashboard API",
    description="Full-stack Data Processing & Analytics API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(countries.router, prefix="/api")
app.include_router(ingest.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(shipments.router, prefix="/api")

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Data Analytics API",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
