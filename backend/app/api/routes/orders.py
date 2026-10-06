from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from ...services.analytics_service import get_orders_list, get_order_by_id

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("")
async def list_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    currency: Optional[str] = Query("USD")
):
    try:
        result = get_orders_list(
            page=page,
            limit=limit,
            category=category,
            status=status,
            search=search,
            currency=currency
        )
        return {
            "success": True,
            "data": result["data"],
            "pagination": result["pagination"],
            "message": "Orders retrieved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list orders: {str(e)}")

@router.get("/{order_id}")
async def get_order(order_id: str, currency: Optional[str] = Query("USD")):
    try:
        order = get_order_by_id(order_id, currency=currency)
        if not order:
            raise HTTPException(status_code=404, detail=f"Order {order_id} not found")
        return {"success": True, "data": order, "message": "Order detail retrieved successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch order: {str(e)}")
