"""
Overseas polling place tests.

Federal elections include a set of overseas polling places (managed by the
Australian High Commissions / Embassies) that differ from domestic booths in
three important ways:

  1. The ``state`` field is "Overseas" — the only non-Australian PollingPlaceState.
  2. Their geocoordinates are outside Australia (e.g. London, Tokyo) — they
     would always fail the election-boundary bbox check for any election.  The
     loader therefore explicitly skips the bbox check for Overseas-state rows.
  3. They carry a human-readable ``booth_info`` value (e.g. "London") that
     identifies the city/post to the voter; in real Federal elections this
     column is present in the merged overseas CSV directly.
  4. Their MetaPollingPlaces rows are created with ``overseas=True`` and
     ``jurisdiction=None`` (no Australian state applies).

Tests (4):
  1. Overseas PP with out-of-Australia coordinates produces no bbox error OR
     warning even when strict bbox_validation config is active.
  2. Contrast: the same London coordinates with a domestic state DO produce a
     bbox error (confirms the guard is only on state="Overseas").
  3. ``booth_info`` value from the CSV is persisted to the DB.
  4. MPP created for an overseas PP has ``overseas=True`` and
     ``jurisdiction=None``.
"""

import pytest
from demsausage.app.enums import PollingPlaceStatus
from demsausage.app.models import MetaPollingPlaces, PollingPlaces
from tests.conftest import OVERSEAS_ROW, make_csv, run_loader_dry, run_loader_full

# ---------------------------------------------------------------------------
# 1. Overseas PP bypasses the bbox check entirely
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_overseas_pp_bypasses_bbox_check(test_election):
    """A polling place with state="Overseas" is never tested against the
    election boundary, even when strict bbox_validation config is active.

    The guard in check_polling_place_validity() skips the geom.within() test
    for any row where state == "Overseas".  Without this guard, every overseas
    booth would fail because its coordinates (e.g. London) are outside the
    Australia-wide election geom.

    We enable a strict bbox_validation config (no ignore list) so that *any*
    out-of-bounds domestic PP would get an [ERROR].  The overseas PP must
    produce neither an error nor a warning about the boundary.
    """
    config = {"bbox_validation": {"ignore": []}}  # strict — no exceptions
    logs = run_loader_dry(test_election, make_csv([OVERSEAS_ROW]), config)

    assert not any(
        "falls outside the election's boundary" in m for m in logs.get("errors", [])
    ), f"Overseas PP should never get a bbox error; errors={logs.get('errors')}"

    assert not any(
        "falls outside the election's boundary" in m for m in logs.get("warnings", [])
    ), f"Overseas PP should never get a bbox warning; warnings={logs.get('warnings')}"


# ---------------------------------------------------------------------------
# 2. Contrast: same London coordinates with a domestic state → bbox error
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_domestic_pp_at_london_coordinates_gets_bbox_error(test_election):
    """A PP with state="VIC" but London coordinates IS flagged as out-of-bounds.

    This contrast test confirms the bbox guard is specifically conditioned on
    state="Overseas" and is not silently suppressed for all out-of-bounds rows.
    """
    london_vic_row = {
        **OVERSEAS_ROW,
        "state": "VIC",  # domestic state — bbox check now applies
        # Tokyo coordinates from OVERSEAS_ROW are still outside the Australia bbox
    }
    config = {"bbox_validation": {"ignore": []}}
    logs = run_loader_dry(test_election, make_csv([london_vic_row]), config)

    assert any(
        "falls outside the election's boundary" in m for m in logs.get("errors", [])
    ), (
        "A PP with a domestic state at London coordinates should get a bbox error; "
        f"errors={logs.get('errors')}"
    )


# ---------------------------------------------------------------------------
# 3. booth_info is persisted for overseas PPs
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_overseas_pp_booth_info_is_persisted(test_election):
    """The ``booth_info`` value supplied in the overseas CSV column is stored
    on the polling place after a full load.

    In Federal elections the merged overseas CSV includes a ``booth_info``
    column containing a short city/post label (e.g. "London", "Tokyo").
    Voters see this on the Democracy Sausage map as a location hint.  The
    field must survive the full write-and-migrate pipeline.
    """
    run_loader_full(test_election, make_csv([OVERSEAS_ROW]))

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert (
        pp.booth_info == OVERSEAS_ROW["booth_info"]
    ), f"Expected booth_info={OVERSEAS_ROW['booth_info']!r}, got {pp.booth_info!r}"


# ---------------------------------------------------------------------------
# 4. MPP created for an overseas PP has overseas=True and jurisdiction=None
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_overseas_pp_mpp_has_overseas_true_and_no_jurisdiction(test_election):
    """The MetaPollingPlaces row created for an overseas PP carries
    ``overseas=True`` and ``jurisdiction=None``.

    The loader's migrate_mpps() inspects polling_place.state:
      - overseas = (state == PollingPlaceState.Overseas)
      - jurisdiction = (state if state != Overseas else None)

    MetaPollingPlaceJurisdiction has no "Overseas" value — the correct
    representation is jurisdiction=NULL in the DB.  This is important for
    downstream reporting that groups PPs by jurisdiction.
    """
    run_loader_full(test_election, make_csv([OVERSEAS_ROW]))

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert (
        pp.meta_polling_place_id is not None
    ), "Overseas PP should have an MPP created after the first full load"

    mpp = MetaPollingPlaces.objects.get(pk=pp.meta_polling_place_id)
    assert (
        mpp.overseas is True
    ), f"MPP for an overseas PP must have overseas=True; got {mpp.overseas!r}"
    assert (
        mpp.jurisdiction is None
    ), f"MPP for an overseas PP must have jurisdiction=None; got {mpp.jurisdiction!r}"
