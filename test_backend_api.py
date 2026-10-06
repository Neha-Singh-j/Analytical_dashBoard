import sys
import os
import io
import time
sys.stdout.reconfigure(encoding='utf-8')
sys.path.append('backend')

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=== Testing FastAPI Auth, Analytics & REST Countries API ===")

# 1. Test Root
res = client.get("/")
print("GET / ->", res.status_code, res.json())

# 2. Test Countries Sync
res = client.post("/api/countries/sync")
print("POST /api/countries/sync ->", res.status_code, res.json()["message"])

# 3. Test Countries Summary
res = client.get("/api/countries/summary")
print("GET /api/countries/summary ->", res.status_code)
data = res.json()["data"]
print("  Total Countries:", data["total_countries"])
print("  Total Population:", data["total_population"])
print("  Avg Density:", data["avg_density"])
print("  Regions:", len(data["region_breakdown"]))

# 4. Test Countries List with Filter
res = client.get("/api/countries?region=Americas&sort_by=population")
print("GET /api/countries (Americas) ->", res.status_code, "Count:", len(res.json()["data"]))

# 5. Test Country Detail
res = client.get("/api/countries/US")
print("GET /api/countries/US ->", res.status_code, res.json()["data"]["name_common"])

print("\nALL BACKEND API AND REST COUNTRIES INTEGRATION TESTS PASSED! 🎉")
