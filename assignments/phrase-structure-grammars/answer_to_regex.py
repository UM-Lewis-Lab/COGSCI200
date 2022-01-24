import re


def case_insensitive(char: str) -> str:
    if char:
        return f"[{char.lower()}{char.upper()}]"
    return ""


def convert(answer: str) -> str:
    # Escape brackets
    r = re.sub(r"(\[|\])", lambda m: re.escape(m.group()), answer)
    # Make case-insensitive (Canvas does not appear to support regex flags)
    r = re.sub(r"([A-Za-z])", lambda m: case_insensitive(m.group()), r)
    # Allow any amount / type of whitespace
    return re.sub(r"\s+", "\\\\s*", r)


if __name__ == "__main__":
    from sys import argv

    with open(argv[1], "r") as f:
        answer = f.read().strip()
    print(convert(answer))
