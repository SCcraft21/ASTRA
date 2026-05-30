import sqlite3
import hashlib
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "users.db")

# ------------------ LOAD ENV VARIABLES ------------------
# Load .env.local if it exists
env_path = os.path.join(BASE_DIR, ".env.local")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#"):
                parts = line.split("=", 1)
                if len(parts) == 2:
                    key = parts[0].strip()
                    val = parts[1].strip().strip('"').strip("'")
                    os.environ[key] = val

# ------------------ SUPABASE CONNECTION ------------------
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase_client = None

if SUPABASE_URL and SUPABASE_KEY and "your-project-id" not in SUPABASE_URL:
    # Auto-clean trailing slashes and '/rest/v1' path if present
    SUPABASE_URL = SUPABASE_URL.strip().rstrip('/')
    if SUPABASE_URL.endswith('/rest/v1'):
        SUPABASE_URL = SUPABASE_URL[:-8].rstrip('/')
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[SUCCESS] Connected to Supabase backend database!")
    except Exception as e:
        print(f"[WARNING] Error initializing Supabase client: {e}. Falling back to SQLite.")
else:
    print("[INFO] Supabase environment variables not set or contain placeholders. Using local SQLite.")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    if supabase_client is not None:
        print("[SUCCESS] Using Supabase backend database. Please ensure you have run the schema migration in the Supabase SQL Editor.")
        return

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS developer_keys (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            scope TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            created TEXT NOT NULL,
            requests_count INTEGER DEFAULT 0 NOT NULL,
            requests_limit INTEGER DEFAULT 1000 NOT NULL
        )
    ''')
    conn.commit()
    conn.close()
    print("[SUCCESS] Local SQLite database initialized.")

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_user(name: str, email: str, password: str):
    if supabase_client is not None:
        try:
            # Query if user already exists
            response = supabase_client.table("users").select("id").eq("email", email).execute()
            if response.data:
                # Email already exists
                return False
            
            # Insert new user
            supabase_client.table("users").insert({
                "name": name,
                "email": email,
                "password_hash": hash_password(password)
            }).execute()
            return True
        except Exception as e:
            print(f"[ERROR] Supabase error in create_user: {e}")
            return False

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (name, email, hash_password(password))
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        # Email already exists
        return False
    finally:
        conn.close()

def verify_user(email: str, password: str):
    if supabase_client is not None:
        try:
            response = supabase_client.table("users").select("*").eq("email", email).eq("password_hash", hash_password(password)).execute()
            if response.data:
                # Supabase returns a list of matching records. Return the first one.
                return response.data[0]
            return None
        except Exception as e:
            print(f"[ERROR] Supabase error in verify_user: {e}")
            return None

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE email = ? AND password_hash = ?",
        (email, hash_password(password))
    )
    user = cursor.fetchone()
    conn.close()
    return user

def validate_and_increment_key(token: str) -> dict | None:
    if supabase_client is not None:
        try:
            # Query the key
            response = supabase_client.table("developer_keys").select("*").eq("token", token).execute()
            if not response.data:
                return None
            key = response.data[0]
            
            # Check limit
            if key["requests_count"] >= key["requests_limit"]:
                return {"valid": False, "reason": "Quota Exceeded"}
            
            # Increment count
            new_count = key["requests_count"] + 1
            supabase_client.table("developer_keys").update({"requests_count": new_count}).eq("id", key["id"]).execute()
            
            key["requests_count"] = new_count
            return {"valid": True, "key": key}
        except Exception as e:
            print(f"[ERROR] Supabase error in validate_and_increment_key: {e}")
            return None

    # SQLite fallback
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM developer_keys WHERE token = ?", (token,))
        row = cursor.fetchone()
        if not row:
            # Seed a demo key if it is requested and matches the offline demo token segment
            if token.startswith("astra_"):
                cursor.execute(
                    "INSERT INTO developer_keys (id, user_id, name, scope, token, created, requests_count, requests_limit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    ("demo_id", "local_guest", "Demo Local Gateway", "Full Access (Read/Write)", token, "May 30, 2026", 0, 1000)
                )
                conn.commit()
                cursor.execute("SELECT * FROM developer_keys WHERE token = ?", (token,))
                row = cursor.fetchone()
            else:
                return None
        
        key = dict(row)
        if key["requests_count"] >= key["requests_limit"]:
            return {"valid": False, "reason": "Quota Exceeded"}

        new_count = key["requests_count"] + 1
        cursor.execute("UPDATE developer_keys SET requests_count = ? WHERE id = ?", (new_count, key["id"]))
        conn.commit()
        key["requests_count"] = new_count
        return {"valid": True, "key": key}
    except Exception as e:
        print(f"[ERROR] SQLite error in validate_and_increment_key: {e}")
        return None
    finally:
        conn.close()
