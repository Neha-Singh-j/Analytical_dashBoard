import json
import re
from pathlib import Path

def parse_json_orders(file_content_or_path):
    """
    Parses Orders.json content or filepath.
    Handles raw JSON as well as string-escaped quotes formatting gracefully.
    """
    if isinstance(file_content_or_path, (str, Path)) and Path(file_content_or_path).exists():
        with open(file_content_or_path, "r", encoding="utf-8-sig") as f:
            raw_text = f.read()
    elif isinstance(file_content_or_path, bytes):
        raw_text = file_content_or_path.decode("utf-8-sig", errors="ignore")
    else:
        raw_text = str(file_content_or_path)

    # Sanitize escaped quotes formatting if needed
    cleaned_text = raw_text.strip()
    if '""' in cleaned_text:
        # replace double double-quotes with single double-quote
        cleaned_text = cleaned_text.replace('""', '"')
        # fix line wrapping quotes around JSON lines
        cleaned_text = re.sub(r'^\s*"', '', cleaned_text, flags=re.MULTILINE)
        cleaned_text = re.sub(r'"\s*$', '', cleaned_text, flags=re.MULTILINE)
    
    data = json.loads(cleaned_text)
    orders_list = data.get("orders", []) if isinstance(data, dict) else data

    flattened_orders = []
    flattened_items = []

    for order in orders_list:
        order_id = str(order.get("order_id", "")).strip()
        customer = order.get("customer", {})
        cust_id = str(customer.get("id", "")).strip() if isinstance(customer, dict) else ""
        cust_name = str(customer.get("name", "")).strip() if isinstance(customer, dict) else ""
        order_date = str(order.get("order_date", "")).strip()

        flattened_orders.append({
            "order_id": order_id,
            "customer_id": cust_id,
            "customer_name": cust_name,
            "order_date": order_date
        })

        items = order.get("items", [])
        for item in items:
            flattened_items.append({
                "order_id": order_id,
                "product_id": str(item.get("product_id", "")).strip(),
                "qty": int(item.get("qty", 1)),
                "price": float(item.get("price", 0.0))
            })

    return flattened_orders, flattened_items
