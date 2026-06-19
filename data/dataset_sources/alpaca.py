from datasets import load_dataset
from data.registry import register_dataset
from data.dataset_adapter import write_conversation


@register_dataset("alpaca")
def load_alpaca_dataset(output_file, limit=5000):

    dataset = load_dataset("tatsu-lab/alpaca", split="train")

    with open(output_file, "w", encoding="utf-8") as out:

        for item in dataset.select(range(limit)):

            instruction = item["instruction"]
            response = item["output"]

            write_conversation(out, instruction, response)

    print("Alpaca dataset processed.")