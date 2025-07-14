import pandas as pd

# Define constants
FILTERED_LOG = "processed/access_filtered_1Apr_4May.log"

# Step 2: Reload filtered log for further processing
df = pd.read_csv(FILTERED_LOG, header=None, names=["log_entry"], engine="python")

# Step 3: Extract request URLs (No "?embed" filtering)
df["request_url"] = df["log_entry"].str.extract(r'"(?:GET|POST) ([^"]+) HTTP')

# Step 4: Aggregate and filter request URL counts
url_counts = df["request_url"].value_counts().reset_index()
url_counts.columns = ["Request URL", "Count"]
url_counts = url_counts[url_counts["Count"] >= 25]  # Filter for 25+ hits

# Step 5: Generate ASCII table
table = url_counts.to_markdown(index=False)

# Print and save ASCII table
print(table)
with open("reports/request_url/report.txt", "w") as f:
    f.write(table)

# Step 6: Save URL counts to CSV
url_counts.to_csv("reports/request_url/report.csv", index=False)
