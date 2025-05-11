import pandas as pd

# Define constants
FILTERED_LOG = "processed/access_filtered_1Apr_4May.log"

# Step 2: Reload filtered log for further processing
df = pd.read_csv(FILTERED_LOG, header=None, names=["log_entry"], engine="python")

# Step 3: Extract IP addresses from log entries
df["ip_address"] = df["log_entry"].str.extract(r"^(\d+\.\d+\.\d+\.\d+)")

# Step 4: Aggregate and filter IP counts
ip_counts = df["ip_address"].value_counts().reset_index()
ip_counts.columns = ["IP Address", "Count"]
ip_counts = ip_counts[ip_counts["Count"] >= 25]  # Filter for 25+ hits

# Step 5: Generate ASCII table
table = ip_counts.to_markdown(index=False)

# Print and save ASCII table
print(table)
with open("reports/ip_address/report.txt", "w") as f:
    f.write(table)

# Step 6: Save IP counts to CSV
ip_counts.to_csv("reports/ip_address/report.csv", index=False)
