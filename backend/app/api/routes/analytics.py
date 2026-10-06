from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from ...services.analytics_service import get_analytics_summary
from ...services.currency_service import get_exchange_rates

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary")
async def analytics_summary(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    category: Optional[str] = Query(None, description="Product category filter"),
    delivery_status: Optional[str] = Query(None, description="Delivery status filter"),
    currency: Optional[str] = Query("USD", description="Target currency (USD, EUR, INR, GBP)")
):
    try:
        summary = get_analytics_summary(
            start_date=start_date,
            end_date=end_date,
            category=category,
            delivery_status=delivery_status,
            currency=currency
        )
        return {"success": True, "data": summary, "message": "Analytics summary fetched successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing analytics summary: {str(e)}")

@router.get("/currencies")
async def get_currencies():
    try:
        rates = get_exchange_rates()
        return {"success": True, "data": rates, "message": "Exchange rates fetched successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching currencies: {str(e)}")
