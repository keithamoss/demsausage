import csv


# Function to load and sort CSV by a specified column
def load_and_sort_csv(file_path, sort_column):
    with open(file_path, "r") as file:
        reader = csv.reader(file)
        rows = list(reader)

        # Assume the first row is the header
        header = rows[0]
        data = rows[1:]

        # Sort data by the specified column
        column_index = header.index(sort_column)
        data.sort(key=lambda x: x[column_index])

        return header, data  # Return header and sorted data


# Function to compare rows and generate a detailed report
def generate_report(file1_path, file2_path, sort_column, premises_column):
    header1, sorted_file1 = load_and_sort_csv(file1_path, sort_column)
    header2, sorted_file2 = load_and_sort_csv(file2_path, sort_column)

    # Ensure headers match
    if header1 != header2:
        print("Headers do not match between the two files!")
        return

    # Find the indices of the sort column and PremisesName column
    pp_id_index = header1.index(sort_column)
    premises_index = header1.index(premises_column)

    # Generate the report
    report = []
    max_rows = max(len(sorted_file1), len(sorted_file2))
    for i in range(max_rows):
        if i >= len(sorted_file1):  # Extra rows in file2
            row_pp_id = sorted_file2[i][pp_id_index]
            premises_name = sorted_file2[i][premises_index]
            report.append(
                f"PPId {row_pp_id} ({premises_name}): Only in file2 -> {sorted_file2[i]}"
            )
        elif i >= len(sorted_file2):  # Extra rows in file1
            row_pp_id = sorted_file1[i][pp_id_index]
            premises_name = sorted_file1[i][premises_index]
            report.append(
                f"PPId {row_pp_id} ({premises_name}): Only in file1 -> {sorted_file1[i]}"
            )
        else:
            # Compare rows
            row1 = sorted_file1[i]
            row2 = sorted_file2[i]
            if row1 != row2:
                row_pp_id = row1[pp_id_index]
                premises_name = row1[premises_index]
                diff_cells = [
                    f"{header1[j]}: '{row1[j]}' != '{row2[j]}'"
                    for j in range(len(row1))
                    if row1[j] != row2[j]
                ]
                diff_text = "\n".join(diff_cells)  # Put each mismatch on a new line
                report.append(
                    f"PPId {row_pp_id} ({premises_name}): Mismatch ->\n{diff_text}"
                )

    # Print the report
    print("\n--- Human-Readable Report ---")
    for line in report:
        print(line)
        print()  # Add a blank line between each report entry


# File paths
file1_path = "data/prdelms.gaz.statics.250501.09.00.01.csv"
file2_path = "data/prdelms.gaz.statics.250502.09.00.01.csv"

# Generate the report, sorted by PPId and including PremisesName
generate_report(
    file1_path, file2_path, sort_column="PPId", premises_column="PremisesName"
)
