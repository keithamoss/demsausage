import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal, TypedDict, TypeGuard, overload

import openpyxl

DATA_DIR = Path(__file__).parent / "data"
CACHE_DIR = DATA_DIR / "cache"
DIFFS_DIR = Path(__file__).parent / "diffs"

CACHE_VERSION = 1

ELECTION_DAY_TYPE_ID = 1

VCS_SHEET: Literal["VCs"] = "VCs"
VCS_HEADERS = (
    "District",
    "Voting Location Name",
    "Venue Name",
    "Accessibility",
    "Address Line 1",
    "Address Line 2",
    "Suburb",
    "Post Code",
    "Est. Ord Votes",
    "Est. Absent Votes",
    "Designated Entrance Details",
    "Secondary Designated Entrance Details (if applicable)",
    "Additional Wheel Chair Access Description",
)

EVCS_SHEET: Literal["EVCs"] = "EVCs"
EVCS_HEADERS = (
    "District",
    "Voting Location Name",
    "Venue Name",
    "Accessibility",
    "Address Line 1",
    "Address Line 2",
    "Suburb",
    "Post Code",
    "Est. Early Votes",
    "Designated Entrance Details",
    "Secondary Designated Entrance Details (if applicable)",
    "Additional Wheel Chair Access Description",
)

DEFINITIONS_SHEET = "Definitions"
INFORMATION_DATE_PREFIX = "Information correct as at"

API_ADDRESS_LINE_3_RE = re.compile(r"^(?P<suburb>.+?)\s+VIC\s+(?P<postcode>\d{4})$")

# API venue key -> spreadsheet venue key, for venues the two sources name differently (checked 2026-11-04)
VENUE_KEY_ALIASES = {
    (
        "the hellenic orthodox community of geelong community hall",
        "3 taliska avenue",
        "hamlyn heights",
    ): (
        "the hellenic orthodox community of geelong parish hall",
        "3 taliska avenue",
        "hamlyn heights",
    ),
}

VenueKey = tuple[str, str, str]
SheetCell = str | int | float | None

VCSheetRow = TypedDict(
    "VCSheetRow",
    {
        "District": str,
        "Voting Location Name": str,
        "Venue Name": str,
        "Accessibility": str | None,
        "Address Line 1": str,
        "Address Line 2": str | None,
        "Suburb": str,
        "Post Code": str | int | float,
        "Est. Ord Votes": str | int | float | None,
        "Est. Absent Votes": str | int | float | None,
        "Designated Entrance Details": str | None,
        "Secondary Designated Entrance Details (if applicable)": str | None,
        "Additional Wheel Chair Access Description": str | None,
    },
)

EVCSheetRow = TypedDict(
    "EVCSheetRow",
    {
        "Venue Name": str,
        "Address Line 1": str,
        "Suburb": str,
    },
)

