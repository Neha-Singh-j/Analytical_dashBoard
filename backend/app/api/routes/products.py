from fastapi import APIRouter, HTTPException
from ...database.connection import get_db_connection

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("")
async def get_products():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products")
        rows = cursor.fetchall()
        conn.close()

        products = [dict(r) for r in rows]
        return {"success": True, "data": products, "message": "Products retrieved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch products: {str(e)}")
