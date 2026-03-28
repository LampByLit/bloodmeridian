"""
Repair Hangul mojibake in media/bloodmeridian.md.

Only joins letter groups that were split by Hangul in the source (plus a few
safe literal fixes), so we do not merge legitimate phrases like "in trust".
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

from english_words import get_english_words_set

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "media" / "bloodmeridian.md"

WS_LOWER = {w.lower() for w in get_english_words_set(["web2"], lower=True)}

LITERAL_FIXES: list[tuple[str, str]] = [
    (r"Neigh or", "Neighbor"),
    (r"\bmoneyto\b", "money to"),
    (r"\blikea\b", "like a"),
    (r"The devil\.Here", "The devil. Here"),
    (r"across the marsh and\.", "across the marshland."),
    (r"\bmay beshaped\b", "may be shaped"),
    (r"\bthegood book\b", "the good book"),
    (r"\bmanholding\b", "man holding"),
]

ELEVEN_WHO_PATTERN = re.compile(
    r"years said[\uAC00-\uD7AF\s]*\n\s*eleven ho\b",
    re.MULTILINE,
)

# prefix + Hangul + (optional space) + suffix -> one word when valid
SPLIT_WORD_PATTERN = re.compile(
    r"([a-zA-Z]{1,15})[\uAC00-\uD7AF]+\s*([a-zA-Z]{2,25})\b"
)

# stem + " ng" + Hangul -> stem + "ing" (clothing, discussing, …)
STEM_NG_PATTERN = re.compile(r"\b([a-zA-Z]{3,}) (ng)([\uAC00-\uD7AF]+)")


def merge_hangul_splits(text: str) -> str:
    changed = True
    while changed:
        changed = False

        def split_repl(m: re.Match[str]) -> str:
            a, b = m.group(1), m.group(2)
            if (a + b).lower() in WS_LOWER:
                return a + b
            return m.group(0)

        n = SPLIT_WORD_PATTERN.sub(split_repl, text)
        if n != text:
            text, changed = n, True

        def stem_repl(m: re.Match[str]) -> str:
            stem = m.group(1)
            w = stem + "ing"
            if w.lower() in WS_LOWER:
                return w
            return m.group(0)

        n = STEM_NG_PATTERN.sub(stem_repl, text)
        if n != text:
            text, changed = n, True

    return text


def strip_remaining_hangul(text: str) -> str:
    return re.sub(r"[\uAC00-\uD7AF]+", "", text)


def collapse_line_spaces(text: str) -> str:
    lines = [re.sub(r" +", " ", ln).strip() for ln in text.splitlines()]
    return "\n".join(lines)


def fix_text(raw: str) -> str:
    s = ELEVEN_WHO_PATTERN.sub("years--I said eleven--who", raw)
    s = merge_hangul_splits(s)
    s = strip_remaining_hangul(s)
    s = collapse_line_spaces(s)
    for pat, rep in LITERAL_FIXES:
        s = re.sub(pat, rep, s)
    return s


def main() -> None:
    out_path = SOURCE
    if len(sys.argv) > 1:
        out_path = Path(sys.argv[1])

    text = SOURCE.read_text(encoding="utf-8")
    fixed = fix_text(text)

    bad = [c for c in fixed if ord(c) > 127]
    if bad:
        print("Non-ASCII remains:", len(bad), file=sys.stderr)
        sys.exit(1)

    hangul_left = sum(1 for c in fixed if "\uac00" <= c <= "\ud7a3")
    if hangul_left:
        print("Hangul remains:", hangul_left, file=sys.stderr)
        sys.exit(1)

    out_path.write_text(fixed, encoding="utf-8", newline="\n")
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    main()
