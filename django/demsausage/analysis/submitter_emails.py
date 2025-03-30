import csv
import json
from email.headerregistry import Address


def is_private_email(domain):
    # Includes all private email domains with 5 or more users as of the WA 2025 election
    return domain in [
        "gmail.com",
        "hotmail.com",
        "bigpond.com",
        "outlook.com",
        "yahoo.com",
        "yahoo.com.au",
        "optusnet.com.au",
        "live.com.au",
        "iinet.net.au",
        "icloud.com",
        "bigpond.net.au",
        "me.com",
        "westnet.com.au",
        "internode.on.net",
        "live.com",
        "outlook.com.au",
        "ymail.com",
        "y7mail.com",
        "tpg.com.au",
        "gmail.com.au",
        "yahoo.co.uk",
        "adam.com.au",
        "exemail.com.au",
        "mac.com",
        "hotmail.co.uk",
        "mail.com",
        "hotmail.com.au",
        "msn.com",
        "email.com",
        "protonmail.com",
        "rocketmail.com",
    ]


def get_private_email_category(email):
    if is_private_email(Address(addr_spec=email).domain) is True:
        if (
            "pandc@" in email
            or email.startswith("pandc")
            or "spc@" in email
            or email.startswith("spc")
            or "pnc@" in email
            or email.startswith("pnc")
            or "fundraising@" in email
            or "fundraising" in email
            or email.startswith("fundraising")
        ):
            return "P&C Organisation - Private Email"
        return "Private Email"

    return ""


def get_email_category(email):
    domain = Address(addr_spec=stall["email"]).domain

    if is_private_email(domain) is True:
        return get_private_email_category(email)
    elif domain in [
        "education.vic.gov.au",
        "education.tas.gov.au",
        "education.nsw.gov.au",
        "education.wa.gov.au",
        "education.qld.gov.au",
        "eq.edu.au",
        "education.sa.gov.au",
        "education.act.gov.au",
        "education.nt.gov.au",
    ]:
        return "Government - State and Territory Education Department"
    elif domain.endswith(".edu.au") or domain in [
        "edumail.vic.gov.au",
        "ntschools.net",
    ]:
        return "School"
    elif (
        domain.startswith("elections.")
        and domain.endswith(".gov.au")
        or domain in ["eq.ed"]
    ):
        return "Government - Electoral Commission"
    elif domain.endswith(".gov.au"):
        return "Government - Other"
    elif (
        "pandc" in domain
        or "spc." in domain
        or "pnc." in domain
        or domain
        in [
            "pandcaffiliate.org.au",
            "lathlainps.org.au",
            "pandcjpss.com",
            "putneypc.org.au",
            "atwellpc.org.au",
            "lcwps.com.au",
            "gpps.org.au",
            "irpspc.com",
            "drummoynepublicschool.com.au",
            "ardps.com.au",
            "laurimarps.com",
            "wpps-pca.org.au",
            "nmps.fun",
        ]
    ):
        return "P&C Organisation - Official Email"
    elif domain.endswith("scouts.com.au") or domain in [
        "sacfsvolunteer.org.au",
        "scoutsvictoria.com.au",
        "scoutsqld.com.au",
        "cliftonhill.scoutsqld.com.au",
        "nwsscoutgroup.com",
        "salvationarmy.org.au",
        "aus.salvationarmy.org",
        "guidesvic.org.au",
        "girlguides-nswactnt.org.au",
        "ymca.org.au",
        "westpointsoccerclub.com.au",
        "lions.org.au",
    ]:
        return "Volunteer Organisation"
    elif domain in [
        "willoughbyuniting.org.au",
        "standrewsbrighton.org.au",
        "macquarieanglican.org",
        "stjohnsanglican.org.au",
        "suchaplaincy.org.au",
        "stgeorgesbatterypoint.org",
        "wellspring.org.au",
        "wyongbaptist.org",
        "cam.org.au",
        "stjohnsbulimba.org",
        "nazarethlutheran.org.au",
        "lac.org.au",
        "stbarneys.org.au",
        "lostsheep.com.au",
        "keac.com.au",
        "thecorner.org.au",
        "toowongunitingchurch.org.au",
        "stpeterscremorne.org.au",
        "wcunitedchurch.org.au",
        "waitaraanglican.com.au",
        "stphils.org",
        "stbenedicts.com.au",
        "christchurchhawthorn.org",
        "stmarksfh.org",
        "paddington.church",
        "eppingchurchofchrist.org.au",
        "kacsydney.com.au",
    ]:
        return "Church Organisation"
    elif domain in [
        "csch.org.au",
        "bradburycfs.org.au",
        "newtownswans.com.au",
        "southperthunitedfc.com.au",
        "ycc.net.au",
        "emg.org.au",
        "junctioncommunity.org.au",
        "connectvictoriapark.org",
        "belgravesouthcfa.com.au",
        "pcycnsw.org.au",
        "skcc.net.au",
        "citynorthmensshed.org.au",
        "cloverdalecommunitycentre.org.au",
        "woodridgecommunityassociation.com.au",
    ]:
        return "Community Organisation"

    return ""


emails = []
emails_by_email = {}
emails_by_domain = {}

with open("submitter_emails_20250323.json") as f:
    data = json.load(f)

    for stall in data:
        if stall["email"] not in emails_by_email:
            emails_by_email[stall["email"]] = 0
        emails_by_email[stall["email"]] += 1

        domain = Address(addr_spec=stall["email"]).domain
        if domain not in emails_by_domain:
            emails_by_domain[domain] = 0
        emails_by_domain[domain] += 1

    for stall in data:
        emails.append(
            {
                "email": stall["email"],
                "domain": Address(addr_spec=stall["email"]).domain,
                "category": get_email_category(stall["email"]),
                "count_of_email": emails_by_email[stall["email"]],
                "count_of_domain": emails_by_domain[
                    Address(addr_spec=stall["email"]).domain
                ],
            }
        )

    with open("output_submitter_emails_20250323.csv", mode="w", newline="") as file:
        writer = csv.DictWriter(
            file,
            fieldnames=[
                "email",
                "domain",
                "category",
                "count_of_email",
                "count_of_domain",
            ],
        )
        writer.writeheader()

        for row in emails:
            writer.writerow(row)

    with open("output_submitter_emails_20250323.json", mode="w") as file:
        json.dump(emails, file)
