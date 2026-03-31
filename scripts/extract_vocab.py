from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path

import fitz
import numpy as np
from rapidocr_onnxruntime import RapidOCR


JAPANESE_RE = re.compile(r"[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]")
HIRAGANA_RE = re.compile(r"^[\u3040-\u309fー\s・]+$")
ASCII_RE = re.compile(r"[A-Za-z]")
DIGITS_RE = re.compile(r"^\d{1,4}$")


@dataclass
class OcrItem:
    text: str
    score: float
    x0: float
    y0: float
    x1: float
    y1: float

    @property
    def height(self) -> float:
        return self.y1 - self.y0

    @property
    def width(self) -> float:
        return self.x1 - self.x0


def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def has_japanese(text: str) -> bool:
    return bool(JAPANESE_RE.search(text))


def is_hiragana(text: str) -> bool:
    sample = clean_text(text)
    return bool(sample) and bool(HIRAGANA_RE.match(sample))


def has_ascii(text: str) -> bool:
    return bool(ASCII_RE.search(text))


def mostly_ascii(text: str) -> bool:
    sample = clean_text(text)
    if not sample:
        return False
    ascii_count = sum(1 for ch in sample if ch.isascii() and ch.isalpha())
    return ascii_count >= max(3, len(sample) // 3)


def box_to_rect(box: list[list[float]]) -> tuple[float, float, float, float]:
    xs = [point[0] for point in box]
    ys = [point[1] for point in box]
    return min(xs), min(ys), max(xs), max(ys)


def item_sort_key(item: OcrItem) -> tuple[float, float]:
    return (item.y0, item.x0)


def find_number_markers(items: list[OcrItem], max_id: int) -> list[tuple[int, float]]:
    markers: list[tuple[int, float]] = []
    for item in items:
        text = item.text.replace("O", "0").replace("o", "0")
        if item.x0 > 320 or item.width > 120:
            continue
        if not DIGITS_RE.match(text):
            continue
        value = int(text)
        if not 1 <= value <= max_id:
            continue
        markers.append((value, item.y0))

    markers.sort(key=lambda pair: pair[1])

    deduped: list[tuple[int, float]] = []
    for value, y0 in markers:
        if deduped and abs(deduped[-1][1] - y0) < 16:
            if abs(value - deduped[-1][0]) < 3:
                continue
        deduped.append((value, y0))
    return deduped


def pick_word(items: list[OcrItem]) -> str:
    candidates = [
        item
        for item in items
        if 70 <= item.x0 <= 450
        and has_japanese(item.text)
        and not mostly_ascii(item.text)
        and len(item.text) <= 18
    ]
    if not candidates:
        return ""
    candidates.sort(key=lambda item: (-item.height, item.y0, item.x0))
    return candidates[0].text


def pick_reading(items: list[OcrItem], word: str) -> str:
    if not word:
        return ""
    word_items = [item for item in items if item.text == word]
    if not word_items:
        return ""
    anchor = sorted(word_items, key=item_sort_key)[0]
    candidates = [
        item
        for item in items
        if item.y0 >= anchor.y0
        and abs(item.x0 - anchor.x0) < 120
        and is_hiragana(item.text)
        and item.text != word
    ]
    if not candidates:
        return ""
    candidates.sort(key=item_sort_key)
    return candidates[0].text


def pick_meaning(items: list[OcrItem]) -> str:
    candidates = [
        item
        for item in items
        if 70 <= item.x0 <= 460
        and has_ascii(item.text)
        and len(item.text) <= 40
        and item.text.lower() not in {"section", "chapter", "n1"}
    ]
    if not candidates:
        return ""
    candidates.sort(key=item_sort_key)
    for item in candidates:
        lowered = item.text.lower()
        if any(token in lowered for token in ["she ", "he ", "they ", "when ", "my ", "i ", "we "]):
            continue
        return item.text
    return candidates[0].text


def combine_lines(items: list[OcrItem], min_x: float, max_len: int, require_ascii: bool) -> str:
    candidates = [item for item in items if item.x0 >= min_x]
    if require_ascii:
        candidates = [item for item in candidates if has_ascii(item.text)]
    else:
        candidates = [item for item in candidates if has_japanese(item.text)]
    if not candidates:
        return ""
    candidates.sort(key=item_sort_key)
    lines: list[str] = []
    for item in candidates[:4]:
        lines.append(item.text)
    text = " ".join(lines)
    return text[:max_len].strip()


def extract_page_entries(
    items: list[OcrItem], page_height: float, max_id: int
) -> list[dict[str, str | int]]:
    markers = find_number_markers(items, max_id=max_id)
    if not markers:
        return []

    entries: list[dict[str, str | int]] = []
    for index, (entry_id, y0) in enumerate(markers):
        next_y = markers[index + 1][1] if index + 1 < len(markers) else page_height
        band_items = [
            item
            for item in items
            if y0 - 14 <= item.y0 < next_y - 4
            and item.text.lower() not in {"section", "chapter"}
        ]
        word = pick_word(band_items)
        meaning = pick_meaning(band_items)
        if not word or not meaning:
            continue
        entries.append(
            {
                "id": entry_id,
                "word": word,
                "reading": pick_reading(band_items, word),
                "meaning": meaning,
                "exampleJa": combine_lines(band_items, min_x=420, max_len=180, require_ascii=False),
                "exampleEn": combine_lines(band_items, min_x=420, max_len=220, require_ascii=True),
            }
        )
    return entries


def extract_dataset(
    pdf_path: Path,
    output_path: Path,
    page_start: int,
    page_end: int,
    max_id: int,
    scale: float,
) -> None:
    pdf = fitz.open(pdf_path)
    engine = RapidOCR()
    entries_by_id: dict[int, dict[str, str | int]] = {}

    for page_index in range(page_start, min(page_end, pdf.page_count)):
        page = pdf.load_page(page_index)
        pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
        img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
        result, _ = engine(img)
        if not result:
            continue

        items = []
        for box, text, score in result:
            cleaned = clean_text(text)
            if not cleaned:
                continue
            x0, y0, x1, y1 = box_to_rect(box)
            items.append(OcrItem(cleaned, float(score), x0, y0, x1, y1))

        page_entries = extract_page_entries(items, page_height=pix.height, max_id=max_id)
        for entry in page_entries:
            entry_id = int(entry["id"])
            current = entries_by_id.get(entry_id)
            if current is None:
                entries_by_id[entry_id] = {**entry, "sourcePage": page_index + 1}
                continue

            current_word = str(current.get("word", ""))
            next_word = str(entry.get("word", ""))
            current_meaning = str(current.get("meaning", ""))
            next_meaning = str(entry.get("meaning", ""))
            if len(next_word) > len(current_word) or len(next_meaning) > len(current_meaning):
                entries_by_id[entry_id] = {**entry, "sourcePage": page_index + 1}

    dataset = [entries_by_id[key] for key in sorted(entries_by_id)]
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(dataset, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Extracted {len(dataset)} entries to {output_path}")
    if dataset:
        print(f"First id: {dataset[0]['id']}  Last id: {dataset[-1]['id']}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf")
    parser.add_argument("output")
    parser.add_argument("--page-start", type=int, default=8)
    parser.add_argument("--page-end", type=int, default=302)
    parser.add_argument("--max-id", type=int, default=1852)
    parser.add_argument("--scale", type=float, default=2.2)
    args = parser.parse_args()

    extract_dataset(
        pdf_path=Path(args.pdf),
        output_path=Path(args.output),
        page_start=args.page_start,
        page_end=args.page_end,
        max_id=args.max_id,
        scale=args.scale,
    )


if __name__ == "__main__":
    main()
