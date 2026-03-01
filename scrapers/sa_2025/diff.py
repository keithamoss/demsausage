import csv
import os
import re
import sys

# ANSI colour codes
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"
DIVIDER = f"{DIM}{'─' * 60}{RESET}"


def _strip_ansi(text):
    """Remove ANSI escape codes from a string."""
    return re.sub(r"\033\[[0-9;]*m", "", text)


class _Tee:
    """Write to both the real stdout (with ANSI) and a file (ANSI-stripped)."""

    def __init__(self, real_stdout, file):
        self._real = real_stdout
        self._file = file

    def write(self, text):
        self._real.write(text)
        self._file.write(_strip_ansi(text))

    def flush(self):
        self._real.flush()
        self._file.flush()


def _slugify(name):
    """Normalise a filename stem to lowercase hyphen-separated words."""
    name = re.sub(r"[\s_]+", "-", name)  # spaces/underscores → hyphens
    name = re.sub(r"[^\w-]", "", name)  # strip anything else odd
    return name.lower().strip("-")


def _derive_output_path(file1_path, file2_path):
    """Build an output filename like diffs/diff-<name1>-vs-<name2>.txt."""
    name1 = _slugify(os.path.splitext(os.path.basename(file1_path))[0])
    name2 = _slugify(os.path.splitext(os.path.basename(file2_path))[0])
    os.makedirs("diffs", exist_ok=True)
    return os.path.join("diffs", f"diff-{name1}-vs-{name2}.txt")


def load_csv(file_path):
    with open(file_path, "r") as file:
        reader = csv.reader(file)
        rows = list(reader)
    header = rows[0]
    data = rows[1:]
    return header, data


def validate_rows(file_path, header, data, id_column):
    """Check for column count mismatches and blank IDs. Returns indices of rows to skip."""
    id_index = header.index(id_column)
    expected_cols = len(header)
    skip_indices = set()

    bad_col_rows = []
    blank_id_rows = []

    for i, row in enumerate(data):
        row_num = i + 2  # 1-based, accounting for header
        if len(row) != expected_cols:
            bad_col_rows.append((row_num, len(row)))
            skip_indices.add(i)
        elif not row[id_index].strip():
            blank_id_rows.append(row_num)
            skip_indices.add(i)

    if bad_col_rows:
        print(
            f"{RED}{BOLD}Error: column count mismatch in {file_path} (expected {expected_cols} columns):{RESET}"
        )
        for row_num, col_count in bad_col_rows:
            print(
                f"  {RED}Row {row_num}: has {col_count} columns — row will be skipped{RESET}"
            )
        print()

    if blank_id_rows:
        print(f"{YELLOW}{BOLD}Warning: blank '{id_column}' in {file_path}:{RESET}")
        for row_num in blank_id_rows:
            print(f"  {YELLOW}Row {row_num}: blank ID — row will be skipped{RESET}")
        print()

    return skip_indices


def check_duplicates(file_path, header, data, id_column, skip_indices):
    """Check for duplicate IDs among valid rows. Returns set of duplicate IDs to exclude from diff."""
    id_index = header.index(id_column)
    seen = {}
    for i, row in enumerate(data):
        if i in skip_indices:
            continue
        row_id = row[id_index]
        seen.setdefault(row_id, 0)
        seen[row_id] += 1

    dupes = {k: v for k, v in seen.items() if v > 1}
    if dupes:
        print(
            f"{YELLOW}{BOLD}Warning: duplicate '{id_column}' values in {file_path} — these rows will be skipped:{RESET}"
        )
        for dupe_id, count in sorted(
            dupes.items(), key=lambda x: (int(x[0]) if x[0].isdigit() else x[0])
        ):
            print(f"  {YELLOW}{id_column} {dupe_id} appears {count} times{RESET}")
        print()
    return set(dupes.keys())


def format_row(header, row):
    """Format a row as indented key: value pairs, skipping empty values."""
    lines = []
    for key, value in zip(header, row):
        if value:
            lines.append(f"  {DIM}{key}:{RESET} {value}")
    return "\n".join(lines)


def generate_report(file1_path, file2_path, sort_column, premises_column):
    header1, data1 = load_csv(file1_path)
    header2, data2 = load_csv(file2_path)

    output_path = _derive_output_path(file1_path, file2_path)
    real_stdout = sys.stdout

    with open(output_path, "w", encoding="utf-8") as f:
        sys.stdout = _Tee(real_stdout, f)
        try:
            _generate_report_inner(
                file1_path,
                file2_path,
                sort_column,
                premises_column,
                header1,
                data1,
                header2,
                data2,
            )
        finally:
            sys.stdout = real_stdout

    print(f"{DIM}Report saved to: {output_path}{RESET}")


