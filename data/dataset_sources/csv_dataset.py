import csv
from data.registry import register_dataset
from data.dataset_adapter import write_conversation


@register_dataset("csv")
def load_csv_dataset(input_file, output_file, question_col, answer_col):

    with open(input_file, "r", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)

        with open(output_file, "w", encoding="utf-8") as out:

            for row in reader:

                question = row[question_col]
                answer = row[answer_col]

                write_conversation(out, question, answer)

    print("CSV dataset processed.")