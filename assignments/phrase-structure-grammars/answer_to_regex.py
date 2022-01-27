import re


def case_insensitive(char: str) -> str:
    if char.isalpha():
        return f"[{char.lower()}{char.upper()}]"
    return ""


def convert(answer: str) -> str:
    # Add spacing around brackets
    r = re.sub(r"([\[\]])", r" \1 ", answer)
    # Escape special characters
    r = re.sub(r"([^\sa-zA-Z/])", lambda m: f"{re.escape(m.group())}", r)
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
    print(convert(answer))
