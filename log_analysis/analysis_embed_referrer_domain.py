from urllib.parse import urlparse

import pandas as pd

# Define constants
FILTERED_LOG = "processed/access_filtered_1Apr_4May.log"

# Step 2: Reload filtered log for further processing
df = pd.read_csv(FILTERED_LOG, header=None, names=["log_entry"], engine="python")

# Step 3: Extract request URLs and filter requests containing "?embed"
df["request_url"] = df["log_entry"].str.extract(r'"(?:GET|POST) ([^"]+) HTTP')
df = df[df["request_url"].str.contains(r"\?embed", na=False)]

# Step 4: Extract referrer domains
df["referrer"] = df["log_entry"].str.extract(r'"[^"]*" \d{3} \d+ "([^"]*)"')
df["referrer_domain"] = df["referrer"].apply(
    lambda x: urlparse(x).netloc if pd.notna(x) else None
)

# Step 5: Aggregate and filter domain counts
domain_counts = df["referrer_domain"].value_counts().reset_index()
domain_counts.columns = ["Domain", "Count"]
domain_counts = domain_counts[domain_counts["Count"] >= 25]  # Filter for 25+ hits

# Step 6: Generate ASCII table
table = domain_counts.to_markdown(index=False)

# Print and save ASCII table
print(table)
with open("reports/embed_referrer_domain/report.txt", "w") as f:
    f.write(table)

# Step 7: Save domain counts to CSV
domain_counts.to_csv("reports/embed_referrer_domain/report.csv", index=False)
