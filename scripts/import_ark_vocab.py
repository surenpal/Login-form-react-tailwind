from __future__ import annotations

import argparse
import json
import re
import subprocess
import shutil
from pathlib import Path

import fitz
import numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR


JAPANESE_RE = re.compile(r"[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]")
KANA_RE = re.compile(r"[\u3040-\u30ffー]+")
ASCII_RE = re.compile(r"[A-Za-z]")
MEANING_RE = re.compile(r"[A-Za-z][A-Za-z /\-']{1,50}")
JAPANESE_WITH_STOPS_RE = re.compile(r"[\u3040-\u30ff\u4e00-\u9fffー、。]{2,}")
NOISE_RE = re.compile(r"[①②③④⑤⑥⑦⑧⑨⑩□■◆◇→←▲▼○●◎◯]")
SIMPLIFIED_HINT_RE = re.compile(r"[亲属闻风错误觉边气龙爱点闭开说听围这们为刘门体怀书见话画妈爸]")


def normalize_spacing(text: str) -> str:
    text = text.replace("\u3000", " ")
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(
        r"(?<=[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fffー])\s+(?=[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fffー])",
        "",
        text,
    )
    return text


def clean_token(text: str) -> str:
    text = normalize_spacing(text)
    text = NOISE_RE.sub("", text)
    text = text.strip(" 　-:：|[]()<>")
    return text


def detect_meaning(text: str, fallback: str) -> str:
    if fallback:
        return clean_token(fallback)

    candidates = []
    for match in MEANING_RE.finditer(text):
        candidate = clean_token(match.group(0))
        lower = candidate.lower()
        if len(candidate) < 3:
            continue
        if "section" in lower or "chapter" in lower:
            continue
        if candidate.count(" ") > 8:
            continue
        candidates.append(candidate)
    return candidates[0] if candidates else ""


def detect_example_en(text: str) -> str:
    candidates = []
    for chunk in re.split(r"(?<=[.!?])\s+", text):
        chunk = clean_token(chunk)
        if not ASCII_RE.search(chunk):
            continue
        if len(chunk) < 18:
            continue
        if "section" in chunk.lower():
            continue
        candidates.append(chunk)

    if candidates:
        return max(candidates, key=len)
    return ""


def detect_example_ja(text: str) -> str:
    candidates = []
    for chunk in re.split(r"[。!?]", text):
        chunk = clean_token(chunk)
        if not JAPANESE_RE.search(chunk):
            continue
        if len(chunk) < 6:
            continue
        if ASCII_RE.search(chunk):
            continue
        if SIMPLIFIED_HINT_RE.search(chunk):
            continue
        candidates.append(chunk)
    return candidates[0] if candidates else ""


def detect_term(text: str, fallback: str) -> str:
    meaning = detect_meaning(text, "")
    head = text.split(meaning, 1)[0] if meaning else text[:80]
    candidates = []
    for match in JAPANESE_WITH_STOPS_RE.finditer(head):
        candidate = clean_token(match.group(0))
        if len(candidate) > 18:
            continue
        if candidate.isdigit():
            continue
        candidates.append(candidate)

    if candidates:
        preferred = [
            candidate
            for candidate in candidates
            if not SIMPLIFIED_HINT_RE.search(candidate)
        ]
        target = preferred if preferred else candidates
        return target[-1]

    if fallback:
        cleaned = clean_token(fallback)
        if cleaned:
            return cleaned
    return ""


def detect_reading(text: str, term: str) -> str:
    meaning = detect_meaning(text, "")
    head = text.split(meaning, 1)[0] if meaning else text[:80]
    readings = []
    for match in KANA_RE.finditer(head):
        candidate = clean_token(match.group(0))
        if len(candidate) < 2:
            continue
        if candidate == term:
            continue
        readings.append(candidate)
    if readings:
        return readings[-1]
    return ""


def normalize_ocr_text(text: str) -> str:
    text = clean_token(text)
    text = re.sub(r"\s+([,.!?])", r"\1", text)
    return text


def extract_left_meaning_items(items: list[dict[str, float | str]]) -> list[tuple[float, str]]:
    anchors: list[tuple[float, str]] = []
    for item in items:
        text = str(item["text"]).strip()
        x0 = float(item["x0"])
        y0 = float(item["y0"])
        if not (115 <= x0 <= 250):
            continue
        if not ASCII_RE.search(text):
            continue
        if len(text) > 36:
            continue
        lowered = text.lower()
        if "section" in lowered or "chapter" in lowered:
            continue
        if "/" in text or "," in text or "." in text:
            continue
        anchors.append((y0, text))

    anchors.sort(key=lambda pair: pair[0])

    deduped: list[tuple[float, str]] = []
    for y0, text in anchors:
        if deduped and abs(deduped[-1][0] - y0) < 16:
            continue
        deduped.append((y0, text))
    return deduped


