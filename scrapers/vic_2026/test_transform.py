import csv
import io
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

import diff
import openpyxl
import scrape
import transform
from common import VCS_HEADERS, ApiVenue, ScrapeCache


class ElectionDayOnlyTests(unittest.TestCase):
    def test_transform_does_not_require_early_voting_sheet(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            workbook = openpyxl.Workbook()
            sheet = workbook.active
            assert sheet is not None
            sheet.title = "VCs"
            sheet.append(list(VCS_HEADERS))
            sheet.append(
                [
                    "District",
                    "Test",
                    "Test Hall",
                    "IWA",
                    "1 Test Street",
                    None,
                    "Testville",
                    "3000",
                    10,
                    2,
                    None,
                    None,
                    None,
                ]
            )
            workbook.save(path / "venues.xlsx")
            workbook.close()
            record: ApiVenue = {
                "venueId": "test-id",
                "venueName": "Test Hall",
                "name": "Test Hall",
                "votingCentreType": "Voting Centre",
                "votingCentreTypeId": 1,
                "accessibilityId": 2,
                "wheelChairAccessType": "IWA",
                "accessibilityDetails": [],
                "phoneNumber": None,
                "addressLine1": "1 Test Street",
                "addressLine2": "",
                "addressLine3": "Testville VIC 3000",
                "latitude": -37.8,
                "longitude": 144.9,
                "operationDetails": [
                    {
                        "operatingFrom": "2026-11-28T08:00:00",
                        "operatingTo": "2026-11-28T18:00:00",
                        "daysOperating": "Election day",
                        "specialCondition": "",
                    }
                ],
                "locationComment": None,
                "hostElectorateName": "District",
                "hostElectorateType": "District",
            }
            cache: ScrapeCache = {
                "version": 1,
                "complete": True,
                "stamp": "test",
                "started_at": "2026-11-13T00:00:00",
                "finished_at": "2026-11-13T00:00:00",
                "spreadsheet": {
                    "filename": "venues.xlsx",
                    "page_url": "",
                    "url": "",
                    "last_modified": None,
                    "information_date": None,
                    "sha256": "",
                },
                "election": {
                    "electionId": "test",
                    "electionTypeDescription": "",
                    "electionName": "",
                    "electionDate": "2026-11-28",
                    "earlyVotingStart": None,
                    "earlyVotingFinish": None,
                    "postalVotingStart": None,
                    "postalVotingFinish": None,
                    "nominationsFinish": None,
                    "mapStartDate": None,
                    "mapEndDate": None,
                    "electionMethod": "",
                    "electionCategoryId": 0,
                    "electionTypeId": 0,
                    "electionElectorates": [],
                },
                "queries": [],
                "voting_centres": {"test-id": record},
                "other_centres": {},
                "unmatched_spreadsheet_venues": [],
                "api_venues_not_in_spreadsheet": [],
            }
            with patch.object(transform, "CACHE_DIR", path):
                rows, errors, warnings = transform.build_rows(cache)
            self.assertEqual(errors, [])
            self.assertEqual(warnings, [])
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["name"], "Test")
            self.assertNotIn("is_early_voting_centre", rows[0])

            map_only = record.copy()
            map_only.update(
                venueId="map-only-id",
                venueName="Map-only School",
                name="Map-only School",
                addressLine1="2 Test Street",
                latitude=-37.81,
            )
            cache["voting_centres"][map_only["venueId"]] = map_only
            with patch.object(transform, "CACHE_DIR", path):
                rows, errors, warnings = transform.build_rows(cache)
            self.assertEqual(len(rows), 1)
            self.assertEqual(len(errors), 1)
            self.assertIn("NOT IN SPREADSHEET: Map-only School", errors[0])

            with (
                patch.object(transform, "CACHE_DIR", path),
                patch.object(
                    transform, "API_ONLY_VENUE_IDS", frozenset({"map-only-id"})
                ),
            ):
                rows, errors, warnings = transform.build_rows(cache)
            self.assertEqual(errors, [])
            self.assertEqual(len(rows), 2)
            api_row = next(row for row in rows if row["vec_venue_id"] == "map-only-id")
            self.assertEqual(api_row["wheelchair_access"], "Full")
            self.assertIsNone(api_row["est_ordinary_votes"])
            self.assertIsNone(api_row["est_absent_votes"])

            cache["queries"] = [
                {
                    "longitude": 144.9,
                    "latitude": -37.8,
                    "target_postcode": None,
                    "requested_at": "2026-11-13T00:00:00",
                    "election_day_venue_ids": ["test-id", "map-only-id"],
                    "radius_km": 0.0,
                }
            ]
            with (
                patch.object(scrape, "CACHE_DIR", path),
                patch.object(scrape, "API_ONLY_VENUE_IDS", frozenset({"map-only-id"})),
                patch.object(
                    scrape, "start_cache", return_value=(cache, path / "cache.json")
                ),
                patch.object(scrape, "next_target", return_value=None),
                patch.object(scrape, "write_json_atomic"),
                redirect_stdout(io.StringIO()) as output,
            ):
                self.assertEqual(scrape.main(fresh=True), 0)
            self.assertIn("APPROVED API-ONLY: Map-only School", output.getvalue())

            with (
                patch.object(scrape, "CACHE_DIR", path),
                patch.object(scrape, "API_ONLY_VENUE_IDS", frozenset[str]()),
                patch.object(
                    scrape, "start_cache", return_value=(cache, path / "cache.json")
                ),
                patch.object(scrape, "next_target", return_value=None),
                patch.object(scrape, "write_json_atomic"),
                redirect_stdout(io.StringIO()) as output,
            ):
                self.assertEqual(scrape.main(fresh=True), 1)
            self.assertIn("NOT IN SPREADSHEET: Map-only School", output.getvalue())

    def test_diff_ignores_retired_early_voting_column(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            old_path, new_path = path / "old.csv", path / "new.csv"
            for csv_path, fields, row in (
                (
                    old_path,
                    ["vec_venue_id", "name", "is_early_voting_centre"],
                    ["id", "Test", "1"],
                ),
                (new_path, ["vec_venue_id", "name"], ["id", "Test"]),
            ):
                with csv_path.open("w", newline="", encoding="utf-8") as file:
                    writer = csv.writer(file)
                    writer.writerow(fields)
                    writer.writerow(row)
            self.assertEqual(diff.load(old_path), diff.load(new_path))


if __name__ == "__main__":
    unittest.main()
