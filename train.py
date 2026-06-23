import torch
import os
# Set PyTorch threads to use all CPU cores
if not torch.cuda.is_available():
    cores = os.cpu_count() or 4
    torch.set_num_threads(cores)
    print(f"Setting PyTorch threads to: {cores}")

import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
# pyrefly: ignore [missing-import]
from tokenizers import ByteLevelBPETokenizer
from model.harvard import HarvardGPT
from model.config import GPTConfig

# ------------------ DEVICE ------------------
device = "cuda" if torch.cuda.is_available() else "cpu"

# ------------------ LOAD TOKENIZER ------------------
tokenizer = ByteLevelBPETokenizer(
    "tokenizer/vocab.json",
    "tokenizer/merges.txt"
)
tokenizer.add_special_tokens(["<s>", "</s>", "<pad>", "<unk>", "<USER>", "<ASSISTANT>", "<SYSTEM>"])

vocab_size = tokenizer.get_vocab_size()

# ------------------ CONFIG ------------------
config = GPTConfig(
    vocab_size=vocab_size,
    block_size=128,
    n_embd=128,
    n_layer=2,
    n_head=4
)
config.epochs = 10
config.batch_size = 32
config.learning_rate = 1e-3

# ------------------ LOAD TOKENIZED DATA ------------------
data = np.load("data/tokenized.npy")

#LIMIT DATA SIZE (Use full dataset)
MAX_TOKENS = 2000000
if len(data) > MAX_TOKENS:
    data = data[:MAX_TOKENS]
data = torch.tensor(data, dtype=torch.long)

# ------------------ DATASET CLASS (FAST & MEMORY SAFE) ------------------
class TextDataset(torch.utils.data.Dataset):
    def __init__(self, data, block_size, stride=192):
        self.data = data
        self.block_size = block_size
        self.stride = stride

    def __len__(self):
        return (len(self.data) - self.block_size - 1) // self.stride + 1

    def __getitem__(self, idx):
        start_idx = idx * self.stride
        x = self.data[start_idx:start_idx + self.block_size]
        y = self.data[start_idx + 1:start_idx + self.block_size + 1]
        return x, y


print("Preparing dataset...")

dataset = TextDataset(data, config.block_size, stride=192)

print("Dataset size:", len(dataset))

dataloader = DataLoader(
    dataset,
    batch_size=config.batch_size,
    shuffle=True,
    num_workers=0   # IMPORTANT for Windows
)

# ------------------ MODEL ------------------
model = HarvardGPT(config).to(device)

# ------------------ OPTIMIZER ------------------
optimizer = torch.optim.AdamW(model.parameters(), lr=config.learning_rate)

# ------------------ LOSS FUNCTION ------------------
criterion = nn.CrossEntropyLoss()

# ------------------ TRAINING ------------------
epochs = config.epochs
use_cuda = device == "cuda"

if use_cuda:
    scaler = torch.amp.GradScaler('cuda')
else:
    scaler = None

print("Starting training...")

for epoch in range(epochs):
    total_loss = 0

    for step, (x, y) in enumerate(dataloader):

        x = x.to(device)
        y = y.to(device)

        optimizer.zero_grad()

        if use_cuda:
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
        else:
            output = model(x)
            logits = output[0] if isinstance(output, tuple) else output

            # Reshape for loss
            logits = logits.view(-1, config.vocab_size)
            y = y.view(-1)

            loss = criterion(logits, y)

            loss.backward()

            # Gradient clipping (IMPORTANT)
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)

            optimizer.step()

        total_loss += loss.item()

        if step % 10 == 0:
            print(f"Epoch {epoch+1}, Step {step}, Loss: {loss.item():.4f}")

    avg_loss = total_loss / len(dataloader)
    print(f"\n Epoch {epoch+1} completed. Avg Loss: {avg_loss:.4f}\n")

    # Save checkpoint at every epoch completion
    epoch_path = f"checkpoints/harvard_model_epoch{epoch+1}.pt"
    torch.save(model.state_dict(), epoch_path)
    print(f"Checkpoint saved: {epoch_path}")

# ------------------ SAVE FINAL MODEL ------------------
torch.save(model.state_dict(), "checkpoints/harvard_model.pt")

print("Final model saved to checkpoints/harvard_model.pt")