def _generate_report_inner(
    file1_path,
    file2_path,
    sort_column,
    premises_column,
    header1,
    data1,
    header2,
    data2,
):
    # Ensure headers match
    if header1 != header2:
        print(f"{RED}Headers do not match between the two files!{RESET}")
        return

    skip1 = validate_rows(file1_path, header1, data1, sort_column)
    skip2 = validate_rows(file2_path, header2, data2, sort_column)

    dupes1 = check_duplicates(file1_path, header1, data1, sort_column, skip1)
    dupes2 = check_duplicates(file2_path, header2, data2, sort_column, skip2)
    excluded_ids = dupes1 | dupes2

    pp_id_index = header1.index(sort_column)
    premises_index = header1.index(premises_column)

    # Build dicts keyed by ID, excluding invalid and duplicate rows
    map1 = {
        row[pp_id_index]: row
        for i, row in enumerate(data1)
        if i not in skip1 and row[pp_id_index] not in dupes1
    }
    map2 = {
        row[pp_id_index]: row
        for i, row in enumerate(data2)
        if i not in skip2 and row[pp_id_index] not in dupes2
    }

    all_ids = sorted(
        (map1.keys() | map2.keys()) - excluded_ids,
        key=lambda x: (int(x) if x.isdigit() else x),
    )

    only_in_file1 = []
    only_in_file2 = []
    mismatches = []

    for pp_id in all_ids:
        if pp_id not in map2:
            only_in_file1.append(pp_id)
        elif pp_id not in map1:
            only_in_file2.append(pp_id)
        else:
            row1, row2 = map1[pp_id], map2[pp_id]
            if row1 != row2:
                diff_cells = [
                    (header1[j], row1[j], row2[j])
                    for j in range(len(row1))
                    if row1[j] != row2[j]
                ]
                mismatches.append((pp_id, diff_cells))

    # Summary
    total_changes = len(only_in_file1) + len(only_in_file2) + len(mismatches)
    print(f"\n{BOLD}=== Diff Report ==={RESET}")
    print(f"{DIM}file1: {file1_path}{RESET}")
    print(f"{DIM}file2: {file2_path}{RESET}\n")

    if total_changes == 0:
        print(f"{GREEN}No differences found.{RESET}")
        return

    print(
        f"{BOLD}Summary:{RESET} {total_changes} change(s) found — "
        f"{RED}{len(only_in_file1)} removed{RESET}, "
        f"{GREEN}{len(only_in_file2)} added{RESET}, "
        f"{YELLOW}{len(mismatches)} modified{RESET}\n"
    )

    # Removed (only in file1)
    if only_in_file1:
        print(f"{BOLD}{RED}Removed (only in file1):{RESET}")
        print(DIVIDER)
        for pp_id in only_in_file1:
            row = map1[pp_id]
            premises_name = row[premises_index]
            print(f"{RED}PPId {pp_id} — {premises_name}{RESET}")
            print(format_row(header1, row))
            print()

    # Added (only in file2)
    if only_in_file2:
        print(f"{BOLD}{GREEN}Added (only in file2):{RESET}")
        print(DIVIDER)
        for pp_id in only_in_file2:
            row = map2[pp_id]
            premises_name = row[premises_index]
            print(f"{GREEN}PPId {pp_id} — {premises_name}{RESET}")
            print(format_row(header2, row))
            print()

    # Modified
    if mismatches:
        print(f"{BOLD}{YELLOW}Modified:{RESET}")
        print(DIVIDER)
        for pp_id, diff_cells in mismatches:
            premises_name = map1[pp_id][premises_index]
            print(f"{YELLOW}PPId {pp_id} — {premises_name}{RESET}")
            for col, old_val, new_val in diff_cells:
                print(f"  {DIM}{col}:{RESET}")
                print(f"    {RED}- {old_val}{RESET}")
                print(f"    {GREEN}+ {new_val}{RESET}")
            print()


# File paths
file1_path = "data/20260301_160155 polling places.csv"
file2_path = "data/test_modified.csv"

generate_report(file1_path, file2_path, sort_column="id", premises_column="premises")
