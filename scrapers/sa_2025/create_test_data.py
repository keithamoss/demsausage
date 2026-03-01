#!/usr/bin/env python3
"""
Creates a fake modified CSV for testing diff.py.

Takes the most recent scraped CSV from data/ and produces
data/test_modified.csv with three intentional changes:
  1. A field value edited (wheelchair_access on first row)
  2. A row deleted (second row removed)
  3. A new row appended (cloned from row 3 with a fake id/name)

Usage:
    python create_test_data.py
"""

import csv
import glob
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
OUTPUT_PATH = os.path.join(DATA_DIR, "test_modified.csv")


def latest_csv() -> str:
    files = sorted(glob.glob(os.path.join(DATA_DIR, "* polling places.csv")))
    if not files:
        raise FileNotFoundError(f"No polling places CSVs found in {DATA_DIR}")
    return files[-1]


def main() -> None:
    source = latest_csv()
    print(f"Using source: {source}")

    with open(source, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        fieldnames = reader.fieldnames
        rows = list(reader)

    if len(rows) < 3:
        raise ValueError("Need at least 3 rows to create meaningful test data")

    modified = list(rows)  # shallow copy of all rows

    # Change 1: edit wheelchair_access on the first row
    original_val = modified[0]["wheelchair_access"]
    new_val = "Assisted" if original_val != "Assisted" else "Full"
    print(
        f"  Change 1 (edit):   row id={modified[0]['id']} wheelchair_access "
        f"'{original_val}' -> '{new_val}'"
    )
    modified[0] = dict(modified[0])
    modified[0]["wheelchair_access"] = new_val

    # Change 2: delete the second row
    deleted = modified.pop(1)
    print(
        f"  Change 2 (delete): row id={deleted['id']} name='{deleted['name']}' removed"
    )

    # Change 3: append a fake extra row cloned from row index 2 (original row 3)
    base = modified[2]
    fake_row = dict(base)
    fake_row["id"] = "99999"
    fake_row["name"] = "Test Fake Polling Place"
    fake_row["suburb"] = "Fakeville"
    modified.append(fake_row)
    print(f"  Change 3 (insert): new row id=99999 appended at end")

    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(modified)

    print(f"\nTest file written to: {OUTPUT_PATH}")
    print(f"\nRun diff with:\n" f'  python diff.py "{source}" "{OUTPUT_PATH}"')


if __name__ == "__main__":
    main()
