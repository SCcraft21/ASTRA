import re


def clean_text(text: str) -> str:
    """
    Basic cleaning for dataset text.
    Removes excessive whitespace and newlines.
    """

    if text is None:
        return ""

    text = str(text)
    text = text.replace("\n", " ").replace("\r", " ")
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def write_conversation(out_file, user_text: str, assistant_text: str):
    """
    Writes a conversation pair to corpus.txt
    using the standardized ASTRA training format.
    """

    user_text = clean_text(user_text)
    assistant_text = clean_text(assistant_text)

    # Skip invalid rows
    if not user_text or not assistant_text:
        return

    out_file.write(f"<USER> {user_text}\n")
    out_file.write(f"<SYSTEM> {assistant_text}\n\n")


def write_instruction(out_file, instruction: str, response: str):
    """
    Alternative format for instruction datasets
    such as Alpaca or instruction-tuning datasets.
    """

    instruction = clean_text(instruction)
    response = clean_text(response)

    if not instruction or not response:
        return

    out_file.write(f"<USER> {instruction}\n")
    out_file.write(f"<SYSTEM> {response}\n\n")


def write_plain_text(out_file, text: str):
    """
    Writes raw text paragraphs for general language modeling.
    Useful for Wikipedia or book datasets.
    """

    text = clean_text(text)

    if not text:
        return

    out_file.write(text + "\n\n")