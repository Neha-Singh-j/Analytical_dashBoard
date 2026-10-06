import pandas as pd
from ..database.connection import get_db_connection

def get_joined_dataframe():
    """
    Retrieves and joins Orders, Order Items, Products, and Shipments datasets from SQLite.
    Fills missing values cleanly and auto-ingests default datasets if SQLite tables are empty.
    """
    conn = get_db_connection()
    
    orders_df = pd.read_sql_query("SELECT * FROM orders", conn)
    items_df = pd.read_sql_query("SELECT * FROM order_items", conn)
    products_df = pd.read_sql_query("SELECT * FROM products", conn)
    shipments_df = pd.read_sql_query("SELECT * FROM shipments", conn)
    
    conn.close()

    # Auto-ingest if database tables are empty
    if orders_df.empty or items_df.empty:
        from .ingestion_service import ingest_all_datasets
        ingest_all_datasets()
        conn = get_db_connection()
        orders_df = pd.read_sql_query("SELECT * FROM orders", conn)
        items_df = pd.read_sql_query("SELECT * FROM order_items", conn)
        products_df = pd.read_sql_query("SELECT * FROM products", conn)
        shipments_df = pd.read_sql_query("SELECT * FROM shipments", conn)
        conn.close()

    if orders_df.empty or items_df.empty:
        return pd.DataFrame()

    # Calculate item_total_value
    items_df["item_total_value"] = items_df["qty"] * items_df["price"]

    # Join Order Items + Products
    merged = pd.merge(items_df, products_df, on="product_id", how="left")

    # Join with Orders
    merged = pd.merge(merged, orders_df, on="order_id", how="left")

    # Join with Shipments
    if not shipments_df.empty:
        merged = pd.merge(merged, shipments_df, on="order_id", how="left")
    else:
        merged["carrier"] = "N/A"
        merged["tracking_number"] = "N/A"
        merged["shipped_date"] = None
        merged["expected_delivery_date"] = None
        merged["actual_delivery_date"] = None
        merged["status"] = "Unknown"

    # Fill NaN values cleanly
    merged["category"] = merged["category"].fillna("Uncategorized")
    merged["product_name"] = merged["product_name"].fillna("Unknown Product")
    merged["customer_name"] = merged["customer_name"].fillna("Guest Customer")
    merged["carrier"] = merged["carrier"].fillna("N/A")
    merged["tracking_number"] = merged["tracking_number"].fillna("N/A")
    merged["status"] = merged["status"].fillna("In Transit")

    # Business Calculations: Delivery Delay Flag
    def check_delay(row):
        actual = str(row.get("actual_delivery_date") or "").strip()
        expected = str(row.get("expected_delivery_date") or "").strip()
        status = str(row.get("status") or "").strip()
        
        if status.lower() == "delayed":
            return True
        if actual and expected and actual != "nan" and expected != "nan" and actual > expected:
            return True
        return False

    merged["is_delayed"] = merged.apply(check_delay, axis=1)

    return merged
