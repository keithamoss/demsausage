import re
from datetime import datetime

import pandas as pd

# Define constants
DATE_FORMAT = "%d/%b/%Y"
START_DATE = datetime.strptime("01/Apr/2025", DATE_FORMAT)
END_DATE = datetime.strptime("04/May/2025", DATE_FORMAT)
LOG_FILE = "demsausage-fed2025-logs/nginx/access.log"
FILTERED_LOG = "processed/access_filtered_1Apr_4May.log"


# Function to check if log date is within range
def date_in_range(log_date_str):
    try:
        log_date = datetime.strptime(log_date_str, DATE_FORMAT)
        return START_DATE <= log_date <= END_DATE
    except ValueError:
        return False


# Step 1: Load and filter data by date range
filtered_logs = []
with open(LOG_FILE, "r") as file:
    for line in file:
        match = re.search(r"\[(\d{2}/\w{3}/\d{4})", line)  # Extract date
        if match and date_in_range(match.group(1)):  # Apply strict filtering
            filtered_logs.append(line)

# Convert to DataFrame and save filtered logs
df = pd.DataFrame(filtered_logs, columns=["log_entry"])
df.to_csv(FILTERED_LOG, index=False, header=False)
