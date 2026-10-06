import csv
import io
from pathlib import Path

def parse_csv_products(file_content_or_path):
    """
    Parses Products.csv content or filepath.
    Handles quote wrapper removal and column header normalization.
    """
    lines = []
    if isinstance(file_content_or_path, (str, Path)) and Path(file_content_or_path).exists():
        with open(file_content_or_path, "r", encoding="utf-8-sig") as f:
            lines = f.readlines()
    elif isinstance(file_content_or_path, bytes):
        lines = file_content_or_path.decode("utf-8-sig", errors="ignore").splitlines()
    else:
        lines = str(file_content_or_path).splitlines()

    cleaned_rows = []
    for line in lines:
        cleaned = line.strip()
        if cleaned.startswith('"') and cleaned.endswith('"'):
            cleaned = cleaned[1:-1]
        if cleaned:
            cleaned_rows.append(cleaned)

    reader = csv.DictReader(cleaned_rows)
    products = []
    for row in reader:
        p_id = row.get("ProductID") or row.get("product_id") or ""
        p_name = row.get("ProductName") or row.get("product_name") or ""
        p_cat = row.get("Category") or row.get("category") or ""
        
        products.append({
            "product_id": str(p_id).strip(),
            "product_name": str(p_name).strip(),
            "category": str(p_cat).strip()
        })

    return products
