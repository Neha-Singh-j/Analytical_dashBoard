import pandas as pd
from .transformation_service import get_joined_dataframe
from .currency_service import convert_currency, get_exchange_rates
from ..database.connection import get_db_connection

def apply_filters(df, start_date=None, end_date=None, category=None, delivery_status=None):
    if df.empty:
        return df

    filtered = df.copy()

    if start_date:
        filtered = filtered[filtered["order_date"] >= start_date]

    if end_date:
        filtered = filtered[filtered["order_date"] <= end_date]

    if category and category.lower() != "all":
        filtered = filtered[filtered["category"].str.lower() == category.lower()]

    if delivery_status and delivery_status.lower() != "all":
        if delivery_status.lower() == "delayed":
            filtered = filtered[filtered["is_delayed"] == True]
        elif delivery_status.lower() == "on-time" or delivery_status.lower() == "delivered":
            filtered = filtered[(filtered["is_delayed"] == False) & (filtered["status"].str.lower() == "delivered")]
        else:
            filtered = filtered[filtered["status"].str.lower() == delivery_status.lower()]

    return filtered

def get_analytics_summary(start_date=None, end_date=None, category=None, delivery_status=None, currency="USD"):
    df = get_joined_dataframe()
    filtered = apply_filters(df, start_date, end_date, category, delivery_status)

    if filtered.empty:
        return {
            "total_orders": 0,
            "total_revenue": 0.0,
            "delayed_orders": 0,
            "on_time_orders": 0,
            "currency": currency,
            "category_revenue": [],
            "revenue_trend": [],
            "delivery_performance": []
        }

    rates = get_exchange_rates()
    rate = rates.get(currency.upper(), 1.0)

    # Total Orders (unique order IDs)
    total_orders = int(filtered["order_id"].nunique())

    # Total Revenue (sum of item_total_value converted to target currency)
    base_revenue = float(filtered["item_total_value"].sum())
    total_revenue = round(base_revenue * rate, 2)

    # Delayed Orders count
    order_delays = filtered.groupby("order_id")["is_delayed"].any()
    delayed_orders = int(order_delays.sum())
    on_time_orders = total_orders - delayed_orders

    # Category Revenue Aggregation
    cat_agg = filtered.groupby("category").agg(
        revenue=("item_total_value", "sum"),
        orders=("order_id", "nunique"),
        quantity_sold=("qty", "sum")
    ).reset_index()

    category_revenue = []
    for _, row in cat_agg.iterrows():
        category_revenue.append({
            "category": row["category"],
            "revenue": round(float(row["revenue"]) * rate, 2),
            "orders": int(row["orders"]),
            "quantity_sold": int(row["quantity_sold"]),
            "avg_order_value": round((float(row["revenue"]) * rate) / max(int(row["orders"]), 1), 2)
        })

    # Revenue Trend by Order Date
    trend_agg = filtered.groupby("order_date").agg(
        revenue=("item_total_value", "sum"),
        orders=("order_id", "nunique")
    ).reset_index().sort_values("order_date")

    revenue_trend = []
    for _, row in trend_agg.iterrows():
        revenue_trend.append({
            "date": str(row["order_date"]),
            "revenue": round(float(row["revenue"]) * rate, 2),
            "orders": int(row["orders"])
        })

    # Delivery Performance Breakdown
    shipment_agg = filtered.groupby("order_id").first().reset_index()
    status_counts = shipment_agg["status"].value_counts().to_dict()
    
    delivery_performance = [
        {"status": "Delivered", "count": status_counts.get("Delivered", 0), "color": "#10B981"},
        {"status": "Delayed", "count": status_counts.get("Delayed", 0) + delayed_orders if "Delayed" not in status_counts else status_counts["Delayed"], "color": "#EF4444"},
        {"status": "In Transit", "count": status_counts.get("In Transit", 0), "color": "#F59E0B"}
    ]

    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "delayed_orders": delayed_orders,
        "on_time_orders": on_time_orders,
        "currency": currency.upper(),
        "exchange_rate": rate,
        "category_revenue": category_revenue,
        "revenue_trend": revenue_trend,
        "delivery_performance": delivery_performance
    }

