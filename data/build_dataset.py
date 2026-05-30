from data.registry import build_dataset
import data.dataset_sources.kaggle_wikipedia

# register datasets
import data.dataset_sources.squad
import data.dataset_sources.csv_dataset
import data.dataset_sources.alpaca


build_dataset(
    "kaggle_wikipedia",
    input_file="data/raw/wikipedia_text.csv",
    output_file="data/raw/corpus.txt",
    text_column="text"
)