from datasets import load_dataset
from data.registry import register_dataset
from data.dataset_adapter import write_conversation


@register_dataset("squad")
def load_squad_dataset(output_file, limit=5000):

    dataset = load_dataset("squad", split="train")

    with open(output_file, "w", encoding="utf-8") as out:

        for item in dataset.select(range(limit)):

            question = item["question"]
            answer = item["answers"]["text"][0]

            write_conversation(out, question, answer)

    print("SQuAD dataset processed.")