AccessibilityDetail = TypedDict("AccessibilityDetail", {"description": str})
OperationDetail = TypedDict(
    "OperationDetail",
    {
        "operatingFrom": str,
        "operatingTo": str,
        "daysOperating": str,
        "specialCondition": str,
    },
)
ApiVenue = TypedDict(
    "ApiVenue",
    {
        "venueId": str,
        "venueName": str,
        "name": str,
        "votingCentreType": str,
        "votingCentreTypeId": int,
        "accessibilityId": int,
        "wheelChairAccessType": str,
        "accessibilityDetails": list[AccessibilityDetail],
        "phoneNumber": str | None,
        "addressLine1": str,
        "addressLine2": str,
        "addressLine3": str,
        "latitude": float,
        "longitude": float,
        "operationDetails": list[OperationDetail],
        "locationComment": str | None,
        "hostElectorateName": str,
        "hostElectorateType": str,
    },
)
ElectionElectorate = TypedDict(
    "ElectionElectorate",
    {
        "electionElectorateId": str,
        "electionId": str,
        "electorateId": str,
        "electionElectorateStatus": str,
    },
)
ElectionSummary = TypedDict(
    "ElectionSummary",
    {
        "electionId": str,
        "electionTypeDescription": str,
        "electionName": str,
        "electionDate": str,
        "earlyVotingStart": str | None,
        "earlyVotingFinish": str | None,
        "postalVotingStart": str | None,
        "postalVotingFinish": str | None,
        "nominationsFinish": str | None,
        "mapStartDate": str | None,
        "mapEndDate": str | None,
        "electionMethod": str,
        "electionCategoryId": int,
        "electionTypeId": int,
        "electionElectorates": list[ElectionElectorate],
    },
)
SpreadsheetMetadata = TypedDict(
    "SpreadsheetMetadata",
    {
        "page_url": str,
        "url": str,
        "last_modified": str | None,
        "information_date": str | None,
        "sha256": str,
        "filename": str,
    },
)
ScrapeQuery = TypedDict(
    "ScrapeQuery",
    {
        "longitude": float,
        "latitude": float,
        "target_postcode": str | None,
        "requested_at": str,
        "election_day_venue_ids": list[str],
        "radius_km": float,
    },
)
ScrapeCache = TypedDict(
    "ScrapeCache",
    {
        "version": int,
        "complete": bool,
        "stamp": str,
        "started_at": str,
        "finished_at": str | None,
        "spreadsheet": SpreadsheetMetadata,
        "election": ElectionSummary,
        "queries": list[ScrapeQuery],
        "voting_centres": dict[str, ApiVenue],
        "other_centres": dict[str, ApiVenue],
        "unmatched_spreadsheet_venues": list[str],
        "api_venues_not_in_spreadsheet": list[str],
    },
)
PollingPlaceOutputRow = TypedDict(
    "PollingPlaceOutputRow",
    {
        "name": str,
        "premises": str,
        "address": str,
        "lat": float,
        "lon": float,
        "state": str,
        "divisions": str,
        "wheelchair_access": str,
        "wheelchair_access_description": str,
        "entrance_desc": str,
        "opening_hours": str,
        "vec_venue_id": str,
        "host_district": str,
        "is_early_voting_centre": int,
        "est_ordinary_votes": int | None,
        "est_absent_votes": int | None,
    },
)
PollingPlaceCsvRow = TypedDict(
    "PollingPlaceCsvRow",
    {
        "name": str,
        "premises": str,
        "address": str,
        "lat": str,
        "lon": str,
        "state": str,
        "divisions": str,
        "wheelchair_access": str,
        "wheelchair_access_description": str,
        "entrance_desc": str,
        "opening_hours": str,
        "vec_venue_id": str,
        "host_district": str,
        "is_early_voting_centre": str,
        "est_ordinary_votes": str,
        "est_absent_votes": str,
    },
)


def _is_json_object(value: object) -> TypeGuard[dict[str, object]]:
    return isinstance(value, dict)


def _is_object_list(value: object) -> TypeGuard[list[object]]:
    return isinstance(value, list)


def _require_dict(value: object, context: str) -> dict[str, object]:
    if not _is_json_object(value):
        raise ValueError(f"Expected an object for {context}")
    return value


def _require_list(value: object, context: str) -> list[object]:
    if not _is_object_list(value):
        raise ValueError(f"Expected a list for {context}")
    return value


# Invalid external data is consistently reported as ValueError by these parsers.
def _require_str(record: dict[str, object], key: str, context: str) -> str:
    value = record.get(key)
    if not isinstance(value, str):
        raise ValueError(f"Expected text for {context}.{key}")  # noqa: TRY004
    return value


def _require_optional_str(
    record: dict[str, object], key: str, context: str
) -> str | None:
    value = record.get(key)
    if value is not None and not isinstance(value, str):
        raise ValueError(f"Expected text or null for {context}.{key}")
    return value


def _require_int(record: dict[str, object], key: str, context: str) -> int:
    value = record.get(key)
    if not isinstance(value, int) or isinstance(value, bool):
        raise ValueError(f"Expected an integer for {context}.{key}")  # noqa: TRY004
    return value


def _require_float(record: dict[str, object], key: str, context: str) -> float:
    value = record.get(key)
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise ValueError(f"Expected a number for {context}.{key}")  # noqa: TRY004
    return float(value)


