import xml.etree.ElementTree as ET
from pathlib import Path

def parse_xml_shipments(file_content_or_path):
    """
    Parses Shipment.xml content or filepath.
    Normalizes XML nodes into tabular shipment dictionaries.
    """
    if isinstance(file_content_or_path, (str, Path)) and Path(file_content_or_path).exists():
        tree = ET.parse(file_content_or_path)
        root = tree.getroot()
    elif isinstance(file_content_or_path, bytes):
        root = ET.fromstring(file_content_or_path.decode("utf-8", errors="ignore"))
    else:
        root = ET.fromstring(str(file_content_or_path))

    shipments = []
    # Find all shipment nodes under root
    for node in root.findall(".//shipment"):
        shipment_id = node.findtext("shipment_id") or node.findtext("id") or ""
        order_id = node.findtext("order_id") or ""
        carrier = node.findtext("carrier") or ""
        tracking_number = node.findtext("tracking_number") or node.findtext("tracking") or ""
        shipped_date = node.findtext("shipped_date") or ""
        expected_delivery = node.findtext("expected_delivery_date") or node.findtext("expected_delivery") or ""
        actual_delivery = node.findtext("actual_delivery_date") or node.findtext("actual_delivery") or ""
        status = node.findtext("status") or ""

        # Derive initial status if missing
        if not status:
            if actual_delivery and expected_delivery:
                status = "Delayed" if actual_delivery > expected_delivery else "Delivered"
            else:
                status = "In Transit"

        shipments.append({
            "shipment_id": str(shipment_id).strip(),
            "order_id": str(order_id).strip(),
            "carrier": str(carrier).strip(),
            "tracking_number": str(tracking_number).strip(),
            "shipped_date": str(shipped_date).strip(),
            "expected_delivery_date": str(expected_delivery).strip(),
            "actual_delivery_date": str(actual_delivery).strip(),
            "status": str(status).strip()
        })

    return shipments
