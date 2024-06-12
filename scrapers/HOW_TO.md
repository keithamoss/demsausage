# How do I load polling place data into Democracy Sausage?

For the sake of this guide, let's assume you've already massaged polling places into a CSV file, or received one from an electoral commission. If you don't have a CSV yet, see `README.md` in the same folder as this file for guidance on how we generally approach scraping from other sources of polling places data (e.g. the interactive maps or APIs that electoral commission sometimes provide).

We use a JSON structured configuration file to tell the polling place loader how to interpret and manipulate the polling place data.

There's a few steps we need to take to get our CSV file ready for loading into Democracy Sausage:

1. **Make the fields match our standard structure:** Ensure that field names used in the CSV file match the ones expected by our polling place loader. (Rename, exclude, and add fields)
2. **Geocoding polling places from addresses to coordinates:** Not always necessary, most of the time the electoral commissions provide coordinates.
3. **Test loading:** Head over to the [elections administration page](https://admin.democracysausage.org/elections), hit the upload button next to the election, and use the `dry run` feature to test your config file (this ensures that polling place data isn't committed to the database, so it's a good way to test your config file).

# Examples of polling place JSON config

See `federal_2019/config.json` for the biggest and most comprehensive one we've built. It shows off most of the capabilities of the loader.

See `sa_2022/config.json` for a more modest example (and much of the basis for this guide).

# Required and optional fields

## Required fields

There are certain required fields that Democracy Sausage needs to be able to map the polling places and run an election.

- `ec_id`: Can be blank, we'll create one automatically
- `name`: The name of the polling place (e.g. Albany)
- `divisions`: The name of the electoral division(s) that can vote at this polling place (may be blank, not all states have divisions)
- `premises`: The name of the premises / building that the polling place is at (e.g. Albany Primary School)
- `address`: The address of the polling place (e.g. Suffolk Street, MOUNT CLARENCE WA 6330)
- `lat` and `lon`: The latitude and longitude of the polling place
- `state`: The abbreviation of the state (e.g. WA)
- `wheelchair_access`: A description of the level (if any) of wheelchair access available at the polling place (e.g. 'Fully wheelchair accessible')
- `wheelchair_access_description`: A description of the exact nature of the wheelchair access available at the polling place, including important caveats (optional)
- `extras`: A JSON data structure we use to store additional information not immediately required for mapping the polling places

## Optional fields

- `entrance_desc`: A description of how to get to the polling place (e.g. 'Entrance off of Smith Street')
- `opening_hours`: A description of when the polling place will be open
- `booth_info`: A field for any other useful information about the booth that map have been provided by the electoral commission

# Make the fields match

## Renaming fields

First, we need to map the fields in the spreadsheet to the field names that our polling place loader expects.

To rename fields, we use this pattern:

```json
"rename_columns": {
    "di_name": "divisions",
    "pplace": "name"
}
```

## Excluding fields

Sometimes the electoral commission include fields that are blank, or include redundant information (e.g. a suburb field while also including the suburb in the address).

In these cases, we can just explicitly drop/exclude these fields:

```json
"exclude_columns": [
    "suburb"
]
```

Note: We have a way to retain fields that include data we don't immediately need for mapping, but may be useful for analysis / Sausagelytics later. See the section later on about the 'extras' field.

## Adding fields

Sometimes we need to add fields to the data.

For example, state electoral commission rarely provide a field denoting the state (fair enough). They also don't always provide an `ec_id` field with a uuid for each polling place, so we often need to add a blank field for that (so the loader can populate it with your own id).

To add fields, we can use this pattern:

```json
"add_columns": {
    "ec_id": "",
    "state": "SA"
}
```

# The `extras` field: What to do with the fields we don't use?

Sometimes the electoral commissions include fields we don't need to map the polling places and run the site, but that would be useful later for analysis / Sausagelytics.

For example, the AEC including population counts for each electoral division.

To support this, we have the 'extras' field. This is stored as a JSON field in the database, so it's easy to query.

The extras field is configured with a list of the field names that we want to include in it. Such as:

```json
"extras": {
    "fields": ["CCD", "OrdVoteEst", "DecVoteEst", "NoOrdIssuingOff", "NoOfDecIssuingOff"]
}
```

If a polling place file has no extras to include, just specify a blank object:

```json
"extras": {
    "fields": []
}
```

# To geocode or not to geocode?

If the file you've received contains latitude and longitude coordinates in separate fields, you're all good. We just need to turn off geocoding:

```json
"geocoding": {
    "enabled": false
}
```

If it doesn't, see the spec at the bottom for how to turn on geocoding of addresses and the options available there.

# Mapping coded values in fields

Sometimes the electoral commissions provide fields with coded values.

For example, a wheelchair accessibility fields with the values `F`, `A`, `N` denoting the levels of access available.

We can use the handy `fix_data_issues` configuration property to map from coded values to their textual descriptions.

```json
"fix_data_issues": [
    {
        "field": "wheelchair_access",
        "value": "F",
        "overwrite": [
            {
                "field": "wheelchair_access",
                "value": "Fully wheelchair accessible"
            }
        ]
    },
    {
        "field": "wheelchair_access",
        "value": "A",
        "overwrite": [
            {
                "field": "wheelchair_access",
                "value": "Assisted wheelchair access"
            }
        ]
    },
    {
        "field": "wheelchair_access",
        "value": "N",
        "overwrite": [
            {
                "field": "wheelchair_access",
                "value": "No wheelchair access"
            }
        ]
    }
]
```

P.S. There's also usually not a data dictionary provided, so interpreting the values requires a bit of thinking and checking how the commission describes the polling places on their website.
