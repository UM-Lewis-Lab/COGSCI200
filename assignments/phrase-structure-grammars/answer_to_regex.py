import re


def case_insensitive(char: str) -> str:
    if char.isalpha():
        return f"[{char.lower()}{char.upper()}]"
    return ""


def convert(answer: str, include_lex: bool) -> str:
    r = answer
    if not include_lex:
        # Remove lexical items if not included
        r = re.sub(r"\[\s*([^\s\[\]]+)[^\[\]]+\]", r"[\1]", r)
    # Add spacing around brackets
    r = re.sub(r"([\[\]])", r" \1 ", r)
    # Escape special characters
    r = re.sub(r"([^\sa-zA-Z/])", lambda m: f"{re.escape(m.group())}", r)
    # Allow different versions of Det (D, Det, Det., etc.)
    r = re.sub(
        r"([^a-zA-Z])d(et)?([^a-zA-Z])",
        r"\1d(et\.?)?\3",
        r,
        flags=re.IGNORECASE
    )
    # Allow a punctuation mark at the end of the sentence.
    r = re.sub(r"(.+[A-Za-z])([^A-Za-z]*)$", r"\1[.!?]?\2", r)
    # Canvas uses ruby regex, so forward slashes need to be manually escaped.
    r = r.replace("/", "\\/")
    # Make case-insensitive (Canvas does not appear to support regex flags)
    r = re.sub(r"([A-Za-z])", lambda m: case_insensitive(m.group()), r)
    # Allow any amount / type of whitespace
    return re.sub(r"\s+", "\\\\s*", r)


if __name__ == "__main__":
    from sys import argv

    with open(argv[1], "r") as f:
        answer = f.read().strip()
    include_lex = len(argv) <= 2 or argv[2].lower() == "true"
    print(convert(answer, include_lex))
