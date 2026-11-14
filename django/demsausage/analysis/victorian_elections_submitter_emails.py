"""Summarize approved Victorian submissions by normalized email address.

Run submitter_emails.py first. Election export rows require email, status,
election_name, and election_day (an ISO YYYY-MM-DD date). Export submissions
linked to polling places with state='VIC', across all non-test elections.
submission_count counts submission rows, not distinct elections.
"""

import csv
import json
from datetime import date


def summarize_submissions(data, categorisation):
    categories = {}
    for item in categorisation:
        email = item["email"].strip().lower()
        category = item["category"]
        if email in categories and categories[email] != category:
            raise ValueError("Conflicting email categories; rerun submitter_emails.py.")
        categories[email] = category

    output = {}
    latest_dates = {}
    for item in data:
        if item["status"] != "Approved":
            continue

        email = item["email"].strip().lower()
        if email not in categories:
            raise ValueError(
                "Approved submission has no email category; rerun submitter_emails.py."
            )
        category = categories[email]
        if category in ["", "Private Email", "Government - Other"]:
            continue

        election_day = date.fromisoformat(item["election_day"])
        if email not in output:
            output[email] = {
                "email": email,
                "category": category,
                "last_election_seen": item["election_name"],
                "submission_count": 1,
            }
            latest_dates[email] = election_day
        else:
            if election_day > latest_dates[email]:
                output[email]["last_election_seen"] = item["election_name"]
                latest_dates[email] = election_day
            output[email]["submission_count"] += 1

    return list(output.values())


def main():
    with open("output_submitter_emails_20261114.json") as file:
        categorisation = json.load(file)
    with open("victorian_elections_submitter_emails_20261114.json") as file:
        output = summarize_submissions(json.load(file), categorisation)

    with open(
        "output_victorian_elections_submitter_emails_20261114.csv", mode="w", newline=""
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=[
                "email",
                "category",
                "last_election_seen",
                "submission_count",
            ],
        )
        writer.writeheader()

        writer.writerows(output)


if __name__ == "__main__":
    main()
