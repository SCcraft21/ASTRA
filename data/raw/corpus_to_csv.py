import csv

input_file = "C:/Users/User/OneDrive/Desktop/ASTRA/data/raw/dataset.csv.csv"
output_file = "C:/Users/User/OneDrive/Desktop/ASTRA/data/raw/Conversation.csv"

with open(input_file, "r", encoding="utf-8") as csv_file:
    reader = csv.DictReader(csv_file)

    with open(output_file, "w", encoding="utf-8") as out:

        for row in reader:

            question = row["question"]
            answer = row["answer"]

            out.write(f"<USER> {question}\n")
            out.write(f"<SYSTEM> {answer}\n\n")

print("Corpus created successfully.")