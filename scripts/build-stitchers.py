#!/usr/bin/env python3
"""Parse the America's Tapestry master spreadsheet into src/lib/data/stitchers.json.

Re-run whenever the spreadsheet changes:
    python3 scripts/build-stitchers.py [path/to/master.xlsx]
"""
import json
import re
import sys
from pathlib import Path

import openpyxl

DEFAULT_SRC = "/Users/rjl/Downloads/AmericasTapestry_Master_6_7.xlsx"
OUT = Path(__file__).resolve().parent.parent / "src" / "lib" / "data" / "stitchers.json"

STATES = [
    "Connecticut", "Delaware", "Georgia", "Maryland", "Massachusetts",
    "New Hampshire", "New Jersey", "New York", "North Carolina",
    "Pennsylvania", "Rhode Island", "South Carolina", "Virginia",
]

SECTION_MAP = {
    "STATE DIRECTOR": "stateDirectors",
    "CORE VOLUNTEER": "coreVolunteers",
    "GUEST VOLUNTEER": "guestVolunteers",
}


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", str(value or "").replace("*", "")).strip()


def section_key(marker: str):
    upper = marker.upper()
    for needle, key in SECTION_MAP.items():
        if needle in upper:
            return key
    return None


def slugify(name: str) -> str:
    return name.lower().replace(" ", "-")


def main() -> None:
    src = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
    wb = openpyxl.load_workbook(src, read_only=True, data_only=True)

    states_out = []
    for state in STATES:
        ws = wb[state]
        buckets = {"stateDirectors": [], "coreVolunteers": [], "guestVolunteers": []}
        current = None
        for row in ws.iter_rows(values_only=True):
            first_cell = row[0]
            if isinstance(first_cell, str) and first_cell.strip().startswith("▶"):
                current = section_key(first_cell)
                continue
            if current and first_cell is not None and str(first_cell).strip().isdigit():
                name = clean(f"{clean(row[1])} {clean(row[2])}")
                if name:
                    buckets[current].append(name)

        # Dedupe within each section (case-insensitive, keep first spelling)
        for key, names in buckets.items():
            seen = set()
            deduped = []
            for name in names:
                lowered = name.lower()
                if lowered not in seen:
                    seen.add(lowered)
                    deduped.append(name)
            buckets[key] = deduped

        states_out.append({"slug": slugify(state), "name": state, **buckets})
        print(
            f"{state}: {len(buckets['stateDirectors'])}/"
            f"{len(buckets['coreVolunteers'])}/{len(buckets['guestVolunteers'])}"
        )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps({"states": states_out}, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
