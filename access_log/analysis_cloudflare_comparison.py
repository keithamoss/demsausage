import re

import pandas as pd

# Define constants
FILTERED_LOG = "processed/access_filtered_1Apr_4May.log"

# Step 2: Reload filtered log for further processing
df = pd.read_csv(FILTERED_LOG, header=None, names=["log_entry"], engine="python")

# Step 3: Extract necessary fields
df["request_url"] = df["log_entry"].str.extract(r'"(?:GET|POST) ([^"]+) HTTP')
df["status_code"] = df["log_entry"].str.extract(r'" \d{3} (\d{3})')
df["referrer_url"] = df["log_entry"].str.extract(r'"[^"]*" \d{3} \d+ "([^"]*)"')

# Step 4: Filter only 200 OK responses & exclude unwanted referrers
df = df[~df["referrer_url"].str.startswith("https://democracysausage.org", na=False)]


# Step 5: Categorize request URLs
def categorize_url(url):
    if url.startswith("/sausagelytics"):
        return "Sausagelytics Requests"
    elif url.startswith("/about"):
        return "About Page Requests"
    elif "?embed" in url:
        return "Embedded Requests"
    elif re.search(r"\.(js|css)$", url):
        return "JavaScript & CSS Files"
    elif re.search(r"\.(png|jpg|jpeg|gif|webp|svg|ico)$", url):
        return "Image & Favicon Files"
    elif url.startswith("/federal_election_2025"):
        return "Federal Election 2025 Requests"
    elif "/api/0.1/" in url:
        return "API Requests (/api/0.1/)"
    elif url in ["/", "/index.html"]:
        return "Root of Site Requests"
    elif url in ["manifest.json", "robots.txt", "sitemap.xml"]:
        return "Infrastructure Files"
    else:
        return "Other Requests"


df["category"] = df["request_url"].apply(lambda x: categorize_url(str(x)))

# Step 6: Aggregate and filter request counts by category
category_counts = df["category"].value_counts().reset_index()
category_counts.columns = ["Request Category", "Count"]

# Step 7: Generate ASCII table
table = category_counts.to_markdown(index=False)

# Print and save ASCII table
print(table)
with open("reports/request_url_category/report.txt", "w") as f:
    f.write(table)

# Step 8: Save category counts to CSV
category_counts.to_csv("reports/request_url_category/report.csv", index=False)
