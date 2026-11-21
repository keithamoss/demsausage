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
    """Unicode-fold, lowercase, '&' -> 'and', strip punctuation, collapse spaces."""
    folded = unicodedata.normalize("NFKD", text or "")
    folded = "".join(ch for ch in folded if not unicodedata.combining(ch))
    folded = folded.lower().replace("&", " and ")
    return _SPACES.sub(" ", _NON_ALNUM.sub(" ", folded)).strip()


def norm_name(text: str | None) -> str:
    """norm() plus dropping noise words. Used for names, where the noise is common."""
    return " ".join(word for word in norm(text).split() if word not in NOISE_WORDS)


def distance_m(
    lat1: float | None, lon1: float | None, lat2: float | None, lon2: float | None
) -> float | None:
    """Haversine distance in metres, or None if either point is missing."""
    if None in (lat1, lon1, lat2, lon2):
        return None
    p1, p2 = math.radians(lat1), math.radians(lat2)  # type: ignore[arg-type]
    dp = p2 - p1
    dl = math.radians(lon2 - lon1)  # type: ignore[operator]
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * 6_371_000 * math.asin(math.sqrt(a))