def get_orders_list(page=1, limit=10, category=None, status=None, search=None, currency="USD"):
    df = get_joined_dataframe()
    if df.empty:
        return {"data": [], "pagination": {"page": page, "limit": limit, "total": 0, "totalPages": 0}}

    rates = get_exchange_rates()
    rate = rates.get(currency.upper(), 1.0)

    # Group by order_id to form header list
    order_groups = []
    for order_id, group in df.groupby("order_id"):
        first = group.iloc[0]

        # Extract and sanitize string fields
        carrier_str = str(first.get("carrier") or "N/A").strip()
        if carrier_str.lower() == "nan":
            carrier_str = "N/A"

        status_str = str(first.get("status") or "In Transit").strip()
        if status_str.lower() == "nan":
            status_str = "In Transit"

        exp_del = first.get("expected_delivery_date")
        exp_del_str = str(exp_del).strip() if exp_del and str(exp_del).lower() != "nan" else "N/A"

        act_del = first.get("actual_delivery_date")
        act_del_str = str(act_del).strip() if act_del and str(act_del).lower() != "nan" else "N/A"

        # Check filters
        if category and category.lower() != "all":
            if not any(group["category"].str.lower() == category.lower()):
                continue

        if status and status.lower() != "all":
            if status.lower() == "delayed" and not any(group["is_delayed"]):
                continue
            elif status.lower() in ["on-time", "delivered"] and status_str.lower() != "delivered":
                continue

        if search:
            s = search.lower()
            match_id = s in str(order_id).lower()
            match_cust = s in str(first.get("customer_name", "")).lower()
            match_prod = any(group["product_name"].str.lower().str.contains(s))
            if not (match_id or match_cust or match_prod):
                continue

        total_val = float(group["item_total_value"].sum())
        items_summary = ", ".join([f"{r['product_name']} (x{r['qty']})" for _, r in group.iterrows()])
        categories = list(group["category"].unique())

        order_groups.append({
            "order_id": str(order_id),
            "order_date": str(first["order_date"]),
            "customer_id": str(first.get("customer_id") or ""),
            "customer_name": str(first.get("customer_name") or "Guest Customer"),
            "items_count": int(group["qty"].sum()),
            "items_summary": items_summary,
            "categories": categories,
            "total_value": round(total_val * rate, 2),
            "currency": currency.upper(),
            "carrier": carrier_str,
            "status": status_str,
            "is_delayed": bool(group["is_delayed"].any()),
            "expected_delivery": exp_del_str,
            "actual_delivery": act_del_str
        })

    # Sort descending by date/id
    order_groups.sort(key=lambda x: x["order_id"], reverse=True)

    total_records = len(order_groups)
    total_pages = (total_records + limit - 1) // limit if limit > 0 else 1
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit

    paginated_orders = order_groups[start_idx:end_idx]

    return {
        "data": paginated_orders,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_records,
            "totalPages": total_pages
        }
    }

def get_order_by_id(order_id, currency="USD"):
    df = get_joined_dataframe()
    if df.empty:
        return None

    group = df[df["order_id"] == str(order_id)]
    if group.empty:
        return None

    rates = get_exchange_rates()
    rate = rates.get(currency.upper(), 1.0)
    first = group.iloc[0]

    items = []
    for _, row in group.iterrows():
        items.append({
            "product_id": row["product_id"],
            "product_name": row["product_name"],
            "category": row["category"],
            "qty": int(row["qty"]),
            "unit_price": round(float(row["price"]) * rate, 2),
            "total_price": round(float(row["item_total_value"]) * rate, 2)
        })

    total_value = round(float(group["item_total_value"].sum()) * rate, 2)

    return {
        "order_id": str(order_id),
        "order_date": first["order_date"],
        "customer": {
            "id": first.get("customer_id"),
            "name": first.get("customer_name")
        },
        "shipment": {
            "shipment_id": first.get("shipment_id"),
            "carrier": first.get("carrier"),
            "tracking_number": first.get("tracking_number"),
            "shipped_date": first.get("shipped_date"),
            "expected_delivery": first.get("expected_delivery_date"),
            "actual_delivery": first.get("actual_delivery_date"),
            "status": first.get("status"),
            "is_delayed": bool(group["is_delayed"].any())
        },
        "items": items,
        "total_value": total_value,
        "currency": currency.upper()
    }

def get_ingestion_logs(page=1, limit=10):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM ingestion_logs")
    total_records = cursor.fetchone()[0]

    offset = (page - 1) * limit
    cursor.execute("""
        SELECT * FROM ingestion_logs
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    """, (limit, offset))
    rows = cursor.fetchall()
    conn.close()

    logs = []
    for r in rows:
        logs.append({
            "id": r["id"],
            "file_type": r["file_type"],
            "file_name": r["file_name"],
            "records_processed": r["records_processed"],
            "status": r["status"],
            "message": r["message"],
            "timestamp": r["timestamp"]
        })

    total_pages = (total_records + limit - 1) // limit if limit > 0 else 1

    return {
        "logs": logs,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_records,
            "totalPages": total_pages
        }
    }