def parse_api_venue(value: object) -> ApiVenue:
    raw = _require_dict(value, "API venue")
    accessibility_details: list[AccessibilityDetail] = []
    for item in _require_list(
        raw.get("accessibilityDetails"), "API venue.accessibilityDetails"
    ):
        detail = _require_dict(item, "API accessibility detail")
        accessibility_details.append(
            {
                "description": _require_str(
                    detail, "description", "API accessibility detail"
                )
            }
        )

    operation_details: list[OperationDetail] = []
    for item in _require_list(
        raw.get("operationDetails"), "API venue.operationDetails"
    ):
        detail = _require_dict(item, "API operation detail")
        operation_details.append(
            {
                "operatingFrom": _require_str(
                    detail, "operatingFrom", "API operation detail"
                ),
                "operatingTo": _require_str(
                    detail, "operatingTo", "API operation detail"
                ),
                "daysOperating": _require_str(
                    detail, "daysOperating", "API operation detail"
                ),
                "specialCondition": _require_str(
                    detail, "specialCondition", "API operation detail"
                ),
            }
        )

    return {
        "venueId": _require_str(raw, "venueId", "API venue"),
        "venueName": _require_str(raw, "venueName", "API venue"),
        "name": _require_str(raw, "name", "API venue"),
        "votingCentreType": _require_str(raw, "votingCentreType", "API venue"),
        "votingCentreTypeId": _require_int(raw, "votingCentreTypeId", "API venue"),
        "accessibilityId": _require_int(raw, "accessibilityId", "API venue"),
        "wheelChairAccessType": _require_str(raw, "wheelChairAccessType", "API venue"),
        "accessibilityDetails": accessibility_details,
        "phoneNumber": _require_optional_str(raw, "phoneNumber", "API venue"),
        "addressLine1": _require_str(raw, "addressLine1", "API venue"),
        "addressLine2": _require_str(raw, "addressLine2", "API venue"),
        "addressLine3": _require_str(raw, "addressLine3", "API venue"),
        "latitude": _require_float(raw, "latitude", "API venue"),
        "longitude": _require_float(raw, "longitude", "API venue"),
        "operationDetails": operation_details,
        "locationComment": _require_optional_str(raw, "locationComment", "API venue"),
        "hostElectorateName": _require_str(raw, "hostElectorateName", "API venue"),
        "hostElectorateType": _require_str(raw, "hostElectorateType", "API venue"),
    }


def parse_api_venues(value: object) -> list[ApiVenue]:
    return [
        parse_api_venue(item) for item in _require_list(value, "API venues response")
    ]


def parse_election_summary(value: object) -> ElectionSummary:
    raw = _require_dict(value, "election summary")
    electorates: list[ElectionElectorate] = []
    for item in _require_list(
        raw.get("electionElectorates"), "election summary.electionElectorates"
    ):
        electorate = _require_dict(item, "election electorate")
        electorates.append(
            {
                "electionElectorateId": _require_str(
                    electorate, "electionElectorateId", "election electorate"
                ),
                "electionId": _require_str(
                    electorate, "electionId", "election electorate"
                ),
                "electorateId": _require_str(
                    electorate, "electorateId", "election electorate"
                ),
                "electionElectorateStatus": _require_str(
                    electorate, "electionElectorateStatus", "election electorate"
                ),
            }
        )
    return {
        "electionId": _require_str(raw, "electionId", "election summary"),
        "electionTypeDescription": _require_str(
            raw, "electionTypeDescription", "election summary"
        ),
        "electionName": _require_str(raw, "electionName", "election summary"),
        "electionDate": _require_str(raw, "electionDate", "election summary"),
        "earlyVotingStart": _require_optional_str(
            raw, "earlyVotingStart", "election summary"
        ),
        "earlyVotingFinish": _require_optional_str(
            raw, "earlyVotingFinish", "election summary"
        ),
        "postalVotingStart": _require_optional_str(
            raw, "postalVotingStart", "election summary"
        ),
        "postalVotingFinish": _require_optional_str(
            raw, "postalVotingFinish", "election summary"
        ),
        "nominationsFinish": _require_optional_str(
            raw, "nominationsFinish", "election summary"
        ),
        "mapStartDate": _require_optional_str(raw, "mapStartDate", "election summary"),
        "mapEndDate": _require_optional_str(raw, "mapEndDate", "election summary"),
        "electionMethod": _require_str(raw, "electionMethod", "election summary"),
        "electionCategoryId": _require_int(
            raw, "electionCategoryId", "election summary"
        ),
        "electionTypeId": _require_int(raw, "electionTypeId", "election summary"),
        "electionElectorates": electorates,
    }


