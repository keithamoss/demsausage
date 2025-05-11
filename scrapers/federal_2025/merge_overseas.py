import copy
import csv

POLLING_PLACE_FILENAME = "prdelms.gaz.statics.250501.09.00.01"
OVERSEAS_POLLING_PLACE_FILENAME = (
    "../federal_overseas_polling_places/overseas_polling_places_2025"
)
MERGED_POLLING_PLACE_FILENAME = f"{POLLING_PLACE_FILENAME}_merged_overseas"

# open both files
with open(
    f"data/{POLLING_PLACE_FILENAME}.csv", encoding="utf-8"
) as polling_places_australia, open(
    f"{OVERSEAS_POLLING_PLACE_FILENAME}.csv", encoding="utf-8"
) as polling_places_overseas:
    csv_polling_places_australia = csv.DictReader(polling_places_australia)
    list_polling_places_australia = list(csv_polling_places_australia)
    print(len(list_polling_places_australia))

    csv_polling_places_overseas = csv.DictReader(polling_places_overseas)
    list_polling_places_overseas = list(csv_polling_places_overseas)
    print(len(list_polling_places_overseas))

    polling_places_all = list_polling_places_australia + list_polling_places_overseas
    print(len(polling_places_all))

    print(csv_polling_places_overseas.fieldnames)

    check_file_similarity = copy.deepcopy(csv_polling_places_overseas.fieldnames)
    check_file_similarity.remove("booth_info")
    if csv_polling_places_australia.fieldnames != check_file_similarity:
        raise Exception(
            "The two polling place files should be identical except for the booth_info field"
        )

    # Hacky, use for debugging data file formatting issues (headers being different)
    # print("####")
    # headers = []
    # for pp in polling_places_all:
    #     h = pp.keys()
    #     if h not in headers:
    #         headers.append(h)

    # for h in headers:
    #     print(h)
    #     print("")

    with open(f"data/{MERGED_POLLING_PLACE_FILENAME}.csv", "w") as output_file:
        dict_writer = csv.DictWriter(
            output_file, fieldnames=csv_polling_places_overseas.fieldnames
        )
        dict_writer.writeheader()
        dict_writer.writerows(polling_places_all)
