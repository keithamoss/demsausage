from __future__ import annotations

import pytest

from ppdiff.names import friendly_label


@pytest.mark.parametrize(
    ("filename", "label"),
    [
        ("20261104_204630 polling places.csv", "Wed 4 Nov 2026, 8:46 pm"),
        ("20261116_000500 polling places.csv", "Mon 16 Nov 2026, 12:05 am"),
        ("nsw_coffs_harbour_LB2615-031_2026-11-21.csv", "Sat 21 Nov 2026"),
        ("wa_2021 (20210207).csv", "Sun 7 Feb 2021"),
        ("nsw_kiama_18-08-2026.csv", "Tue 18 Aug 2026"),
        ("act_2024_10_14.csv", "Mon 14 Oct 2024"),
        ("qld_2024-2024-10-03.csv", "Thu 3 Oct 2024"),
        ("scrapers/tas_2025/data/20250710 Polling places.csv", "Thu 10 Jul 2025"),
        # No full date: tidied file name
        ("nsw_coffs_harbour_state_2023_SG2301-020.csv", "nsw coffs harbour state 2023 SG2301-020"),
        # Digits that aren't a real date are skipped
        ("export_20261345.csv", "export 20261345"),
    ],
)
def test_friendly_label(filename, label):
    assert friendly_label(filename) == label
