import os
from pathlib import Path
from ..database.connection import get_db_connection
from .json_service import parse_json_orders
from .csv_service import parse_csv_products
from .xml_service import parse_xml_shipments

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"

def ingest_products_file(filepath=None, content=None):
    if not filepath and not content:
        filepath = DATA_DIR / "Products.csv"
    products = parse_csv_products(content or filepath)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    count = 0
    for p in products:
        cursor.execute("""
            INSERT OR REPLACE INTO products (product_id, product_name, category)
            VALUES (?, ?, ?)
        """, (p["product_id"], p["product_name"], p["category"]))
        count += 1
    
    cursor.execute("""
        INSERT INTO ingestion_logs (file_type, file_name, records_processed, status, message)
        VALUES ('CSV', 'Products.csv', ?, 'SUCCESS', 'Successfully ingested products dataset')
    """, (count,))
    
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "file": "Products.csv", "records": count}

def ingest_orders_file(filepath=None, content=None):
    if not filepath and not content:
        filepath = DATA_DIR / "Orders.json"
    orders, items = parse_json_orders(content or filepath)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    order_count = 0
    item_count = 0
    
    for o in orders:
        cursor.execute("""
            INSERT OR REPLACE INTO orders (order_id, customer_id, customer_name, order_date)
            VALUES (?, ?, ?, ?)
        """, (o["order_id"], o["customer_id"], o["customer_name"], o["order_date"]))
        order_count += 1

        # Clear previous items for this order to prevent duplicates on re-ingestion
        cursor.execute("DELETE FROM order_items WHERE order_id = ?", (o["order_id"],))
        
    for item in items:
        cursor.execute("""
            INSERT INTO order_items (order_id, product_id, qty, price)
            VALUES (?, ?, ?, ?)
        """, (item["order_id"], item["product_id"], item["qty"], item["price"]))
        item_count += 1
        
    cursor.execute("""
        INSERT INTO ingestion_logs (file_type, file_name, records_processed, status, message)
        VALUES ('JSON', 'Orders.json', ?, 'SUCCESS', 'Successfully ingested orders and order items')
    """, (order_count,))
    
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "file": "Orders.json", "orders_processed": order_count, "items_processed": item_count}

def ingest_shipments_file(filepath=None, content=None):
    if not filepath and not content:
        filepath = DATA_DIR / "Shipment.xml"
    shipments = parse_xml_shipments(content or filepath)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    count = 0
    for s in shipments:
        cursor.execute("""
            INSERT OR REPLACE INTO shipments (
                shipment_id, order_id, carrier, tracking_number,
                delivery_days, shipped_date, expected_delivery_date, actual_delivery_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            s["shipment_id"], s["order_id"], s.get("carrier", "Express Logistics"),
            s.get("tracking_number", f"TRK-{s['shipment_id']}"), s.get("delivery_days", 0),
            s.get("shipped_date", "2024-01-02"), s.get("expected_delivery_date", "2024-01-05"),
            s.get("actual_delivery_date", "2024-01-05"), s["status"]
        ))
        count += 1
        
    cursor.execute("""
        INSERT INTO ingestion_logs (file_type, file_name, records_processed, status, message)
        VALUES ('XML', 'Shipment.xml', ?, 'SUCCESS', 'Successfully ingested shipments dataset')
    """, (count,))
    
    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "file": "Shipment.xml", "records": count}

def ingest_all_datasets():
    res_p = ingest_products_file()
    res_o = ingest_orders_file()
    res_s = ingest_shipments_file()
    return {
        "status": "SUCCESS",
        "message": "All datasets ingested successfully",
        "details": {
            "products": res_p,
            "orders": res_o,
            "shipments": res_s
        }
    }
