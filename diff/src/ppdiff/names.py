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
    """Format a date with a short weekday and month name.

    Args:
        d: The date to format.

    Returns:
        A label such as ``"Wed 4 Nov 2026"``.
    """
    return f"{DAYS[d.weekday()]} {d.day} {MONTHS[d.month - 1]} {d.year}"


def _fmt_datetime(d: datetime) -> str:
    """Format a date and time using a 12-hour clock.

    Args:
        d: The date and time to format.

    Returns:
        A label such as ``"Wed 4 Nov 2026, 8:46 pm"``.
    """
    hour = d.hour % 12 or 12
    return f"{_fmt_date(d)}, {hour}:{d.minute:02d} {'am' if d.hour < 12 else 'pm'}"


def _ymd_hms(m: re.Match) -> datetime:
    """Parse a regex match containing year, month, day, and time.

    Args:
        m: A match with six numeric date and time groups.

    Returns:
        The parsed date and time.
    """
    year, month, day, hour, minute, second = map(int, m.groups())
    return datetime(year, month, day, hour, minute, second)


def _ymd(m: re.Match) -> datetime:
    """Parse a regex match containing year, month, and day.

    Args:
        m: A match with three numeric date groups.

    Returns:
        The parsed date at midnight.
    """
    year, month, day = map(int, m.groups())
    return datetime(year, month, day)


def _dmy(m: re.Match) -> datetime:
    """Parse a regex match containing day, month, and year.

    Args:
        m: A match with three numeric date groups in day-first order.

    Returns:
        The parsed date at midnight.
    """
    day, month, year = map(int, m.groups())
    return datetime(year, month, day)


#: (pattern, parser) tried in order against the file name; the first that yields
#: a valid date wins. Digits must not be part of a longer number.
ADAPTERS: list[tuple[re.Pattern, Callable[[re.Match], datetime]]] = [
    (re.compile(r"(?<!\d)(\d{4})(\d{2})(\d{2})[_T-](\d{2})(\d{2})(\d{2})(?!\d)"), _ymd_hms),  # 20261104_204630
    (re.compile(r"(?<!\d)(\d{4})[-_](\d{2})[-_](\d{2})(?!\d)"), _ymd),  # 2026-11-21, 2024_10_14
    (re.compile(r"(?<!\d)(\d{2})[-_](\d{2})[-_](\d{4})(?!\d)"), _dmy),  # 18-08-2026
    (re.compile(r"(?<!\d)(\d{4})(\d{2})(\d{2})(?!\d)"), _ymd),  # 20210207
]


def scrape_date(path: str | Path) -> tuple[datetime, bool] | None:
    """Find a recognizable scrape date and whether it includes a time.

    Args:
        path: The scraper output file path.

    Returns:
        The date and a time-present flag, or ``None`` if no valid date is found.
    """
    for pattern, parser in ADAPTERS:
        for match in pattern.finditer(Path(path).stem):
            try:
                return parser(match), len(match.groups()) == 6
            except ValueError:
                continue
    return None


def sort_scrapes(paths: list[Path]) -> list[Path]:
    """Order scraped files by date, or by filename when none has a date.

    Args:
        paths: The files to order.

    Returns:
        Files in date order, with filenames breaking ties.

    Raises:
        ValueError: If some filenames have dates and others do not.
    """
    dates = {path: scrape_date(path) for path in paths}
    if any(dates.values()) and not all(dates.values()):
        raise ValueError("Cannot order a mixture of dated and undated filenames: " +
                         ", ".join(str(p) for p in paths if dates[p] is None))
    if not any(dates.values()):
        return sorted(paths)
    dated = {path: date[0] for path, date in dates.items() if date is not None}
    return sorted(paths, key=lambda p: (dated[p], str(p)))


def friendly_label(path: str | Path) -> str:
    """Make a scraper output filename easier to read in a report.

    Args:
        path: The scraper output file path.

    Returns:
        A friendly date label, or a tidied filename when no date is recognized.

    Example:
        ``friendly_label("20261104_204630 polling places.csv")`` returns
        ``"Wed 4 Nov 2026, 8:46 pm"``.
    """
    parsed = scrape_date(path)
    if parsed:
        date, has_time = parsed
        return _fmt_datetime(date) if has_time else _fmt_date(date)
    return re.sub(r"[_\s]+", " ", Path(path).stem).strip()
