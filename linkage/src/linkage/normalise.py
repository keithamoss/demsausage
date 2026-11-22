"""Text and geo normalisation shared by every matcher.

Ported from docs/modernisation/experiments/key_experiment.py (n, n2, dist_m).
"""

from __future__ import annotations

import math
import re
import unicodedata

# Words that carry no identity in polling place names ("Smith St Polling Place").
NOISE_WORDS = frozenset(
    {
        "polling",
        "place",
        "centre",
        "center",
        "election",
        "day",
        "early",
        "voting",
        "and",
        "the",
        "district",
        "pre",
        "poll",
    }
)

_NON_ALNUM = re.compile(r"[^a-z0-9]+")
_SPACES = re.compile(r"\s+")


def norm(text: str | None) -> str:
    """Create a compact, punctuation-free text key.

    Args:
        text: Text to normalise, or ``None``.

    Returns:
        Folded lowercase text with punctuation removed and spaces collapsed.

    Examples:
        ``norm("St. Mary's Café & Hall")`` returns ``"st mary s cafe and hall"``.
    """
    folded = unicodedata.normalize("NFKD", text or "")
    folded = "".join(ch for ch in folded if not unicodedata.combining(ch))
    folded = folded.lower().replace("&", " and ")
    return _SPACES.sub(" ", _NON_ALNUM.sub(" ", folded)).strip()


def norm_name(text: str | None) -> str:
    """Normalise a place name and remove common noise words.

    Args:
        text: Place name to normalise, or ``None``.

    Returns:
        A compact name key suitable for exact matching.
    """
    return " ".join(word for word in norm(text).split() if word not in NOISE_WORDS)


#: Common Australian address abbreviations, expanded so "Cnr Smith St" == "Corner Smith Street".
ADDRESS_ABBREVIATIONS = {
    "cnr": "corner",
    "crn": "corner",
    "st": "street",
    "rd": "road",
    "ave": "avenue",
    "av": "avenue",
    "hwy": "highway",
    "dr": "drive",
    "pde": "parade",
    "cres": "crescent",
    "cr": "crescent",
    "ct": "court",
    "pl": "place",
    "tce": "terrace",
    "blvd": "boulevard",
    "esp": "esplanade",
    "gr": "grove",
    "ln": "lane",
    "mt": "mount",
    "nth": "north",
    "sth": "south",
}


def norm_address(text: str | None) -> str:
    """Normalise an address and expand common street abbreviations.

    Args:
        text: Address text to normalise, or ``None``.

    Returns:
        A compact address key where common abbreviations use one spelling.
    """
    return " ".join(ADDRESS_ABBREVIATIONS.get(word, word) for word in norm(text).split())


_TIME = re.compile(r"(?<![\d:.])(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?(?![\d:])", re.IGNORECASE)


def norm_hours(text: str | None) -> str:
    """Opening hours as 24-hour times: "8am to 6pm" and "08:00 AM - 06:00 PM" both become
    "08:00-18:00".

    Args:
        text: Opening-hours text, or ``None``.

    Returns:
        A canonical time range, or the ordinary normalised text fallback.
    """
    raw = (text or "").strip()
    # Only discard separators when the entire value is a supported time range.
    if not re.fullmatch(
        rf"{_TIME.pattern}\s*(?:to|[-–—])\s*{_TIME.pattern}", raw, re.IGNORECASE
    ):
        return norm(raw)
    times = []
    for hour, minute, meridiem in _TIME.findall(raw):
        h, m = int(hour), int(minute or 0)
        mer = meridiem.lower().replace(".", "")
        if mer == "pm" and h < 12:
            h += 12
        elif mer == "am" and h == 12:
            h = 0
        if not mer and not minute:
            return norm(raw)  # a bare number ("8") is too ambiguous to treat as a time
        if h > 23 or m > 59:
            return norm(raw)
        times.append(f"{h:02d}:{m:02d}")
    return "-".join(times) if times else norm(raw)


#: How each kind of field is normalised when deciding whether two values mean the same thing.
NORMALISERS = {
    "name": norm_name,
    "premises": norm,
    "address": norm_address,
    "hours": norm_hours,
    "text": norm,
}


def equivalent(kind: str, a: str | None, b: str | None) -> bool:
    """True when two values differ only in ways matching ignores (case, punctuation,
    spacing, address abbreviations, noise words in names, how times are written).

    Args:
        kind: Field type used to select normalisation rules.
        a: First raw value.
        b: Second raw value.

    Returns:
        ``True`` when the values are considered the same.

    This is the linkage module's definition of "the same value"; other tools (such as
    the diff) should use it rather than their own comparisons.
    """
    a, b = (a or "").strip(), (b or "").strip()
    if a == b:
        return True
    try:  # numbers written differently: "1.50" and "1.5"
        return float(a) == float(b)
    except ValueError:
        pass
    normaliser = NORMALISERS.get(kind, norm)
    na, nb = normaliser(a), normaliser(b)
    return bool(na) and na == nb


def distance_m(
    lat1: float | None, lon1: float | None, lat2: float | None, lon2: float | None
) -> float | None:
    """Calculate great-circle distance between two coordinate points.

    Args:
        lat1: Latitude of the first point, or ``None``.
        lon1: Longitude of the first point, or ``None``.
        lat2: Latitude of the second point, or ``None``.
        lon2: Longitude of the second point, or ``None``.

    Returns:
        Distance in metres, or ``None`` if either point is missing.
    """
    if None in (lat1, lon1, lat2, lon2):
        return None
    p1, p2 = math.radians(lat1), math.radians(lat2)  # type: ignore[arg-type]
    dp = p2 - p1
    dl = math.radians(lon2 - lon1)  # type: ignore[operator]
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * 6_371_000 * math.asin(math.sqrt(a))
