import os
from tokenizers import ByteLevelBPETokenizer

# Absolute path (avoid Windows path issues)
data_path = "C:/Users/User/OneDrive/Desktop/ASTRA/data/raw/wikipedia_text.csv"

# Debug info
print("File exists:", os.path.exists(data_path))
print("File size (bytes):", os.path.getsize(data_path))

# Initialize tokenizer
tokenizer = ByteLevelBPETokenizer()

# Train tokenizer
tokenizer.train(
    files=data_path,
    vocab_size=32000,
    min_frequency=2,
    special_tokens=[
    "<s>",
    "</s>",
    "<pad>",
    "<unk>",
    "<USER>",
    "<ASSISTANT>",
    "<SYSTEM>"
    ]
)

# Save tokenizer files
tokenizer.save_model("./")

print("Tokenizer training complete.")