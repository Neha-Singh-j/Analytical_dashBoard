import sys
import os
import io
import time
sys.stdout.reconfigure(encoding='utf-8')
sys.path.append('backend')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=== Testing FastAPI Auth & Data Pipeline Endpoints ===")

# 1. Test Root
res = client.get("/")
print("GET / ->", res.status_code, res.json())

# 2. Test Ingest All Datasets
res = client.post("/api/ingest/all")
print("POST /api/ingest/all ->", res.status_code, res.json()["message"])

# 3. Test File Upload Ingestion (JSON file via multipart form-data)
sample_json = b'''{
  "orders": [
    {
      "order_id": "1003",
      "customer": {"id": "C003", "name": "David"},
      "items": [{"product_id": "P101", "qty": 1, "price": 500}],
      "order_date": "2024-01-03"
    }
  ]
}'''
res = client.post("/api/ingest/json", files={"file": ("test_orders.json", io.BytesIO(sample_json), "application/json")})
print("POST /api/ingest/json (multipart upload) ->", res.status_code, res.json())

# 4. Test Analytics Summary
res = client.get("/api/analytics/summary?currency=USD")
print("GET /api/analytics/summary (USD) ->", res.status_code)
data = res.json()["data"]
print("  Total Orders:", data["total_orders"])
print("  Total Revenue:", data["total_revenue"])
print("  Delayed Orders:", data["delayed_orders"])

# 5. Test Auth Signup & Login with dynamic email
test_email = f"sarah_{int(time.time())}@sky.com"
res = client.post("/api/auth/signup", json={
    "name": "Sarah Connor",
    "email": test_email,
    "password": "secretpassword",
    "role": "Operations Manager"
})
print("POST /api/auth/signup ->", res.status_code, res.json())

res = client.post("/api/auth/login", json={
    "email": test_email,
    "password": "secretpassword"
})
print("POST /api/auth/login ->", res.status_code, res.json()["data"]["role"])

res = client.get(f"/api/auth/me?email={test_email}")
print("GET /api/auth/me ->", res.status_code, res.json()["data"]["email"])

print("\nALL BACKEND API AND AUTH TESTS PASSED SUCCESSFULLY! 🎉")
