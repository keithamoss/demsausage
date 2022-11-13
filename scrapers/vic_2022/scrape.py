import pandas as pd


def get_disabled_access_string(rating):
    if rating == "LNWA":
        return "Limited to no wheelchair access"
    elif rating == "AWA":
        return "Assisted wheelchair access"
    elif rating == "IWA":
        return "Independent wheelchair access"
    elif str(rating) == "nan":
        return "Unknown"
    raise Exception(f"Unknown 'rating' of {rating} found.")


def has_entrance_desc(polling_place):
    address_line_2 = str(polling_place['Address Line 2']).strip()
    return (address_line_2 != "nan" and address_line_2 != "" and address_line_2[0] != "(" and address_line_2[-1] != ")" and "access via" not in address_line_2) == False and address_line_2 != "nan"


def format_address(polling_place):
    address_parts = [polling_place['Address Line 1']]

    # Most AL2's are (access via ...), but about half a dozen are actually address descriptors
    if has_entrance_desc(polling_place) == False and str(polling_place['Address Line 2']) != "nan":
        address_parts.append(str(polling_place['Address Line 2']).strip())

    address_parts.append(polling_place['Suburb'] + " " + str(polling_place['Post \nCode']))

    return ", ".join(address_parts).replace(u"\u2013", "-")


def get_entrance_desc(polling_place):
    if has_entrance_desc(polling_place) == True:
        al2 = polling_place["Address Line 2"].replace("(", "").replace(")", "")
        return al2.replace(al2[0], al2[0].upper(), 1)  # Uppercase the first letter of the first word
    return ""


def clean_location_name(polling_place):
    # Remove the 'Host Joint Voting Centre' and 'Joint Voting Centre' flags to avoid deduping issues
    return polling_place["Location Name"].replace(" HJVC", "").replace(" JVC", "")


date_prefix = "20221113"
df = pd.read_excel(f"data/{date_prefix} - VC EVC and MEVC lists Website.xlsx", sheet_name="Voting centres", skiprows=3)

last_district = None
for index, row in df.iterrows():
    district_is_null = pd.isnull(df["District"].iloc[index]) == True
    if district_is_null == False and row["District"] != last_district:
        last_district = row["District"]
    if district_is_null == True:
        df.loc[index, "District"] = last_district

polling_places = []
for index, polling_place in df.iterrows():
    polling_places.append({
        "name": clean_location_name(polling_place),
        "premises": polling_place["Venue Name"],
        "divisions": polling_place["District"],
        "address": format_address(polling_place),
        "entrance_desc": get_entrance_desc(polling_place),
        "lat": polling_place["Address \nY Coordinate"],
        "lon": polling_place["Address \nX Coordinate"],
        "state": "VIC",
        "wheelchair_access": get_disabled_access_string(polling_place["Accessibility \nRating"])
    })


df = pd.DataFrame(polling_places)
df.to_csv(f"data/{date_prefix}_vic_2022.csv", index=False)
