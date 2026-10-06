from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from ...services.countries_service import (
    get_countries_list, get_countries_summary, sync_countries_database
)
from ...database.connection import get_db_connection

router = APIRouter(prefix="/countries", tags=["Countries Intelligence"])

@router.get("")
async def list_countries(
    region: Optional[str] = Query(None, description="Filter by region (Americas, Europe, Asia, Africa, Oceania)"),
    search: Optional[str] = Query(None, description="Search by country name, code or currency"),
    sort_by: Optional[str] = Query("population", description="Sort by: population, density, name"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100)
):
    try:
        res = get_countries_list(region=region, search=search, sort_by=sort_by, page=page, limit=limit)
        return {"success": True, "data": res["data"], "pagination": res["pagination"], "message": "Countries fetched successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch countries: {str(e)}")

@router.get("/summary")
async def countries_summary():
    try:
        summary = get_countries_summary()
        return {"success": True, "data": summary, "message": "Countries summary retrieved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate countries summary: {str(e)}")

@router.post("/sync")
async def sync_countries():
    try:
        count = sync_countries_database()
        return {"success": True, "records_synced": count, "message": f"Successfully synced {count} countries from REST Countries API"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync countries API: {str(e)}")

@router.get("/{code}")
async def get_country_detail(code: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM countries WHERE LOWER(cca2) = LOWER(?) OR LOWER(cca3) = LOWER(?)", (code, code))
        row = cursor.fetchone()
        conn.close()

        if not row:
            raise HTTPException(status_code=404, detail=f"Country {code} not found")

        return {"success": True, "data": dict(row), "message": "Country details retrieved"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching country detail: {str(e)}")
