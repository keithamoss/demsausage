import json


def process_geojson(input_file, output_file):
    with open(input_file, "r", encoding="utf-8") as f:
        geojson_data = json.load(f)  # Load the full GeoJSON file

    features = geojson_data.get("features", [])

    with open(output_file, "w", encoding="utf-8") as f:
        for feature in features:
            feature_str = json.dumps(
                feature, separators=(",", ":")
            )  # Compact JSON format
            f.write(feature_str + "\n")  # Write each feature on a separate line

    print(f"Processed file created: {output_file}")


# Example usage
process_geojson("sausage-full.geojson", "sausage-full-processed.json")
