from tokenizers import ByteLevelBPETokenizer
import numpy as np

tokenizer = ByteLevelBPETokenizer(
    "tokenizer/vocab.json",
    "tokenizer/merges.txt"
)
tokenizer.add_special_tokens(["<s>", "</s>", "<pad>", "<unk>", "<USER>", "<ASSISTANT>", "<SYSTEM>"])

with open("data/raw/corpus.txt", "r", encoding="utf-8") as f:
    text = f.read()

print("Tokenizing...")
ids = tokenizer.encode(text).ids

np.save("data/tokenized.npy", ids)

print("Tokenization complete!")

