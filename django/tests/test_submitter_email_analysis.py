import pytest

from demsausage.analysis.submitter_emails import categorize_submissions
from demsausage.analysis.victorian_elections_submitter_emails import (
    summarize_submissions,
)


def test_categorization_normalizes_before_classification_and_counting():
    rows = categorize_submissions(
        [
            {"email": " Office@School.EDU.AU ", "status": "Approved"},
            {"email": "office@school.edu.au", "status": "Approved"},
            {"email": "admin@school.edu.au", "status": "Approved"},
            {"email": "office@school.edu.au", "status": "Declined"},
            {"email": "office@school.edu.au", "status": "Pending"},
        ]
    )

    assert len(rows) == 3
    assert (
        rows[0]
        == rows[1]
        == {
            "email": "office@school.edu.au",
            "domain": "school.edu.au",
            "category": "School",
            "count_of_email": 2,
            "count_of_domain": 3,
        }
    )
    assert rows[2]["count_of_email"] == 1


@pytest.mark.parametrize("reverse", [False, True])
def test_summary_counts_submissions_and_uses_latest_date_not_year(reverse):
    data = [
        {
            "email": " OFFICE@school.edu.au ",
            "status": "Approved",
            "election_name": "Federal Election 2022",
            "election_day": "2022-05-21",
        },
        {
            "email": "office@school.edu.au",
            "status": "Approved",
            "election_name": "Victorian Election 2022",
            "election_day": "2022-11-26",
        },
        {
            "email": "office@school.edu.au",
            "status": "Approved",
            "election_name": "Victorian Election 2022",
            "election_day": "2022-11-26",
        },
        {
            "email": "office@school.edu.au",
            "status": "Declined",
            "election_name": "Victorian Election 2026",
            "election_day": "2026-11-28",
        },
        {"email": "pending@school.edu.au", "status": "Pending"},
    ]
    if reverse:
        data.reverse()

    assert summarize_submissions(data, categorize_submissions(data)) == [
        {
            "email": "office@school.edu.au",
            "category": "School",
            "last_election_seen": "Victorian Election 2022",
            "submission_count": 3,
        }
    ]


def test_summary_retains_existing_category_exclusions():
    data = [
        {
            "email": email,
            "status": "Approved",
            "election_name": "Election",
            "election_day": "2026-11-28",
        }
        for email in [
            "person@gmail.com",
            "office@example.invalid",
            "office@example.gov.au",
            " Fundraising@GMAIL.COM ",
        ]
    ]

    rows = summarize_submissions(data, categorize_submissions(data))

    assert len(rows) == 1
    assert rows[0]["email"] == "fundraising@gmail.com"
    assert rows[0]["category"] == "P&C Organisation - Private Email"


def test_summary_rejects_missing_or_conflicting_categories():
    data = [{"email": "office@school.edu.au", "status": "Approved"}]
    with pytest.raises(ValueError, match="no email category"):
        summarize_submissions(data, [])

    with pytest.raises(ValueError, match="Conflicting email categories"):
        summarize_submissions(
            data,
            [
                {"email": "office@school.edu.au", "category": "School"},
                {"email": " OFFICE@SCHOOL.EDU.AU ", "category": ""},
            ],
        )
