import sqlite3
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DB_PATH = BASE_DIR / "analytics.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Products table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS products (
            product_id TEXT PRIMARY KEY,
            product_name TEXT NOT NULL,
            category TEXT NOT NULL
        )
    """)
    
    # Orders table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            order_id TEXT PRIMARY KEY,
            customer_id TEXT,
            customer_name TEXT,
            order_date TEXT NOT NULL
        )
    """)
    
    # Order items table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            product_id TEXT NOT NULL,
            qty INTEGER NOT NULL,
            price REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders (order_id),
            FOREIGN KEY (product_id) REFERENCES products (product_id)
        )
    """)
    
    # Shipments table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS shipments (
            shipment_id TEXT PRIMARY KEY,
            order_id TEXT NOT NULL,
            carrier TEXT,
            tracking_number TEXT,
            shipped_date TEXT,
            expected_delivery_date TEXT,
            actual_delivery_date TEXT,
            status TEXT,
            FOREIGN KEY (order_id) REFERENCES orders (order_id)
        )
    """)
    
    # Ingestion logs table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ingestion_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_type TEXT NOT NULL,
            file_name TEXT NOT NULL,
            records_processed INTEGER NOT NULL,
            status TEXT NOT NULL,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Users table for Authentication
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'Data Analyst',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Seed default user if no users exist
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        import hashlib
        default_pass = "admin123"
        pass_hash = hashlib.sha256(default_pass.encode()).hexdigest()
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, role)
            VALUES ('Jaydon Frankie', 'jaydon@pulse.com', ?, 'Senior Data Lead')
        """, (pass_hash,))
    
    conn.commit()
    conn.close()