def parse_election_summaries(value: object) -> list[ElectionSummary]:
    return [
        parse_election_summary(item)
        for item in _require_list(value, "election summaries response")
    ]


def _require_str_list(value: object, context: str) -> list[str]:
    raw_list = _require_list(value, context)
    if not all(isinstance(item, str) for item in raw_list):
        raise ValueError(f"Expected a list of strings for {context}")
    return [item for item in raw_list if isinstance(item, str)]


def _require_number(value: object, context: str) -> float:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise ValueError(f"Expected a number for {context}")  # noqa: TRY004
    return float(value)


def parse_scrape_query(value: object) -> ScrapeQuery:
    raw = _require_dict(value, "scrape query")
    postcode_value = raw.get("target_postcode")
    if postcode_value is not None and not isinstance(postcode_value, str):
        raise ValueError("Expected scrape query target_postcode to be text or null")
    return {
        "longitude": _require_number(raw.get("longitude"), "scrape query.longitude"),
        "latitude": _require_number(raw.get("latitude"), "scrape query.latitude"),
        "target_postcode": postcode_value,
        "requested_at": _require_str(raw, "requested_at", "scrape query"),
        "election_day_venue_ids": _require_str_list(
            raw.get("election_day_venue_ids"), "scrape query.election_day_venue_ids"
        ),
        "radius_km": _require_number(raw.get("radius_km"), "scrape query.radius_km"),
    }


def parse_scrape_cache(value: object) -> ScrapeCache:
    raw = _require_dict(value, "scrape cache")
    version = _require_int(raw, "version", "scrape cache")
    if version != CACHE_VERSION:
        raise ValueError(
            f"Unsupported cache version {version}; expected {CACHE_VERSION}"
        )
    complete = raw.get("complete")
    if not isinstance(complete, bool):
        raise ValueError("Expected a boolean scrape cache complete field")  # noqa: TRY004
    finished_at = _require_optional_str(raw, "finished_at", "scrape cache")

    spreadsheet_raw = _require_dict(raw.get("spreadsheet"), "scrape cache.spreadsheet")
    last_modified = _require_optional_str(
        spreadsheet_raw, "last_modified", "scrape cache.spreadsheet"
    )
    information_date = _require_optional_str(
        spreadsheet_raw, "information_date", "scrape cache.spreadsheet"
    )
    spreadsheet: SpreadsheetMetadata = {
        "page_url": _require_str(
            spreadsheet_raw, "page_url", "scrape cache.spreadsheet"
        ),
        "url": _require_str(spreadsheet_raw, "url", "scrape cache.spreadsheet"),
        "last_modified": last_modified,
        "information_date": information_date,
        "sha256": _require_str(spreadsheet_raw, "sha256", "scrape cache.spreadsheet"),
        "filename": _require_str(
            spreadsheet_raw, "filename", "scrape cache.spreadsheet"
        ),
    }

    queries = [
        parse_scrape_query(query)
        for query in _require_list(raw.get("queries"), "scrape cache.queries")
    ]
    voting_centres_raw = _require_dict(
        raw.get("voting_centres"), "scrape cache.voting_centres"
    )
    other_centres_raw = _require_dict(
        raw.get("other_centres"), "scrape cache.other_centres"
    )
    voting_centres = {
        key: parse_api_venue(record) for key, record in voting_centres_raw.items()
    }
    other_centres = {
        key: parse_api_venue(record) for key, record in other_centres_raw.items()
    }

    return {
        "version": version,
        "complete": complete,
        "stamp": _require_str(raw, "stamp", "scrape cache"),
        "started_at": _require_str(raw, "started_at", "scrape cache"),
        "finished_at": finished_at,
        "spreadsheet": spreadsheet,
        "election": parse_election_summary(raw.get("election")),
        "queries": queries,
        "voting_centres": voting_centres,
        "other_centres": other_centres,
        "unmatched_spreadsheet_venues": _require_str_list(
            raw.get("unmatched_spreadsheet_venues"),
            "scrape cache.unmatched_spreadsheet_venues",
        ),
        "api_venues_not_in_spreadsheet": _require_str_list(
            raw.get("api_venues_not_in_spreadsheet"),
            "scrape cache.api_venues_not_in_spreadsheet",
        ),
    }


