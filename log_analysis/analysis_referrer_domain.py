from urllib.parse import urlparse

import pandas as pd

# Define constants
FILTERED_LOG = "processed/access_filtered_1Apr_4May.log"

# Step 2: Reload filtered log for further processing
df = pd.read_csv(FILTERED_LOG, header=None, names=["log_entry"], engine="python")

# ##################
# Referrer Domain Report
# ##################
# Step 3: Extract request URLs
df["request_url"] = df["log_entry"].str.extract(r'"(?:GET|POST) ([^"]+) HTTP')

# Step 4: Extract referrer domains
df["referrer"] = df["log_entry"].str.extract(r'"[^"]*" \d{3} \d+ "([^"]*)"')
df["referrer_domain"] = df["referrer"].apply(
    lambda x: urlparse(x).netloc if pd.notna(x) else None
)

# Step 5: Aggregate and filter domain counts
domain_counts = df["referrer_domain"].value_counts().reset_index()
domain_counts.columns = ["Domain", "Count"]
domain_counts = domain_counts[domain_counts["Count"] >= 25]  # Filter for 25+ hits

# Step 6: Generate ASCII table for referrer domains
table = domain_counts.to_markdown(index=False)

# Print and save ASCII table for referrer domains
print(table)
with open("reports/referrer_domain/report.txt", "w") as f:
    f.write(table)

# Step 7: Save domain counts to CSV for referrer domains
domain_counts.to_csv("reports/referrer_domain/report.csv", index=False)

# ##################
# Referrer URL Report
# ##################
# Step 3: Extract full referrer URLs
df["referrer_url"] = df["log_entry"].str.extract(r'"[^"]*" \d{3} \d+ "([^"]*)"')

# Step 4: Exclude referrers starting with "https://democracysausage.org"
df = df[~df["referrer_url"].str.startswith("https://democracysausage.org", na=False)]

# Step 5: Aggregate and filter domain counts for referrer URLs
url_counts = df["referrer_url"].value_counts().reset_index()
url_counts.columns = ["Referrer URL", "Count"]
url_counts = url_counts[url_counts["Count"] >= 25]  # Filter for 25+ hits

# Step 6: Generate ASCII table for referrer URLs
table = url_counts.to_markdown(index=False)

# Print and save ASCII table for referrer URLs
print(table)
with open("reports/referrer_url/report.txt", "w") as f:
    f.write(table)

# Step 7: Save domain counts to CSV for referrer URLs
url_counts.to_csv("reports/referrer_url/report.csv", index=False)
