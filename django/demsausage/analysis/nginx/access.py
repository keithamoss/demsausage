#  Source:
# https://linuxtech.in/efficiently-parsing-nginx-log-files-using-python/

import argparse
import csv
import glob
import gzip
import os
import re
from datetime import datetime, timezone

# Define a regular expression pattern to match a line in an nginx log file
line_format = re.compile(r'(\S+) - - \[(.*?)\] "(.*?)" (\d+) (\d+) "(.*?)" "(.*?)"')


# Define a function to format bytes as a string with a unit
def format_bytes(bytes):
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if bytes < 1024.0:
            return f"{bytes:.2f} {unit}"
        bytes /= 1024.0


# Define a function to process nginx log files
def process_logs(log_path, output_file):
    dt_minimum = datetime(2025, 1, 1, tzinfo=timezone.utc)

    # Check if the log_path is a directory or a file, and get a list of files to process
    if os.path.isdir(log_path):
        files = glob.glob(log_path + "/*.gz") + glob.glob(log_path + "/*.log")
    elif os.path.isfile(log_path):
        files = [log_path]
    else:
        print("Invalid log path")
        return

    # Define some variables to store summary statistics
    ip_counts = {}
    status_counts = {}
    status403_ips = {}
    referrer_counts = {}
    bytes_sent_total = 0

    # Open the output file and write the header row
    with open(output_file, "w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(
            [
                "IP",
                "Timestamp",
                "Method",
                "URL",
                "Status",
                "Bytes Sent",
                "Referrer",
                "User Agent",
            ]
        )

        # Loop over each file to process
        for filename in files:

            # Check if the file is gzipped or not, and open it accordingly
            if filename.endswith(".gz"):
                open_fn = gzip.open
            else:
                open_fn = open

            # Open the file and loop over each line
            with open_fn(filename, "rt", encoding="utf-8") as file:
                for line in file:

                    # Match the line against the regular expression pattern
                    match = line_format.match(line.strip())

                    # If there is a match, extract the relevant fields and write them to the output file
                    if match:
                        (
                            ip,
                            date_str,
                            request,
                            status,
                            bytes_sent,
                            referrer,
                            user_agent,
                        ) = match.groups()
                        dt = datetime.strptime(date_str, "%d/%b/%Y:%H:%M:%S %z")
                        try:
                            method, url = request.split()[0], " ".join(
                                request.split()[1:]
                            )
                        except IndexError:
                            method, url = request, ""

                        if dt >= dt_minimum:
                            writer.writerow(
                                [
                                    ip,
                                    dt,
                                    method,
                                    url,
                                    status,
                                    bytes_sent,
                                    referrer,
                                    user_agent,
                                ]
                            )

                            # Update summary statistics
                            ip_counts[ip] = ip_counts.get(ip, 0) + 1
                            status_counts[status] = status_counts.get(status, 0) + 1
                            bytes_sent_total += int(bytes_sent)
                            if status == "403":
                                status403_ips[ip] = status403_ips.get(ip, 0) + 1
                            referrer_counts[referrer] = (
                                referrer_counts.get(referrer, 0) + 1
                            )

    # Print summary stats
    print("\033[1m\033[91mTotal number of log entries:\033[0m", sum(ip_counts.values()))
    print("\033[1m\033[91mNumber of unique IP addresses:\033[0m", len(ip_counts))
    print("\033[1m\033[91mNumber of unique status codes:\033[0m", len(status_counts))
    print("\033[1m\033[91mBytes sent in total:\033[0m", format_bytes(bytes_sent_total))
    print("\033[1m\033[91mTop 10 IP addresses by request count:\033[0m")
    for ip, count in sorted(ip_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"{ip}: {count}")
    print("\033[1m\033[91mTop 10 status codes by count:\033[0m")
    for status, count in sorted(
        status_counts.items(), key=lambda x: x[1], reverse=True
    )[:10]:
        print(f"{status}: {count}")
    print("\033[1m\033[91mTop 20 IP addresses with status code 403:\033[0m")
    for ip, count in sorted(status403_ips.items(), key=lambda x: x[1], reverse=True)[
        :10
    ]:
        print(f"{ip}: {count}")
    print("\033[1m\033[91mTop 10 referrers by count:\033[0m")
    for referrer, count in sorted(
        referrer_counts.items(), key=lambda x: x[1], reverse=True
    )[:10]:
        print(f"{referrer}: {count}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process nginx log files.")
    parser.add_argument(
        "--log_path",
        metavar="LOG_PATH",
        type=str,
        help="Path to the log file or directory",
    )
    parser.add_argument(
        "--output_file",
        metavar="OUTPUT_FILE",
        type=str,
        help="Path to the output CSV file",
    )
    args = parser.parse_args()
    process_logs(args.log_path, args.output_file)
