import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# Load embedding model
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Store data
documents = []
index = None


def build_index(text_file):
    global index, documents

    with open(text_file, "r", encoding="utf-8") as f:
        documents = [line.strip() for line in f if len(line.strip()) > 20]

    embeddings = embedder.encode(documents, show_progress_bar=True)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings))

    print("✅ RAG index built with", len(documents), "documents")


def retrieve(query, k=3):
    query_embedding = embedder.encode([query])
    distances, indices = index.search(np.array(query_embedding), k)

    return [documents[i] for i in indices[0]]