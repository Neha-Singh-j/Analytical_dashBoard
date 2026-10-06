import xml.etree.ElementTree as ET
from pathlib import Path

def parse_xml_shipments(file_content_or_path):
    """
    Parses Shipment.xml content or filepath matching exact supplied schema:
    <shipments>
      <shipment>
        <shipment_id>S001</shipment_id>
        <order_id>1001</order_id>
        <delivery_days>3</delivery_days>
        <status>Delivered</status>
      </shipment>
    </shipments>
    """
    if isinstance(file_content_or_path, (str, Path)) and Path(file_content_or_path).exists():
        tree = ET.parse(file_content_or_path)
        root = tree.getroot()
    elif isinstance(file_content_or_path, bytes):
        root = ET.fromstring(file_content_or_path.decode("utf-8", errors="ignore"))
    else:
        root = ET.fromstring(str(file_content_or_path))

    shipments = []
    for node in root.findall(".//shipment"):
        shipment_id = node.findtext("shipment_id") or node.findtext("id") or ""
        order_id = node.findtext("order_id") or ""
        delivery_days_raw = node.findtext("delivery_days") or "0"
        status = node.findtext("status") or "Unknown"

        try:
            delivery_days = int(delivery_days_raw)
        except ValueError:
            delivery_days = 0

        # Derive initial delay logic if status not explicit
        if not status or status.lower() == "unknown":
            status = "Delayed" if delivery_days > 5 else "Delivered"

        shipments.append({
            "shipment_id": str(shipment_id).strip(),
            "order_id": str(order_id).strip(),
            "delivery_days": delivery_days,
            "status": str(status).strip()
        })

    return shipments
