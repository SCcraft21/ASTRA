import csv

input_file = "data/raw/Wikipedia_text.csv"
output_file = "data/raw/corpus.txt"

with open(input_file, "r", encoding="utf-8") as csv_file, \
     open(output_file, "w", encoding="utf-8") as out:

    reader = csv.reader(csv_file)

    for row in reader:
        if len(row) > 0:
            text = row[0].strip()
            if len(text) > 20:
                out.write(text + "\n")

print("✅ corpus.txt created successfully!")