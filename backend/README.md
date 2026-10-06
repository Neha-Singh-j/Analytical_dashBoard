# Backend - Data Analytics Dashboard API

Production-ready FastAPI backend for data ingestion, normalization, cross-dataset relational joins, business calculations, currency conversion, and analytical APIs.

---

## Technical Stack & Architecture

- **Framework**: FastAPI (Python 3.12+)
- **Database**: SQLite 3 (`analytics.db`)
- **Data Engine**: Pandas & Standard Python Libraries
- **Architecture Pattern**: Clean Layered Architecture (`api` -> `services` -> `database`)

### Data Processing Pipeline

```
JSON / XML / CSV Datasets
          ↓
Ingestion Layer (json_service, xml_service, csv_service)
          ↓
Normalization & Validation
          ↓
SQLite Relational Storage (products, orders, order_items, shipments)
          ↓
Transformation & Joining Engine (Orders + Products + Shipments)
          ↓
Business Logic (Total Order Value, Delivery Delay Flags, Category Aggregation)
          ↓
Currency Conversion Engine (Live API + Fallback Cache)
          ↓
FastAPI REST Endpoints
```

---

## Features & Transformations

1. **JSON Ingestion (`/api/ingest/json`)**:
   - Parses nested order and order item structures.
   - Cleans quote anomalies programmatically.
2. **CSV Ingestion (`/api/ingest/csv`)**:
   - Normalizes product categories and ID relationships.
3. **XML Ingestion (`/api/ingest/xml`)**:
   - Extracts shipment dates, carriers, expected vs. actual delivery.
4. **Calculated Metrics**:
   - **Total Order Value**: `Sum(qty * price)` per order.
   - **Delivery Delay Flag**: `actual_delivery_date > expected_delivery_date`.
   - **Category-level Aggregations**: Total revenue, order count, quantity sold, average order value.
5. **Currency Service**:
   - Live conversion with caching (`open.er-api.com`). Supports USD, EUR, INR, GBP.

---

## API Documentation

- `POST /api/ingest/json` - Ingest orders JSON data
- `POST /api/ingest/xml` - Ingest shipments XML data
- `POST /api/ingest/csv` - Ingest products CSV data
- `POST /api/ingest/all` - Trigger full ingestion pipeline
- `GET /api/analytics/summary` - Metrics, KPI cards, charts dataset
- `GET /api/orders` - Paginated orders list with filtering & search
- `GET /api/orders/{id}` - Detailed order popup data
- `GET /api/products` - List of product catalog items
- `GET /api/shipments` - List of shipment tracking records

---

## Running the Backend

```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
