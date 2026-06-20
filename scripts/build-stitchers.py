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

# Explicit cleanups for source rows that pack affiliations/titles/notes into the
# name cells (chiefly Delaware). Keyed by the assembled, marker-stripped name.
# Owner-approved (2026-06-20): drop org affiliations, drop personal titles, drop
# note-style parentheticals; keep alternate-surname parentheticals.
NAME_OVERRIDES = {
    "Bryce (4 years old)": "Bryce",
    "YouDee (University of Delaware mascot)": "YouDee",
    "Col. David Hall Chapter, NSDAR, Hilda Chaski Adams": "Hilda Chaski Adams",
    "WRDE News, Drew Bellinger": "Drew Bellinger",
    "State House Representative, Honorable Alonna Berry": "Alonna Berry",
    "Col. David Hall Chapter Regent, NSDAR, Beth Bowersock": "Beth Bowersock",
    "Lewes City Council, Honorable Trina Brown-Hicks": "Trina Brown-Hicks",
    "Col. David Hall Chapter, NSDAR, Lana Browne": "Lana Browne",
    "Jeanne H. Buckworth (96 years old)": "Jeanne H. Buckworth",
    "Col. David Hall Chapter, NSDAR, Barbara A Campbell": "Barbara A Campbell",
    "Col. David Hall Chapter, NSDAR, Valerie Dunkle": "Valerie Dunkle",
    "Col. David Hall DAR, Eileen Edelin": "Eileen Edelin",
    "Col. David Hall Chapter, NSDAR, Jo Ferguson": "Jo Ferguson",
    "DE SAR Society President, Troy Foxwell": "Troy Foxwell",
    "DE State Regent, NSDAR, Carolynn Foxwell": "Carolynn Foxwell",
    "NBC10, Tim Furlong": "Tim Furlong",
    "Delaware, Lt. Governor Kyle Evans Gay": "Kyle Evans Gay",
    "5th grade, Felix Gibb": "Felix Gibb",
    "Lewes County Council Member, Honorable Jane Gruenebaum": "Jane Gruenebaum",
    "Col. David Hall Chapter, NSDAR, Debora Hansen": "Debora Hansen",
    "Col. David Hall Chapter Librarian, NSDAR; DE State America250! Chair, NSDAR, Mary Alice Kelly": "Mary Alice Kelly",
    "Col. David Hall Chapter, NSDAR, Diane Lane": "Diane Lane",
    "Col. David Hall Chapter, NSDAR, Susan Lynn Leathery": "Susan Lynn Leathery",
    "Col. David Hall Chapter, NSDAR, Gari Lewis": "Gari Lewis",
    "Hailey, Miss Delaware Mack": "Hailey Mack",
    "Mayor of Lewes, Honorable Amy Marasco": "Amy Marasco",
    "Col. David Hall Chapter, NSDAR, Linda Mecham": "Linda Mecham",
    "Delaware, Governor Matt Meyer": "Matt Meyer",
    "Col. David Hall Chapter Treasurer, NSDAR, DeAnna Poling": "DeAnna Poling",
    "Erik Raser-Schramm (DE250)": "Erik Raser-Schramm",
    "Cheryl Schultz (70th birthday)": "Cheryl Schultz",
    "Jr., Harvey C., Mayor of Odessa Smith": "Harvey C. Smith Jr.",
    "State House Representative, Honorable Claire Snyder-Hall": "Claire Snyder-Hall",
    "Seashore Needlepoint Guild, Melanie Steinmetz": "Melanie Steinmetz",
    "Past Historian General, NSDAR, Ginger Trader": "Ginger Trader",
    "Miss Delaware Teen USA, Cali Williams": "Cali Williams",
    "Col. David Hall Chapter Chaplain, NSDAR, Nancy Shallcross Witmer": "Nancy Shallcross Witmer",
    "Col. David Hall Chapter, NSDAR, Janet Wolf": "Janet Wolf",
    "Pat Edwards, MD": "Pat Edwards",
}


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", str(value or "").replace("*", "").replace("•", "")).strip()


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
                name = NAME_OVERRIDES.get(name, name)
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