def detect_term_fallback(items: list[dict[str, float | str]], y0: float, next_y: float) -> str:
    candidates = []
    for item in items:
        x0 = float(item["x0"])
        item_y = float(item["y0"])
        text = clean_token(str(item["text"]))
        if not (125 <= x0 <= 260 and y0 - 22 <= item_y < next_y):
            continue
        if not JAPANESE_RE.search(text):
            continue
        if ASCII_RE.search(text):
            continue
        if len(text) > 16:
            continue
        candidates.append((item_y, text))

    candidates.sort(key=lambda pair: pair[0])
    return candidates[0][1] if candidates else ""


def build_dataset(
    pdf_path: Path,
    output_path: Path,
    page_start: int,
    page_end: int,
    scale: float,
) -> None:
    engine = RapidOCR()
    doc = fitz.open(pdf_path)

    temp_dir = output_path.parent / ".ark-import-tmp"
    if temp_dir.exists():
        shutil.rmtree(temp_dir)
    temp_dir.mkdir(parents=True, exist_ok=True)

    try:
        crop_dir = temp_dir / "crops"
        crop_dir.mkdir(parents=True, exist_ok=True)
        meta_path = temp_dir / "meta.json"
        ocr_output_path = temp_dir / "ocr.json"

        crop_meta: list[dict[str, str | int]] = []
        entry_id = 1

        for page_number in range(page_start, min(page_end, doc.page_count + 1)):
            page = doc.load_page(page_number - 1)
            pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
            img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(
                pix.height, pix.width, pix.n
            )

            result, _ = engine(img)
            if not result:
                continue

            items = []
            for box, text, score in result:
                cleaned = clean_token(str(text))
                if not cleaned:
                    continue
                xs = [point[0] for point in box]
                ys = [point[1] for point in box]
                items.append(
                    {
                        "text": cleaned,
                        "x0": min(xs),
                        "y0": min(ys),
                        "x1": max(xs),
                        "y1": max(ys),
                    }
                )

            anchors = extract_left_meaning_items(items)
            if not anchors:
                continue

            for index, (y0, meaning_hint) in enumerate(anchors):
                next_y = anchors[index + 1][0] if index + 1 < len(anchors) else pix.height - 20
                y_start = max(20, int(y0 - 82))
                y_end = min(pix.height - 1, int(next_y + 42))
                x_start = int(pix.width * 0.08)
                x_end = int(pix.width * 0.93)
                crop = img[y_start:y_end, x_start:x_end]
                crop_name = f"{entry_id:04d}.png"
                Image.fromarray(crop).save(crop_dir / crop_name)

                crop_meta.append(
                    {
                        "entryId": entry_id,
                        "page": page_number,
                        "meaningHint": meaning_hint,
                        "termHint": detect_term_fallback(items, y0, next_y),
                    }
                )
                entry_id += 1

        meta_path.write_text(
            json.dumps(crop_meta, ensure_ascii=False, indent=2), encoding="utf-8"
        )

        subprocess.run(
            [
                "powershell",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                str(Path(__file__).with_name("windows_ocr.ps1")),
                "-InputDir",
                str(crop_dir),
                "-OutputFile",
                str(ocr_output_path),
            ],
            check=True,
        )

        ocr_results = json.loads(ocr_output_path.read_text(encoding="utf-8"))
        by_name = {item["name"]: item["text"] for item in ocr_results}

        dataset = []
        for meta in crop_meta:
            name = f"{int(meta['entryId']):04d}"
            raw_text = normalize_ocr_text(str(by_name.get(name, "")))
            term_hint = clean_token(str(meta["termHint"]))
            meaning_hint = clean_token(str(meta["meaningHint"]))
            term = detect_term(raw_text, term_hint)
            reading = detect_reading(raw_text, term)
            meaning = detect_meaning(raw_text, meaning_hint)
            example_ja = detect_example_ja(raw_text)
            example_en = detect_example_en(raw_text)

            dataset.append(
                {
                    "id": f"ark-n1-{int(meta['entryId']):04d}",
                    "term": term or f"Entry {int(meta['entryId'])}",
                    "reading": reading,
                    "meaning": meaning or "Imported from ARK ACADEMY PDF",
                    "category": "ARK ACADEMY",
                    "level": "N1",
                    "tags": ["pdf-import", "ark-academy"],
                    "example": {
                        "jp": example_ja or "Example sentence imported from the source PDF.",
                        "en": example_en or "Example sentence imported from the source PDF.",
                    },
                    "sourcePage": int(meta["page"]),
                }
            )

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(
            json.dumps(dataset, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"Generated {len(dataset)} entries at {output_path}")
    finally:
        if temp_dir.exists():
            shutil.rmtree(temp_dir, ignore_errors=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf")
    parser.add_argument("output")
    parser.add_argument("--page-start", type=int, default=9)
    parser.add_argument("--page-end", type=int, default=300)
    parser.add_argument("--scale", type=float, default=1.2)
    args = parser.parse_args()

    build_dataset(
        pdf_path=Path(args.pdf),
        output_path=Path(args.output),
        page_start=args.page_start,
        page_end=args.page_end,
        scale=args.scale,
    )


if __name__ == "__main__":
    main()
