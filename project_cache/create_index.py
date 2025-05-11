import json


def create_index(processed_file, index_file):
    index = {}
    offset = 0  # Track byte offset in the file

    with open(processed_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.rstrip(
                "\n"
            )  # Remove trailing newline for accurate byte counting
            feature = json.loads(line)  # Load feature as JSON
            feature_id = feature.get("id") or feature["properties"].get("id")

            if feature_id:
                feature_bytes = len(line.encode("utf-8"))  # Get accurate byte length
                index[feature_id] = (offset, offset + feature_bytes)

            offset += feature_bytes + 1  # +1 to account for the newline character

    # Write index file
    with open(index_file, "w", encoding="utf-8") as f:
        json.dump(index, f, indent=2)

    print(f"Index file created: {index_file}")


# Example usage
create_index("sausage-full-processed.json", "sausage-full-index.json")
