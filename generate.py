import torch
import torch.nn.functional as F
from tokenizers import ByteLevelBPETokenizer
from model.gpt import GPT
from model.config import GPTConfig
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# ------------------ DEVICE ------------------
device = "cuda" if torch.cuda.is_available() else "cpu"

# ------------------ LOAD TOKENIZER ------------------
tokenizer = ByteLevelBPETokenizer(
    "tokenizer/vocab.json",
    "tokenizer/merges.txt"
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
model.load_state_dict(torch.load("checkpoints/model.pt", map_location=device))
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

with open("data/raw/corpus.txt", "r", encoding="utf-8") as f:
    content = f.read()
    documents = [doc.strip() for doc in content.split("\n\n") if len(doc.strip()) > 0]

print(f"Loaded {len(documents)} documents.")

# Precompute embeddings or load from cached file to start instantly
import os
embeddings_cache_path = "data/raw/corpus_embeddings.npy"

if os.path.exists(embeddings_cache_path):
    print("Loading precomputed RAG embeddings from cache...")
    doc_embeddings = np.load(embeddings_cache_path)
else:
    print("Precomputing RAG embeddings (this may take a few minutes on first run)...")
    doc_embeddings = embedder.encode(documents, show_progress_bar=True)
    os.makedirs(os.path.dirname(embeddings_cache_path), exist_ok=True)
    np.save(embeddings_cache_path, doc_embeddings)
    print("RAG embeddings cached successfully.")


# ------------------ RETRIEVE FUNCTION ------------------
def retrieve(query, k=3):
    query_embedding = embedder.encode([query])
    similarities = cosine_similarity(query_embedding, doc_embeddings)[0]

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


# ------------------ MAIN LOOP ------------------
if __name__ == "__main__":
    while True:
        user_input = input("\nUser: ")

        if user_input.lower() in ["exit", "quit"]:
            print("Exiting ASTRA...")
            break

        #RAG retrieval
        retrieved_docs = retrieve(user_input)
        context = "\n\n".join(retrieved_docs)

        #Correct prompt format
        prompt = f"""{context}

<USER> {user_input}
<SYSTEM>"""

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

        print("\nASTRA:", response.strip())
