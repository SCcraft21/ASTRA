import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
# pyrefly: ignore [missing-import]
from tokenizers import ByteLevelBPETokenizer
from model.gpt import GPT
from model.config import GPTConfig

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

# ------------------ LOAD TOKENIZED DATA ------------------
data = np.load("data/tokenized.npy")

#LIMIT DATA SIZE 
MAX_TOKENS = 200000
if len(data) > MAX_TOKENS:
    data = data[:MAX_TOKENS]
data = torch.tensor(data, dtype=torch.long)

# ------------------ DATASET CLASS (FAST & MEMORY SAFE) ------------------
class TextDataset(torch.utils.data.Dataset):
    def __init__(self, data, block_size):
        self.data = data
        self.block_size = block_size

    def __len__(self):
        return len(self.data) - self.block_size

    def __getitem__(self, idx):
        x = self.data[idx:idx + self.block_size]
        y = self.data[idx + 1:idx + self.block_size + 1]
        return x, y


print("Preparing dataset...")

dataset = TextDataset(data, config.block_size)

print("Dataset size:", len(dataset))

dataloader = DataLoader(
    dataset,
    batch_size=config.batch_size,
    shuffle=True,
    num_workers=0   # IMPORTANT for Windows
)

# ------------------ MODEL ------------------
model = GPT(config).to(device)

# ------------------ OPTIMIZER ------------------
optimizer = torch.optim.AdamW(model.parameters(), lr=config.learning_rate)

# ------------------ LOSS FUNCTION ------------------
criterion = nn.CrossEntropyLoss()

# ------------------ TRAINING ------------------
epochs = config.epochs
scaler = torch.amp.GradScaler('cuda')

print("Starting training...")

for epoch in range(epochs):
    total_loss = 0

    for step, (x, y) in enumerate(dataloader):

        x = x.to(device)
        y = y.to(device)

        optimizer.zero_grad()

        # Forward pass with Mixed Precision
        with torch.amp.autocast('cuda'):
            output = model(x)
            logits = output[0] if isinstance(output, tuple) else output

            # Reshape for loss
            logits = logits.view(-1, config.vocab_size)
            y = y.view(-1)

            loss = criterion(logits, y)

        # Backprop with scaler
        scaler.scale(loss).backward()

        # Gradient clipping (IMPORTANT)
        scaler.unscale_(optimizer)
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)

        scaler.step(optimizer)
        scaler.update()

        total_loss += loss.item()

        if step % 10 == 0:
            print(f"Epoch {epoch+1}, Step {step}, Loss: {loss.item():.4f}")

    avg_loss = total_loss / len(dataloader)
    print(f"\n Epoch {epoch+1} completed. Avg Loss: {avg_loss:.4f}\n")

# ------------------ SAVE MODEL ------------------
torch.save(model.state_dict(), "checkpoints/model.pt")

print("💾 Model saved to checkpoints/model.pt")
