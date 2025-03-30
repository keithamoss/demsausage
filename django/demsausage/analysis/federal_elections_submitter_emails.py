import csv
import json

# IMPORTANT!
# This script assumes that submitter_emails.py has been run and already produced its outputs.
# We rely on these outputs for the email address categorisation.

output = {}

with open("output_submitter_emails_20250323.json") as fo:
    submitter_emails_categorisation = json.load(fo)

    with open("federal_elections_submitter_emails_20250330.json") as fi:
        data = json.load(fi)

        for item in data:
            if item["email"] not in output:
                lookup = next(
                    (
                        i
                        for i in submitter_emails_categorisation
                        if i["email"] == item["email"]
                    ),
                    None,
                )

                if lookup is None:
                    print(f"{item["email"]} not found in the categorisation list")
                    continue

                if lookup["category"] in ["", "Private Email", "Government - Other"]:
                    continue

                output[item["email"]] = {
                    "email": item["email"],
                    "category": lookup["category"],
                    "last_federal_election": item["election_name"],
                    "submission_count": 1,
                }
            else:
                current_election = int(
                    output[item["email"]]["last_federal_election"].split(" ").pop()
                )
                this_election = int(item["election_name"].split(" ").pop())

                if this_election > current_election:
                    output[item["email"]]["last_federal_election"] = item[
                        "election_name"
                    ]

                output[item["email"]]["submission_count"] += 1

    with open(
        "output_federal_elections_submitter_emails_20250330.csv", mode="w", newline=""
    ) as file:
        writer = csv.DictWriter(
            file,
            fieldnames=[
                "email",
                "category",
                "last_federal_election",
                "submission_count",
            ],
        )
        writer.writeheader()

        for row in list(output.values()):
            writer.writerow(row)
