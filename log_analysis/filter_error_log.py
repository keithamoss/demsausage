import re
from datetime import datetime

import pandas as pd

# Define constants
DATE_FORMAT = "%Y/%m/%d"
START_DATE = datetime.strptime("01/Apr/2025", "%d/%b/%Y")
END_DATE = datetime.strptime("04/May/2025", "%d/%b/%Y")
LOG_FILE = "demsausage-fed2025-logs/nginx/error.log"
FILTERED_LOG = "processed/error_filtered_1Apr_4May.log"


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
        match = re.search(r"^(\d{4}/\d{2}/\d{2})", line)  # Extract date
        if match and date_in_range(match.group(1)):  # Apply strict filtering
            if (
                "an upstream response is buffered to a temporary file" not in line
                and "a client request body is buffered to a temporary file" not in line
                and "SSL_do_handshake() failed" not in line
            ):
                filtered_logs.append(line)

# Convert to DataFrame and save filtered logs
df = pd.DataFrame(filtered_logs, columns=["log_entry"])
df.to_csv(FILTERED_LOG, index=False, header=False)
