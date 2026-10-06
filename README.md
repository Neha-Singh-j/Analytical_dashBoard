# Analytical Dashboard

A full-stack data analytics dashboard built to ingest data from multiple
formats, clean and normalize it, store related datasets in SQLite,
calculate business metrics, and present the results through a React
dashboard.

The project was built around a practical data-processing workflow rather
than a static dashboard: **ingestion → normalization → relational joins
→ business calculations → analytics APIs → dashboard visualizations**.

> **Note:** If you encounter any deployment-related issues while running the hosted version, please refer to the screenshots included in this README to get an idea of the expected website functionality and UI. You can also run the project locally by following the setup instructions above to explore the complete working application.

## Overview

The application brings together three datasets:

-   **Orders** from JSON
-   **Products** from CSV
-   **Shipments** from XML

The backend processes these datasets, handles relationships between
them, stores the normalized data in SQLite, and exposes REST APIs for
the frontend.

The dashboard then displays KPIs, charts, filters,
order/product/shipment data, pagination, and analytical views.

## Main Features

### 1. Multi-format data ingestion

The backend supports:

-   JSON order data
-   CSV product data
-   XML shipment data
-   Full ingestion through a combined endpoint

During ingestion, the backend performs normalization and validation
before storing the data.

### 2. Data transformation and relationships

The application works with related orders, products, order items, and
shipments.

It handles:

-   Nested JSON structures such as orders and order items
-   XML shipment information
-   Relationships between orders, products, and shipments
-   Missing values
-   Data inconsistencies
-   Type conversions

### 3. Business calculations

The backend derives useful analytical metrics, including:

-   **Total Order Value** = `SUM(quantity × price)`
-   **Delivery Delay Flag** = actual delivery date is later than
    expected delivery date
-   Category-level revenue
-   Order count
-   Quantity sold
-   Average order value
-   Currency conversion for supported currencies

### 4. Analytics Dashboard

The frontend presents the processed information through:

-   KPI cards
-   Revenue trends
-   Category-wise revenue
-   Delivery performance
-   Order and sales views
-   Country-based analytical information
-   Filters
-   Detailed data views
-   Responsive dashboard layout

### 5. Pagination and API-driven data

Large lists are displayed using API pagination instead of loading every
record into the UI at once.

The frontend communicates with the FastAPI backend through REST APIs and
handles loading/error states.

### 6. Currency conversion

The backend includes a currency conversion service using a live
exchange-rate API with fallback caching.

Supported currencies include:

-   USD
-   EUR
-   INR
-   GBP

## Architecture

``` text
                         ┌─────────────────────┐
                         │    React Frontend   │
                         │   Analytics UI      │
                         └──────────┬──────────┘
                                    │
                              REST API calls
                                    │
                         ┌──────────▼──────────┐
                         │     FastAPI API     │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       Ingestion Services     Analytics Services    Currency Service
       JSON / CSV / XML       Metrics & Joins       Conversion
              │                     │
              └──────────┬──────────┘
                         ▼
                  ┌──────────────┐
                  │    SQLite    │
                  │ analytics.db │
                  └──────────────┘
```

## Data Processing Flow

``` text
JSON / CSV / XML
       │
       ▼
Data Ingestion
       │
       ▼
Validation & Normalization
       │
       ▼
SQLite Storage
       │
       ▼
Orders + Products + Shipments
       │
       ▼
Transformations & Business Logic
       │
       ▼
Analytics APIs
       │
       ▼
React Dashboard
```

## Backend

### Technology Stack

-   **Python 3.12+**
-   **FastAPI**
-   **SQLite 3**
-   **Pandas**
-   Standard Python libraries
-   REST APIs

### Backend structure

The backend follows a layered approach:

``` text
API layer
   ↓
Service layer
   ↓
Database layer
```

This keeps API handling, business logic, and database operations
separated.

A typical project structure is:

``` text
backend/
├── app/
│   ├── main.py
│   ├── api/
│   ├── services/
│   └── database/
├── analytics.db
├── requirements.txt
└── .gitignore
```

> The exact folder names may differ depending on the final repository
> structure.

### API Endpoints

#### Data ingestion

  Method   Endpoint             Purpose
  -------- -------------------- -----------------------------------------
  POST     `/api/ingest/json`   Ingest orders JSON data
  POST     `/api/ingest/xml`    Ingest shipment XML data
  POST     `/api/ingest/csv`    Ingest product CSV data
  POST     `/api/ingest/all`    Trigger the complete ingestion pipeline

#### Analytics and data

  Method   Endpoint                   Purpose
  -------- -------------------------- ----------------------------------------
  GET      `/api/analytics/summary`   Return KPI and chart data
  GET      `/api/orders`              Paginated orders with filtering/search
  GET      `/api/orders/{id}`         Return detailed order information
  GET      `/api/products`            Return product catalog data
  GET      `/api/shipments`           Return shipment tracking records

## Frontend

The frontend is built with **React** and communicates with the backend
through REST APIs.

The dashboard focuses on making the processed data understandable
through:

-   KPI cards
-   Charts
-   Filters
-   Tables
-   Pagination
-   Drill-down/details
-   Responsive components
-   Dynamic API data

The dashboard requirements also include view toggles and reusable UI
components where appropriate.

## Screenshots

Add the screenshots of the actual working application to a
`screenshots/` folder.

### Dashboard