def norm(value: str | float | None) -> str:
    return " ".join(str(value or "").split()).lower()


def venue_key(
    name: str | float | None,
    address_line_1: str | float | None,
    suburb: str | float | None,
) -> VenueKey:
    return (norm(name), norm(address_line_1), norm(suburb))


def strip_district(name: str) -> str:
    return re.sub(r"\s+District$", "", name.strip())


@dataclass
class Venue:
    """An election day venue: one spreadsheet row per district that votes there."""

    key: VenueKey
    rows: list[VCSheetRow] = field(default_factory=lambda: list[VCSheetRow]())

    @property
    def first(self) -> VCSheetRow:
        return self.rows[0]

    @property
    def name(self) -> str:
        return self.first["Venue Name"]

    @property
    def address_line_1(self) -> str:
        return self.first["Address Line 1"]

    @property
    def address_line_2(self) -> str:
        return self.first["Address Line 2"] or ""

    @property
    def suburb(self) -> str:
        return self.first["Suburb"]

    @property
    def postcode(self) -> str:
        return str(self.first["Post Code"])

    @property
    def accessibility(self) -> str | None:
        return self.first["Accessibility"]

    @property
    def wheelchair_description(self) -> str:
        return self.first["Additional Wheel Chair Access Description"] or ""

    @property
    def districts(self) -> list[str]:
        return [strip_district(r["District"]) for r in self.rows]

    def describe(self) -> str:
        return f"{self.name} | {self.address_line_1} | {self.suburb} {self.postcode} | {', '.join(self.districts)}"


def clean_cell(value: object) -> SheetCell:
    if isinstance(value, bool):
        raise ValueError(f"Unexpected boolean spreadsheet cell {value!r}")  # noqa: TRY004
    if value is None or isinstance(value, (str, int, float)):
        return value.strip() if isinstance(value, str) else value
    raise ValueError(
        f"Unsupported spreadsheet cell value {value!r} ({type(value).__name__})"
    )


def _read_sheet_rows(
    path: Path, sheet: str, expected_headers: tuple[str, ...]
) -> list[dict[str, SheetCell]]:
    workbook = openpyxl.load_workbook(path, read_only=True)
    try:
        rows: list[tuple[object, ...]] = []
        for raw_row in workbook[sheet].iter_rows(values_only=True):
            row: tuple[object, ...] = tuple(raw_row)
            if any(cell is not None for cell in row):
                rows.append(row)
        if not rows:
            raise ValueError(f"Sheet {sheet!r} is empty in {path.name}")
        header_cells: list[str] = []
        for cell in rows[0]:
            if cell is None:
                continue
            if not isinstance(cell, str):
                raise ValueError(f"Non-text header in sheet {sheet!r}: {cell!r}")  # noqa: TRY004
            header_cells.append(cell)
        header = tuple(header_cells)
        if header != expected_headers:
            raise ValueError(
                f"Sheet {sheet!r} headers have changed.\n  Expected: {expected_headers}\n  Actual:   {header}"
            )
        parsed_rows: list[dict[str, SheetCell]] = []
        for row_number, row in enumerate(rows[1:], start=2):
            if len(row) != len(expected_headers):
                raise ValueError(
                    f"Row {row_number} in sheet {sheet!r} has {len(row)} cells; expected {len(expected_headers)}"
                )
            parsed_rows.append(
                {
                    header_name: clean_cell(value)
                    for header_name, value in zip(expected_headers, row)
                }
            )
        return parsed_rows
    finally:
        workbook.close()


def _required_text(row: dict[str, SheetCell], field_name: str) -> str:
    value = row[field_name]
    if not isinstance(value, str) or not value:
        raise ValueError(
            f"Expected non-empty text in spreadsheet column {field_name!r}, got {value!r}"
        )
    return value


def _optional_text(row: dict[str, SheetCell], field_name: str) -> str | None:
    value = row[field_name]
    if value is None:
        return None
    if not isinstance(value, str):
        raise ValueError(  # noqa: TRY004
            f"Expected text in spreadsheet column {field_name!r}, got {value!r}"
        )
    return value


