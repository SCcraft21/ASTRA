import sys
import os
import torch
import torch.nn.functional as F
from tokenizers import ByteLevelBPETokenizer
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from fastapi import FastAPI, HTTPException, status
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add parent dir to path so we can import model
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

from model.gpt import GPT
from model.config import GPTConfig

# ------------------ DEVICE ------------------
device = "cuda" if torch.cuda.is_available() else "cpu"

# ------------------ LOAD TOKENIZER ------------------
tokenizer = ByteLevelBPETokenizer(
    os.path.join(BASE_DIR, "tokenizer/vocab.json"),
    os.path.join(BASE_DIR, "tokenizer/merges.txt")
)

vocab_size = tokenizer.get_vocab_size()

# ------------------ CONFIG ------------------
config = GPTConfig(
    vocab_size=vocab_size,
    block_size=256,
    n_embd=256,   
    n_layer=6,
    n_head=4
)
# ------------------ LOAD MODEL ------------------
model = GPT(config).to(device)
model_path = os.path.join(BASE_DIR, "checkpoints/model.pt")

if os.path.exists(model_path):
    model.load_state_dict(torch.load(model_path, map_location=device))
else:
    print(f"Warning: Model not found at {model_path}. Using uninitialized weights.")
model.eval()

# ------------------ GENERATION SETTINGS ------------------
temperature = 0.8
top_k = 40
max_new_tokens = 100
block_size = config.block_size

# ------------------ LOAD RAG MODEL ------------------
print("Loading RAG model...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# ------------------ LOAD DOCUMENTS ------------------
documents = []
corpus_path = os.path.join(BASE_DIR, "data/raw/corpus.txt")
try:
    with open(corpus_path, "r", encoding="utf-8") as f:
        content = f.read()
        documents = [doc.strip() for doc in content.split("\n\n") if len(doc.strip()) > 0]
    print(f"Loaded {len(documents)} documents for RAG.")
except FileNotFoundError:
    print(f"Warning: {corpus_path} not found. RAG will not have documents.")

# Precompute embeddings
doc_embeddings = embedder.encode(documents) if documents else []


# ------------------ RETRIEVE FUNCTION ------------------
def retrieve(query, k=3):
    if not documents:
        return []
    query_embedding = embedder.encode([query])
    similarities = cosine_similarity(query_embedding, doc_embeddings)[0]

    k = min(k, len(documents))
    if k == 0:
        return []

    top_indices = np.argsort(similarities)[-k:][::-1]
    return [documents[i] for i in top_indices]


# ------------------ GENERATE FUNCTION ------------------
def generate(tokens):
    generated = []
    for _ in range(max_new_tokens):

        cond_tokens = tokens[:, -block_size:]

        output = model(cond_tokens)
        logits = output[0] if isinstance(output, tuple) else output

        logits = logits[:, -1, :] / temperature

        # Top-k filtering
        if top_k is not None:
            values, _ = torch.topk(logits, top_k)
            logits[logits < values[:, [-1]]] = -float("Inf")

        probs = F.softmax(logits, dim=-1)
        next_token = torch.multinomial(probs, num_samples=1)

        tokens = torch.cat((tokens, next_token), dim=1)
        generated.append(next_token.item())

    return generated

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

# Serve static files for local development
from fastapi.staticfiles import StaticFiles
app.mount("/", StaticFiles(directory=BASE_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    # Bind to PORT if defined, otherwise default to 8000
    port = int(os.environ.get("PORT", 8000))
    # We pass 'app' directly so it can run reliably both locally and in hosted environments
    uvicorn.run(app, host="0.0.0.0", port=port)
