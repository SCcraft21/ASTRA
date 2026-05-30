import csv
from data.registry import register_dataset
from data.dataset_adapter import write_plain_text


@register_dataset("kaggle_wikipedia")
def load_kaggle_wikipedia(input_file, output_file, text_column="text"):

    with open(input_file, "r", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)

        with open(output_file, "w", encoding="utf-8") as out:

            for row in reader:
                text = row.get(text_column, "")
                write_plain_text(out, text)

    print("Kaggle Wikipedia dataset processed.")