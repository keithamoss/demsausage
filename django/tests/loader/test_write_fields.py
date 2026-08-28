"""
Phase 1 — field-level persistence tests for the write-and-migrate pipeline.

These tests verify that individual polling place fields observed in real
2024/2025 election CSV data are correctly stored in the database after a
full (non-dry-run) load.  They complement the broader write-flow tests in
test_write.py by exercising field-by-field correctness using realistic row
templates from conftest.py.

Real-world data sources used to motivate each test:
  - NSW LG 2024  →  wheelchair_access_description, numeric ec_id, divisions
  - SA 2025       →  entrance_desc, blank ec_id, divisions
  - ACT 2024      →  blank premises (premises="" is valid on the model)
  - AEC Federal   →  comma-separated divisions string → list in DB
  - FED 2025      →  AEC extras dict (CCD, OrdVoteEst, …, AdvBoothLocation)
  - TAS 2025      →  TAS accessibility extras dict
  - QLD 2024      →  opening_hours non-empty
  - ACT 2024      →  wheelchair_access='Unknown', empty divisions → []

Tests (11):
  0. Baseline: MINIMAL_ROW loads without errors
  1. entrance_desc is persisted (SA/federal style)
  2. wheelchair_access_description is persisted (NSW LG 2024 style)
  3. Numeric ec_id string is persisted (NSW LG / Federal style)
  4. Blank premises row is valid and persisted (ACT 2024 style)
  5. Single division string is converted to a one-element list in the DB
  6. Comma-separated division string is split into a two-element list in the DB
  7. AEC extras columns are packed into the extras dict with correct types
  8. TAS extras columns are packed into the extras dict as strings
  9. opening_hours value is persisted unchanged (QLD 2024 style)
 10. wheelchair_access='Unknown' is persisted unchanged (ACT 2024 style)
 11. Empty divisions string is stored as an empty list in the DB
"""

import pytest
from demsausage.app.enums import PollingPlaceStatus
from demsausage.app.models import PollingPlaces
from tests.conftest import (
    ACT_UNKNOWN_ROW,
    AEC_EXTRAS_CONFIG,
    AEC_ROW,
    MINIMAL_ROW,
    NO_PREMISES_ROW,
    NSW_LG_ROW,
    QLD_ROW,
    SA_ROW,
    TAS_EXTRAS_CONFIG,
    TAS_EXTRAS_ROW,
    make_csv,
    run_loader_full,
)

# ---------------------------------------------------------------------------
# 0. Baseline: MINIMAL_ROW loads and produces a valid polling place
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_minimal_row_loads_successfully(test_election):
    """The bare-minimum row passes all validation and is persisted correctly.

    MINIMAL_ROW carries only the fields required by every election format:
    name, premises, address, state, wheelchair_access, lat, lon, and a blank
    ec_id.  This is the simplest possible load; it verifies that the pipeline
    has no hidden mandatory-field requirements beyond those documented in the
    row template, and that a blank ec_id is stored as None (IntegerField null)
    rather than raising a validation error.
    """
    run_loader_full(test_election, make_csv([MINIMAL_ROW]))

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.name == MINIMAL_ROW["name"]
    assert pp.ec_id is None  # blank string → null IntegerField


# ---------------------------------------------------------------------------
# 1. entrance_desc persisted (SA 2025 / Federal style)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_entrance_desc_is_persisted(test_election):
    """entrance_desc supplied in the CSV is stored on the polling place.

    SA 2025 and Federal elections include an `entrance_desc` (or
    `EntrancesDesc` in AEC source data) column.  The field must survive the
    full write-and-migrate pipeline and be readable from the DB.
    """
    run_loader_full(test_election, make_csv([SA_ROW]))

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.entrance_desc == SA_ROW["entrance_desc"]


# ---------------------------------------------------------------------------
# 2. wheelchair_access_description persisted (NSW LG 2024 style)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_wheelchair_access_description_is_persisted(test_election):
    """wheelchair_access_description supplied in the CSV is stored on the
    polling place.

    NSW LG 2024 provides a verbose free-text description alongside the
    categorical `wheelchair_access` value.  Both should be persisted.
    """
    run_loader_full(test_election, make_csv([NSW_LG_ROW]))

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert (
        pp.wheelchair_access_description == NSW_LG_ROW["wheelchair_access_description"]
    )


# ---------------------------------------------------------------------------
# 3. Numeric ec_id string is persisted (NSW LG / Federal style)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_numeric_ec_id_is_persisted(test_election):
    """A non-blank, numeric ec_id value is stored as an integer on the polling place.

    The `ec_id` model field is an IntegerField.  In Federal elections the AEC
    supplies a numeric PPId that becomes `ec_id` after rename_columns; NSW LG
    2024 similarly supplies a numeric identifier in the `ec_id` column.  The
    value should survive the full write-and-migrate pipeline as an integer.
    """
    run_loader_full(test_election, make_csv([NSW_LG_ROW]))

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.ec_id == int(NSW_LG_ROW["ec_id"])


# ---------------------------------------------------------------------------
# 4. Blank premises row is valid (ACT 2024 style)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_blank_premises_row_is_valid(test_election):
    """A row with premises="" does not fail serializer validation.

    The `premises` model field has blank=True.  Some elections (e.g. ACT
    2024) supply rows where the CSV premises column is empty.  The loader
    should write these rows successfully and the DB value should be "".
    """
    run_loader_full(test_election, make_csv([NO_PREMISES_ROW]))

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.premises == ""


