from datasets import load_dataset
from dataset_adapter import write_conversation, write_plain_text

output_file = "data/raw/corpus.txt"

seen = set()

def is_valid(text):
    if not text:
        return False
    text = text.strip()
    if len(text) < 20:
        return False
    if text in seen:
        return False
    seen.add(text)
    return True


with open(output_file, "w", encoding="utf-8") as out:

    print("Loading SQuAD...")
    squad = load_dataset("squad", split="train")

    for item in squad.select(range(10000)):
        q = item["question"]
        a = item["answers"]["text"][0]

        if is_valid(q) and is_valid(a):
            write_conversation(out, q, a)

    print("Added SQuAD")

    print("Loading Alpaca...")
    alpaca = load_dataset("tatsu-lab/alpaca", split="train")

    for item in alpaca.select(range(10000)):
        instruction = item["instruction"]
        output = item["output"]

        if is_valid(instruction) and is_valid(output):
            write_conversation(out, instruction, output)

    print("Added Alpaca")

    print("Loading OpenAssistant...")
    oasst = load_dataset("OpenAssistant/oasst1", split="train")

    for item in oasst.select(range(8000)):
        text = item.get("text", "")

        if is_valid(text):
            write_plain_text(out, text)

    print("Added OpenAssistant")

print("✅ corpus.txt created successfully!")