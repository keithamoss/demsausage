"""Build a report that shows every feature the browser test checks.

Takes Tasmania's places from the federal 2025 test fixture (the AEC's polling
places file) as the "old" scrape, writes a "new" scrape with known edits
(changes, a large move, a likely coordinate typo, added and removed places, a
likely replacement, cosmetic-only edits, a blank field, a duplicated position),
then runs ppdiff on the pair and builds the index.

    uv run python tests/browser/make_fixture.py OUT_DIR

OUT_DIR gets config.json (copied from the fixture, so the loader checks run),
data/ (the two CSVs) and diffs/ (report.html per pair, plus index.html).
"""

import csv
import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
FIXTURE = REPO / "django/tests/fixtures/elections/federal_2025"
LIVE = ("Current", "Appointment")


def read_tas():
    with open(FIXTURE / "polling_places.csv", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = [r for r in reader if r["StateAb"] == "TAS" and r["Status"] in LIVE]
        return reader.fieldnames, rows


def by_name(rows, name):
    return next(r for r in rows if r["PPName"].strip() == name)


def edit(old_rows):
    new = [dict(r) for r in old_rows]
    names = [r["PPName"].strip() for r in new]

    # Six real changes (wheelchair access worse, entrance text), so the Changed
    # section has more than four cards and content-visibility applies to some.
    for name in names[10:16]:
        r = by_name(new, name)
        r["WheelchairAccess"] = "None"
        r["EntrancesDesc"] = r["EntrancesDesc"].strip() + " Ramp closed for works."
    # Six cosmetic-only edits: case and spacing. These land in the folded
    # "Cosmetic changes only" section, which the find-in-page test opens.
    for name in names[20:26]:
        r = by_name(new, name)
        r["PremisesName"] = r["PremisesName"].strip().upper()

    # A large move (about 3 km north).
    r = by_name(new, names[30]); r["Lat"] = f"{float(r['Lat']) + 0.027:.7f}"
    # A likely coordinate typo: longitude unchanged, latitude off by 0.1.
    r = by_name(new, names[31]); r["Lat"] = f"{float(r['Lat']) - 0.1:.7f}"
    # A field gone blank (quality check, suggested fix).
    by_name(new, names[32])["EntrancesDesc"] = ""
    # Wheelchair access blank: the config's second fix_data_issues entry ("" -> "Unknown") applies.
    by_name(new, names[35])["WheelchairAccess"] = ""
    # Two places at identical coordinates (quality check).
    a, b = by_name(new, names[33]), by_name(new, names[34])
    b["Lat"], b["Long"] = a["Lat"], a["Long"]

    # Removed places, one replaced by a new venue 200 m away.
    gone = by_name(new, names[40]); new.remove(gone)
    new.remove(by_name(new, names[41]))
    swap = dict(gone)
    swap.update(PPName="Riverside Scout Hut", PremisesName="1st Riverside Scout Hut", Address1="2 Banks Rd",
                PPId="999001", EntrancesDesc="Scout hut front door", Locality="RIVERSIDE",
                DivName="Clark" if gone["DivName"].strip() != "Clark" else "Lyons", Lat=f"{float(gone['Lat']) + 0.0035:.7f}")
    new.append(swap)
    # A brand new place.
    extra = dict(old_rows[0])
    extra.update(PPName="Pop-up Booth", PremisesName="Pop-up Booth Marquee", Address1="1 New St", PPId="999002",
                 Lat="-42.8821", Long="147.3272")
    new.append(extra)

    # Borderline links: renamed places that also moved, which the two matchers decide differently.
    for k, name in enumerate(names[50:56]):
        r = by_name(new, name)
        r["PPName"] = f"{r['PPName'].strip()} {['South', 'Central', 'North', 'Upper', 'East', 'West'][k]}"
        r["PremisesName"] = "New " + r["PremisesName"].strip()
        r["Address1"] = f"{10 + k} Other Rd"
        r["Lat"] = f"{float(r['Lat']) + 0.002 * (k + 1):.7f}"
    # Places that are hard to call, of different kinds; the matchers settle some of them differently.
    r = by_name(new, names[60]); r["PPName"] = "Memorial Hall"                              # new name only
    r = by_name(new, names[61]); r["Lat"] = f"{float(r['Lat']) + 0.045:.7f}"               # 5 km move, nothing else
    r = by_name(new, names[62]); r["PremisesName"] = ""; r["Address1"] = ""                  # premises and address gone
    a, b = by_name(new, names[63]), by_name(new, names[64])                                   # two neighbours swap names
    a["PPName"], b["PPName"] = b["PPName"], a["PPName"]
    r = by_name(new, names[65]); r["DivName"] = "Franklin" if r["DivName"].strip() != "Franklin" else "Bass"; r["PPName"] = r["PPName"].strip() + " Hall"
    # New name and new division: rapidfuzz drops the link, Splink keeps it, so the Disagreements tab has items.
    for k, name in enumerate(names[70:73]):
        r = by_name(new, name)
        r["PPName"] = ["Somewhere Else", "Another Venue", "Third Booth"][k]
        r["DivName"] = "Clark" if r["DivName"].strip() != "Clark" else "Bass"
    return new


def write(path, fields, rows):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, quoting=csv.QUOTE_MINIMAL)
        w.writeheader()
        w.writerows(rows)


def main(out):
    out = Path(out).resolve()
    if out.exists():
        shutil.rmtree(out)
    (out / "data").mkdir(parents=True)
    shutil.copy(FIXTURE / "config.json", out / "config.json")
    fields, old = read_tas()
    old_csv = out / "data/20250428_090000 polling places.csv"
    new_csv = out / "data/20250501_090000 polling places.csv"
    write(old_csv, fields, old)
    write(new_csv, fields, edit(old))
    diffs = out / "diffs"
    run = ["uv", "run", "ppdiff"]
    subprocess.run(run + ["run", str(old_csv), str(new_csv), "--out-dir", str(diffs)], check=True, cwd=REPO / "diff")
    subprocess.run(run + ["index", str(diffs)], check=True, cwd=REPO / "diff")
    report = next(diffs.glob("*/report.html"))
    print(report)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "browser-fixture")
