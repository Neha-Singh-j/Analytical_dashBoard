from fastapi import APIRouter, UploadFile, File, Request, HTTPException
from typing import Optional
from ...services.ingestion_service import (
    ingest_products_file, ingest_orders_file,
    ingest_shipments_file, ingest_all_datasets
)
from ...services.analytics_service import get_ingestion_logs

router = APIRouter(prefix="/ingest", tags=["Ingestion"])

@router.post("/json")
async def ingest_json(file: Optional[UploadFile] = File(None), request: Request = None):
    try:
        content = None
        if file and file.filename:
            content = await file.read()
        elif request:
            body = await request.body()
            if body:
                content = body
        res = ingest_orders_file(content=content if content and len(content) > 0 else None)
        return {"success": True, "data": res, "message": "JSON order dataset ingested successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to ingest JSON data: {str(e)}")

@router.post("/xml")
async def ingest_xml(file: Optional[UploadFile] = File(None), request: Request = None):
    try:
        content = None
        if file and file.filename:
            content = await file.read()
        elif request:
            body = await request.body()
            if body:
                content = body
        res = ingest_shipments_file(content=content if content and len(content) > 0 else None)
        return {"success": True, "data": res, "message": "XML shipment dataset ingested successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to ingest XML data: {str(e)}")

@router.post("/csv")
async def ingest_csv(file: Optional[UploadFile] = File(None), request: Request = None):
    try:
        content = None
        if file and file.filename:
            content = await file.read()
        elif request:
            body = await request.body()
            if body:
                content = body
        res = ingest_products_file(content=content if content and len(content) > 0 else None)
        return {"success": True, "data": res, "message": "CSV product dataset ingested successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to ingest CSV data: {str(e)}")

@router.post("/all")
async def ingest_all():
    try:
        res = ingest_all_datasets()
        return {"success": True, "data": res, "message": "All pipeline datasets ingested successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion pipeline failed: {str(e)}")

from fastapi import APIRouter, UploadFile, File, Request, Query, HTTPException

@router.get("/logs")
async def get_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100)
):
    try:
        res = get_ingestion_logs(page=page, limit=limit)
        return {
            "success": True,
            "data": res["logs"],
            "pagination": res["pagination"],
            "message": "Ingestion logs retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch logs: {str(e)}")