# ---------------------------------------------------------------------------
# 5. Single division string → one-element list in DB
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_single_division_string_becomes_list_in_db(test_election):
    """A plain string divisions value (e.g. "Albury") is stored as ["Albury"].

    The loader's get_or_merge_divisions_fields() splits divisions on "," so
    a single-division string correctly becomes a one-element list.  This is
    the predominant pattern in NSW LG 2024, SA 2025, and TAS elections where
    each venue serves exactly one division.
    """
    run_loader_full(test_election, make_csv([NSW_LG_ROW]))

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.divisions == [NSW_LG_ROW["divisions"]]


# ---------------------------------------------------------------------------
# 6. Comma-separated divisions string → two-element list in DB
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_comma_separated_divisions_split_into_list(test_election):
    """A comma-separated divisions string is split into a multi-element list.

    The loader's get_or_merge_divisions_fields() splits on "," and strips
    whitespace.  This path is exercised in Federal elections where a single
    polling venue can serve two or more divisions (e.g. the AEC's Ultimo TAFE
    serving 12 divisions across Sydney electorates).
    """
    row = {**NSW_LG_ROW, "divisions": "Hotham, Richmond"}
    run_loader_full(test_election, make_csv([row]))

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.divisions == ["Hotham", "Richmond"]


# ---------------------------------------------------------------------------
# 7. AEC extras columns are packed into the extras dict with correct types
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_aec_extras_are_packed_into_dict(test_election):
    """AEC statistical extras columns land in pp.extras with correct Python types.

    FED 2022, REF 2023, and FED 2025 all supply per-booth AEC statistical
    columns (CCD, OrdVoteEst, DecVoteEst, NoOrdIssuingOff, NoOfDecIssuingOff)
    and, from FED 2025, also AdvBoothLocation.  The loader packs these into
    the model's ``extras`` JSONField via ``_create_extras()`` when the config
    supplies an ``extras.fields`` list.  Numeric strings are converted to
    Python ints; the string field is stored as-is.  The AEC CSV columns must
    NOT survive as top-level model fields after loading.
    """
    run_loader_full(test_election, make_csv([AEC_ROW]), config=AEC_EXTRAS_CONFIG)

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.extras == {
        "CCD": 801011001,
        "OrdVoteEst": 950,
        "DecVoteEst": 12,
        "NoOrdIssuingOff": 8,
        "NoOfDecIssuingOff": 2,
        "AdvBoothLocation": "BELCONNEN COMMUNITY CENTRE",
    }
    # entrance_desc from AEC_ROW should survive alongside extras
    assert pp.entrance_desc == AEC_ROW["entrance_desc"]


# ---------------------------------------------------------------------------
# 8. TAS extras columns are packed into the extras dict as strings
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_tas_extras_are_packed_into_dict(test_election):
    """TAS accessibility extras columns land in pp.extras as plain strings.

    TAS 2024 and TAS 2025 supply three accessibility-detail columns
    (Access_To_Location, Location_Within_Premise, VI_Vote_service) that are
    not numeric and are therefore stored verbatim in the ``extras`` JSONField.
    """
    run_loader_full(test_election, make_csv([TAS_EXTRAS_ROW]), config=TAS_EXTRAS_CONFIG)

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.extras == {
        "Access_To_Location": "Ground Level",
        "Location_Within_Premise": "Main Hall",
        "VI_Vote_service": "No",
    }


# ---------------------------------------------------------------------------
# 9. opening_hours is persisted (QLD 2024 style)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_opening_hours_is_persisted(test_election):
    """The opening_hours value from the CSV is stored on the polling place.

    QLD 2024 is the only post-2022 election where every polling place carries
    a non-empty opening_hours field (e.g. '08:00 AM - 06:00 PM').  The field
    maps directly to the model CharField and must survive the full pipeline.
    """
    run_loader_full(test_election, make_csv([QLD_ROW]))

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.opening_hours == QLD_ROW["opening_hours"]


# ---------------------------------------------------------------------------
# 10. wheelchair_access='Unknown' is persisted (ACT 2024 style)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_wheelchair_access_unknown_is_persisted(test_election):
    """wheelchair_access='Unknown' is stored verbatim on the polling place.

    ACT 2024 is the only election where every booth is recorded as 'Unknown'
    — the data supplier did not certify any venues.  The loader must pass the
    value through without normalisation or rejection.
    """
    run_loader_full(test_election, make_csv([ACT_UNKNOWN_ROW]))

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.wheelchair_access == "Unknown"


# ---------------------------------------------------------------------------
# 11. Empty divisions string is stored as an empty list (ACT/VIC style)
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_empty_divisions_string_stored_as_empty_list(test_election):
    """Absence of a divisions column in the CSV produces divisions=[] in the DB.

    ACT 2024 and VIC 2022 have no per-booth division mapping, and their CSVs
    simply do not include a 'divisions' column at all.  The loader's
    get_or_merge_divisions_fields() leaves the field unset in that case, and
    the model's JSONField default [] is used.

    This is distinct from divisions="" (which splits to [""]).  ACT_UNKNOWN_ROW
    has no 'divisions' key to correctly model the absent-column case.
    """
    run_loader_full(test_election, make_csv([ACT_UNKNOWN_ROW]))

    pp = PollingPlaces.objects.get(
        election=test_election, status=PollingPlaceStatus.ACTIVE
    )
    assert pp.divisions == []