Shows the main analytics dashboard with KPI cards, charts, and
analytical information.

![Dashboard]
<img width="1365" height="649" alt="Screenshot 2026-10-06 215831" src="https://github.com/user-attachments/assets/7cd8edb2-5815-4fc0-bbb7-dfd773299721" />


### Orders & Pagination

Shows the orders list and API-driven pagination.

![Orders Pagination]
<img width="1357" height="660" alt="Screenshot 2026-10-06 225642" src="https://github.com/user-attachments/assets/cb858ab6-4701-4c6a-b77e-bf11e73c8c7f" />


### Data Ingestion

Shows the data ingestion interface and the process of loading JSON, CSV,
and XML datasets.

[Data Ingestion]
<img width="1365" height="666" alt="Screenshot 2026-10-06 215927" src="https://github.com/user-attachments/assets/20f4ac7e-1fbc-4c67-b0ae-3bba5b46343a" />


### Analytics / Charts

Shows the analytical views generated from the processed datasets.

[Analytics]
<img width="1365" height="661" alt="Screenshot 2026-10-06 215852" src="https://github.com/user-attachments/assets/8742d25b-89ab-46ab-84b1-40239f66b972" />


> Replace the screenshot filenames above with the exact filenames you
> add to the repository.

## Running the Backend Locally

### 1. Clone the repository

``` bash
git clone <your-repository-url>
cd <repository-name>
```

### 2. Create a virtual environment

Windows:

``` bash
python -m venv venv
venv\Scripts\activate
```

macOS/Linux:

``` bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

``` bash
pip install -r requirements.txt
```

### 4. Start FastAPI

``` bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The API will be available at:

``` text
http://localhost:8000
```

FastAPI's interactive API documentation can normally be accessed at:

``` text
http://localhost:8000/docs
```

## Running the Frontend

From the frontend directory:

``` bash
npm install
npm run dev
```

Use the API URL expected by the frontend configuration to connect the
React application to the FastAPI backend.

## Database

The project uses **SQLite 3** with the database file:

``` text
analytics.db
```

SQLite was selected because the project requires relational storage for
the connected datasets while keeping the application simple to run and
deploy.

The database stores the normalized data used by the analytics and data
APIs.

For a larger production workload with many concurrent writes, the
database layer can later be migrated to PostgreSQL without changing the
overall API architecture.

## Data Processing Details

### JSON

Nested order structures are flattened so that order-level and item-level
information can be processed together.

### CSV

Product records are normalized and connected to the relevant
product/order relationships.

### XML

Shipment records are parsed to extract:

-   Shipment dates
-   Carrier information
-   Expected delivery dates
-   Actual delivery dates

### Joining

The processing layer combines:

``` text
Orders
   +
Order Items
   +
Products
   +
Shipments
```

This allows the dashboard to calculate business metrics using
information from multiple datasets.

## Example Analytics

The application can derive metrics such as:

``` text
Total Order Value
= Σ(quantity × product price)
```

Delivery status can be derived by comparing:

``` text
Actual Delivery Date
        >
Expected Delivery Date
```

Category analytics can then aggregate revenue, order count, quantity
sold, and average order value.

## API Documentation

When the backend is running, FastAPI provides interactive API
documentation through:

``` text
/docs
```

This can be used to test ingestion endpoints and analytical APIs
directly.

## Deployment

The FastAPI backend can be deployed as a Python web service.

For a Render deployment, the basic commands are:

**Build Command**

``` bash
pip install -r requirements.txt
```

**Start Command**

``` bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

The SQLite database file can be included with the project when it is
intended to provide initial/sample data.

For deployments where uploaded data must persist permanently across
server restarts, a persistent external database should be considered
instead of relying on a local SQLite file.

## Environment Variables

Keep secrets and environment-specific configuration outside the
repository.

Example:

``` text
.env
```

Do not commit `.env` to GitHub.

Add required environment variables through the deployment platform's
environment-variable settings.

## Project Goals

This project focuses on more than displaying charts. The main goal is to
demonstrate an end-to-end data workflow:

1.  Receive data in different formats
2.  Parse and validate the input
3.  Normalize inconsistent data
4.  Store related records
5.  Join multiple datasets
6.  Apply business transformations
7.  Expose the results through APIs
8.  Build a responsive analytical interface
9.  Support filtering, pagination, and detailed views

## What This Project Demonstrates

-   REST API development
-   FastAPI
-   React frontend development
-   Data ingestion
-   JSON / CSV / XML processing
-   Pandas-based data processing
-   Relational data modeling
-   SQLite
-   Data normalization
-   Cross-dataset joins
-   Business metric calculations
-   Currency conversion
-   API pagination
-   API-driven dashboards
-   Error and loading-state handling
-   Modular architecture
-   Separation of concerns

## Future Improvements

Possible improvements include:

-   PostgreSQL for larger production workloads
-   More advanced caching
-   Background/async ingestion jobs
-   Authentication and role-based access
-   More advanced analytics
-   Automated data-quality reporting
-   Additional export formats
-   More granular dashboard drill-downs

## Project Structure

``` text
Analytical_Dashboard/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── services/
│   │   ├── database/
│   │   └── main.py
│   ├── analytics.db
│   ├── requirements.txt
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```
By: Neha Singh (2315001455)
Built as a full-stack data analytics project demonstrating data ingestion, processing, backend API development, database management and interactive dashboard development.
------------------------------------------------------------------------
