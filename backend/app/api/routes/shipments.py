from fastapi import APIRouter, HTTPException
from ...database.connection import get_db_connection

router = APIRouter(prefix="/shipments", tags=["Shipments"])

@router.get("")
async def get_shipments():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM shipments")
        rows = cursor.fetchall()
        conn.close()

        shipments = [dict(r) for r in rows]
        return {"success": True, "data": shipments, "message": "Shipments retrieved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch shipments: {str(e)}")
