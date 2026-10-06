import hashlib
import uuid
from ..database.connection import get_db_connection

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def register_user(name: str, email: str, password: str, role: str = "Data Analyst"):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check duplicate email
    cursor.execute("SELECT id FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    if cursor.fetchone():
        conn.close()
        raise ValueError("User with this email already exists")

    p_hash = hash_password(password)
    cursor.execute("""
        INSERT INTO users (name, email, password_hash, role)
        VALUES (?, ?, ?, ?)
    """, (name.strip(), email.strip().lower(), p_hash, role.strip()))
    
    user_id = cursor.lastrowid
    conn.commit()
    conn.close()

    token = f"token_{user_id}_{uuid.uuid4().hex[:12]}"
    return {
        "id": user_id,
        "name": name.strip(),
        "email": email.strip().lower(),
        "role": role.strip(),
        "token": token
    }

def authenticate_user(email: str, password: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    p_hash = hash_password(password)
    cursor.execute("""
        SELECT id, name, email, role FROM users
        WHERE LOWER(email) = LOWER(?) AND password_hash = ?
    """, (email.strip(), p_hash))
    
    user = cursor.fetchone()
    conn.close()

    if not user:
        raise ValueError("Invalid email or password")

    token = f"token_{user['id']}_{uuid.uuid4().hex[:12]}"
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "token": token
    }

def get_user_profile(email: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    user = cursor.fetchone()
    conn.close()
    if not user:
        return None
    return dict(user)