def _numeric_cell(
    row: dict[str, SheetCell], field_name: str
) -> str | int | float | None:
    value = row[field_name]
    return value


def _postcode_cell(row: dict[str, SheetCell]) -> str | int | float:
    value = row["Post Code"]
    if value is not None and value != "":
        return value
    raise ValueError(f"Expected a postcode, got {value!r}")


@overload
def read_sheet(
    path: Path, sheet: Literal["VCs"], expected_headers: tuple[str, ...]
) -> list[VCSheetRow]: ...


@overload
def read_sheet(
    path: Path, sheet: Literal["EVCs"], expected_headers: tuple[str, ...]
) -> list[EVCSheetRow]: ...


def read_sheet(
    path: Path, sheet: str, expected_headers: tuple[str, ...]
) -> list[VCSheetRow] | list[EVCSheetRow]:
    rows = _read_sheet_rows(path, sheet, expected_headers)
    if sheet == VCS_SHEET:
        parsed_rows: list[VCSheetRow] = []
        for row in rows:
            parsed_rows.append(
                {
                    "District": _required_text(row, "District"),
                    "Voting Location Name": _required_text(row, "Voting Location Name"),
                    "Venue Name": _required_text(row, "Venue Name"),
                    "Accessibility": _optional_text(row, "Accessibility"),
                    "Address Line 1": _required_text(row, "Address Line 1"),
                    "Address Line 2": _optional_text(row, "Address Line 2"),
                    "Suburb": _required_text(row, "Suburb"),
                    "Post Code": _postcode_cell(row),
                    "Est. Ord Votes": _numeric_cell(row, "Est. Ord Votes"),
                    "Est. Absent Votes": _numeric_cell(row, "Est. Absent Votes"),
                    "Designated Entrance Details": _optional_text(
                        row, "Designated Entrance Details"
                    ),
                    "Secondary Designated Entrance Details (if applicable)": _optional_text(
                        row, "Secondary Designated Entrance Details (if applicable)"
                    ),
                    "Additional Wheel Chair Access Description": _optional_text(
                        row, "Additional Wheel Chair Access Description"
                    ),
                }
            )
        return parsed_rows
    if sheet == EVCS_SHEET:
        parsed_evc_rows: list[EVCSheetRow] = []
        for row in rows:
            parsed_evc_rows.append(
                {
                    "Venue Name": _required_text(row, "Venue Name"),
                    "Address Line 1": _required_text(row, "Address Line 1"),
                    "Suburb": _required_text(row, "Suburb"),
                }
            )
        return parsed_evc_rows
    raise ValueError(f"Unsupported spreadsheet sheet {sheet!r}")


def read_information_date(path: Path) -> str | None:
    """The 'Information correct as at ...' note on the Definitions sheet."""
    workbook = openpyxl.load_workbook(path, read_only=True)
    try:
        for row in workbook[DEFINITIONS_SHEET].iter_rows(values_only=True):
            for cell in row:
                if isinstance(cell, str) and cell.strip().startswith(
                    INFORMATION_DATE_PREFIX
                ):
                    return cell.strip()
        return None
    finally:
        workbook.close()


def load_vc_venues(path: Path) -> dict[VenueKey, Venue]:
    """Group the VCs sheet (one row per district per venue) into venues."""
    venues: dict[VenueKey, Venue] = {}
    errors: list[str] = []

    for row in read_sheet(path, VCS_SHEET, VCS_HEADERS):
        key = venue_key(row["Venue Name"], row["Address Line 1"], row["Suburb"])
        if key not in venues:
            venues[key] = Venue(key)
        else:
            first = venues[key].first
            shared_fields: tuple[tuple[str, SheetCell, SheetCell], ...] = (
                ("Accessibility", first["Accessibility"], row["Accessibility"]),
                ("Address Line 2", first["Address Line 2"], row["Address Line 2"]),
                ("Post Code", first["Post Code"], row["Post Code"]),
                (
                    "Additional Wheel Chair Access Description",
                    first["Additional Wheel Chair Access Description"],
                    row["Additional Wheel Chair Access Description"],
                ),
            )
            errors.extend(
                f"{row['Venue Name']!r}: {field!r} differs between districts ({first_value!r} vs {row_value!r})"
                for field, first_value, row_value in shared_fields
                if first_value != row_value
            )
        venues[key].rows.append(row)

    if errors:
        raise ValueError("Inconsistent joint venue rows:\n  " + "\n  ".join(errors))

    return venues


