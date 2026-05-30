import sys
import os
import torch
import torch.nn.functional as F
from tokenizers import ByteLevelBPETokenizer
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from fastapi import FastAPI, HTTPException, status, Header
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add parent dir to path so we can import model and generate.py
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

import generate as generator

# Unify aliases from unified generator module
retrieve = generator.retrieve
tokenizer = generator.tokenizer
device = generator.device

def generate(tokens):
    return generator.generate(tokens)

# ------------------ DATABASE ------------------
from api.database import init_db, create_user, verify_user



# ------------------ FASTAPI APP ------------------
app = FastAPI(title="ASTRA API")

@app.on_event("startup")
def startup_event():
    init_db()

# Allow CORS for Vercel frontend or any other clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production (e.g., ["https://your-vercel-frontend.vercel.app"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    query: str

class GenerateResponse(BaseModel):
    response: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/register")
def register_endpoint(request: RegisterRequest):
    success = create_user(request.name, request.email, request.password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return {"message": "User registered successfully"}

@app.post("/api/login")
def login_endpoint(request: LoginRequest):
    user = verify_user(request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    return {
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }

@app.post("/api/generate", response_model=GenerateResponse)
def generate_response(request: GenerateRequest):
    user_input = request.query

    # RAG retrieval
    retrieved_docs = retrieve(user_input)
    context = "\n\n".join(retrieved_docs)

    # Correct prompt format
    prompt = f"{context}\n\n<USER> {user_input}\n<SYSTEM>"

    # Tokenize
    input_ids = tokenizer.encode(prompt).ids
    tokens = torch.tensor(input_ids, dtype=torch.long).unsqueeze(0).to(device)

    # Generate
    output_tokens = generate(tokens)

    # Decode
    response = tokenizer.decode(output_tokens)

    # Extract response
    if "<USER>" in response:
        response = response.split("<USER>")[0]
    if "<SYSTEM>" in response:
        response = response.split("<SYSTEM>")[0]

    return GenerateResponse(response=response.strip())

class ExternalGenerateRequest(BaseModel):
    prompt: str
    temperature: float = 0.8
    system_calibrator_sync: bool = True

@app.post("/api/v1/context/generate")
def external_generate_endpoint(request: ExternalGenerateRequest, authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header. Use 'Bearer <API_KEY>'."
        )
    
    token = authorization.split(" ")[1]
    
    from api.database import validate_and_increment_key
    validation = validate_and_increment_key(token)
    
    if not validation:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key credentials."
        )
    
    if not validation["valid"]:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"API Quota limit exceeded: {validation['reason']}"
        )
        
    user_input = request.prompt
    
    # RAG retrieval
    retrieved_docs = retrieve(user_input)
    context = "\n\n".join(retrieved_docs)

    # Correct prompt format
    prompt = f"{context}\n\n<USER> {user_input}\n<SYSTEM>"

    # Tokenize
    input_ids = tokenizer.encode(prompt).ids
    tokens = torch.tensor(input_ids, dtype=torch.long).unsqueeze(0).to(device)

    # Generate using request temperature
    prev_temp = generator.temperature
    generator.temperature = request.temperature
    try:
        output_tokens = generate(tokens)
    finally:
        generator.temperature = prev_temp

    # Decode
    response = tokenizer.decode(output_tokens)

    # Extract response
    if "<USER>" in response:
        response = response.split("<USER>")[0]
    if "<SYSTEM>" in response:
        response = response.split("<SYSTEM>")[0]

    return {
        "generation": response.strip(),
        "key_usage": {
            "name": validation["key"]["name"],
            "scope": validation["key"]["scope"],
            "requests_count": validation["key"]["requests_count"],
            "requests_limit": validation["key"]["requests_limit"]
        }
    }

def get_index_path():
    dist_index = os.path.join(BASE_DIR, "dist", "index.html")
    if os.path.exists(dist_index):
        return dist_index
    return os.path.join(BASE_DIR, "index.html")

# HTML Page Routes (supporting client-side SPA routing for new premium dashboard)
@app.get("/")
def read_hero():
    return FileResponse(get_index_path())

@app.get("/chat")
def read_chat():
    return FileResponse(get_index_path())

@app.get("/capabilities")
def read_capabilities():
    return FileResponse(os.path.join(BASE_DIR, "pages", "capabilities.html"))

@app.get("/memory")
def read_memory():
    return FileResponse(get_index_path())

@app.get("/threshold")
def read_threshold():
    return FileResponse(os.path.join(BASE_DIR, "pages", "final_threshold.html"))

@app.get("/register")
def read_register():
    return FileResponse(get_index_path())

@app.get("/login")
def read_login():
    return FileResponse(get_index_path())

@app.get("/api-keys")
def read_api_keys():
    return FileResponse(get_index_path())

@app.get("/developer")
def read_developer():
    return FileResponse(os.path.join(BASE_DIR, "pages", "developer.html"))

@app.get("/ambient")
def read_ambient():
    return FileResponse(os.path.join(BASE_DIR, "pages", "ambient.html"))

# Serve static files for local development (either compiled 'dist/' or base dir)
from fastapi.staticfiles import StaticFiles
dist_dir = os.path.join(BASE_DIR, "dist")
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="static")
else:
    app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    # Bind to PORT if defined, otherwise default to 3000
    port = int(os.environ.get("PORT", 3000))
    # We pass 'app' directly so it can run reliably both locally and in hosted environments
    uvicorn.run(app, host="0.0.0.0", port=port)
