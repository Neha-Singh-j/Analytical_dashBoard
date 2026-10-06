import pandas as pd
from ..database.connection import get_db_connection

def get_joined_dataframe():
    """
    Retrieves and joins Orders, Order Items, Products, and Shipments datasets from SQLite.
    Returns a Pandas DataFrame with normalized and calculated fields.
    """
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
    merged["category"] = merged["category"].fillna("Uncategorized")
    merged["product_name"] = merged["product_name"].fillna("Unknown Product")

    # Join with Orders
    merged = pd.merge(merged, orders_df, on="order_id", how="left")

    # Join with Shipments
    if not shipments_df.empty:
        merged = pd.merge(merged, shipments_df, on="order_id", how="left")
    else:
        merged["carrier"] = "N/A"
        merged["expected_delivery_date"] = None
        merged["actual_delivery_date"] = None
        merged["status"] = "Unknown"

    # Business Calculations: Delivery Delay Flag
    def check_delay(row):
        actual = str(row.get("actual_delivery_date") or "").strip()
        expected = str(row.get("expected_delivery_date") or "").strip()
        status = str(row.get("status") or "").strip()
        
        if status.lower() == "delayed":
            return True
        if actual and expected and actual > expected:
            return True
        return False

    merged["is_delayed"] = merged.apply(check_delay, axis=1)

    return merged