def load_evc_keys(path: Path) -> set[VenueKey]:
    return {
        venue_key(
            re.sub(r"\s*\(EVC\)$", "", row["Venue Name"]),
            row["Address Line 1"],
            row["Suburb"],
        )
        for row in read_sheet(path, EVCS_SHEET, EVCS_HEADERS)
    }


def parse_api_address_line_3(record: ApiVenue) -> tuple[str, str] | tuple[None, None]:
    match = API_ADDRESS_LINE_3_RE.match((record.get("addressLine3") or "").strip())
    if match is None:
        return None, None
    return match["suburb"], match["postcode"]


def api_venue_key(record: ApiVenue) -> VenueKey:
    suburb, _ = parse_api_address_line_3(record)
    if suburb is None:
        raise ValueError(
            f"Unparseable addressLine3 {record.get('addressLine3')!r} for {record.get('name')!r}"
        )
    return venue_key(record["name"], record["addressLine1"], suburb)


def describe_api_record(record: ApiVenue) -> str:
    return f"{record['name']} | {record['addressLine1']} | {record['addressLine3']} | {record['hostElectorateName']}"


def index_api_voting_centres(
    voting_centres: dict[str, ApiVenue],
) -> dict[VenueKey, list[ApiVenue]]:
    index: dict[VenueKey, list[ApiVenue]] = {}
    for record in voting_centres.values():
        key = api_venue_key(record)
        index.setdefault(VENUE_KEY_ALIASES.get(key, key), []).append(record)
    return index


@dataclass
class MatchResult:
    matched: dict[VenueKey, list[ApiVenue]]
    unmatched_venues: list[Venue]
    unknown_api_records: list[ApiVenue]
    stale_aliases: list[VenueKey]


def match_venues(
    venues: dict[VenueKey, Venue], voting_centres: dict[str, ApiVenue]
) -> MatchResult:
    index = index_api_voting_centres(voting_centres)
    api_keys = {api_venue_key(r) for r in voting_centres.values()}
    return MatchResult(
        matched={key: index[key] for key in venues if key in index},
        unmatched_venues=[v for key, v in venues.items() if key not in index],
        unknown_api_records=[
            r for key, records in index.items() if key not in venues for r in records
        ],
        stale_aliases=[key for key in VENUE_KEY_ALIASES if key not in api_keys],
    )


def load_json(path: Path) -> object:
    with open(path, "r", encoding="utf-8") as f:
        value: object = json.load(f)
        return value


def write_json_atomic(path: Path, data: object) -> None:
    tmp_path = path.with_suffix(path.suffix + ".tmp")
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=1, ensure_ascii=False)
    tmp_path.replace(path)


def cache_paths() -> list[Path]:
    """Scrape caches, newest first."""
    return sorted(CACHE_DIR.glob("* scrape.json"), reverse=True)


def load_cache(path: Path) -> ScrapeCache:
    try:
        return parse_scrape_cache(load_json(path))
    except (KeyError, TypeError, ValueError) as exc:
        raise ValueError(
            f"Invalid scrape cache {path.name}: {exc}; re-run scrape.py --fresh."
        ) from exc


def latest_complete_cache_path() -> Path:
    for path in cache_paths():
        if load_cache(path)["complete"]:
            return path
    raise FileNotFoundError(
        f"No complete scrape found in {CACHE_DIR}; run scrape.py first."
    )


def output_stamp(csv_path: Path) -> str:
    return csv_path.name.removesuffix(" polling places.csv")


def cache_path_for_output(csv_path: Path) -> Path:
    """'<stamp> polling places.csv' -> 'cache/<stamp> scrape.json'."""
    return CACHE_DIR / f"{output_stamp(csv_path)} scrape.json"


def warnings_path_for_stamp(stamp: str) -> Path:
    return DATA_DIR / f"{stamp} warnings.txt"


def output_paths() -> list[Path]:
    """Transform outputs, oldest first."""
    return sorted(DATA_DIR.glob("* polling places.csv"))
