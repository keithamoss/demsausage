import json


def read_feature_by_id(feature_id, processed_file, index_file):
    # Load the index file
    with open(index_file, "r", encoding="utf-8") as f:
        index = json.load(f)

    # Find byte range for the given feature ID
    if feature_id not in index:
        print(f"Feature ID '{feature_id}' not found in index.")
        return None

    start_byte, end_byte = index[feature_id]  # Get byte range

    # Read only the relevant portion of the processed JSON file
    with open(processed_file, "r", encoding="utf-8") as f:
        f.seek(start_byte)  # Move to the start position
        feature_data = f.read(end_byte - start_byte)  # Read exact feature

    # Convert to JSON object
    try:
        feature_json = json.loads(feature_data)
        return feature_json
    except json.JSONDecodeError:
        print(f"Failed to parse feature '{feature_id}'.")
        return None


# Example usage
feature = read_feature_by_id(
    "487807", "sausage-full-processed.json", "sausage-full-index.json"
)
if feature:
    print(json.dumps(feature, indent=2))
