"""Human-friendly labels for scraper output files.

Scraper outputs are named with when they were scraped, in a few styles:

    20261104_204630 polling places.csv          (vic_2026, sa_2025)
    nsw_coffs_harbour_LB2615-031_2026-11-21.csv  (nsw_coffs_harbour_2026)
    wa_2021 (20210207).csv                       (wa_2021, wa_2025)
    nsw_kiama_18-08-2026.csv                     (nsw_kiama_2026)
    act_2024_10_14.csv                           (act_2024)

friendly_label() turns these into "Wed 4 Nov 2026, 8:46 pm" or "Sun 7 Feb 2021".
Files with no recognisable date fall back to a tidied file name. To support a new
naming style, add a pattern to ADAPTERS.
"""

from __future__ import annotations

import re
from collections.abc import Callable
from datetime import datetime
from pathlib import Path

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _fmt_date(d: datetime) -> str:
    return f"{DAYS[d.weekday()]} {d.day} {MONTHS[d.month - 1]} {d.year}"


def _fmt_datetime(d: datetime) -> str:
    hour = d.hour % 12 or 12
    return f"{_fmt_date(d)}, {hour}:{d.minute:02d} {'am' if d.hour < 12 else 'pm'}"


def _ymd_hms(m: re.Match) -> str | None:
    return _fmt_datetime(datetime(*map(int, m.groups())))


def _ymd(m: re.Match) -> str | None:
    return _fmt_date(datetime(*map(int, m.groups())))


def _dmy(m: re.Match) -> str | None:
    day, month, year = map(int, m.groups())
    return _fmt_date(datetime(year, month, day))


#: (pattern, formatter) tried in order against the file name; the first that yields
#: a valid date wins. Digits must not be part of a longer number.
ADAPTERS: list[tuple[re.Pattern, Callable[[re.Match], str | None]]] = [
    (re.compile(r"(?<!\d)(\d{4})(\d{2})(\d{2})[_T-](\d{2})(\d{2})(\d{2})(?!\d)"), _ymd_hms),  # 20261104_204630
    (re.compile(r"(?<!\d)(\d{4})[-_](\d{2})[-_](\d{2})(?!\d)"), _ymd),  # 2026-11-21, 2024_10_14
    (re.compile(r"(?<!\d)(\d{2})[-_](\d{2})[-_](\d{4})(?!\d)"), _dmy),  # 18-08-2026
    (re.compile(r"(?<!\d)(\d{4})(\d{2})(\d{2})(?!\d)"), _ymd),  # 20210207
]


def friendly_label(path: str | Path) -> str:
    stem = Path(path).stem
    for pattern, formatter in ADAPTERS:
        for match in pattern.finditer(stem):
            try:
                label = formatter(match)
            except ValueError:  # not a real date, e.g. 2023-13-45
                continue
            if label:
                return label
    return re.sub(r"[_\s]+", " ", stem).strip()
