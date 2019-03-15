noms_schema = {
    "type": "object",
    "schema": "http://json-schema.org/draft-07/schema#",
    "properties": {
        "bbq": {
            "type": "boolean"
        },
        "cake": {
            "type": "boolean"
        },
        "bacon_and_eggs": {
            "type": "boolean"
        },
        "halal": {
            "type": "boolean"
        },
        "vego": {
            "type": "boolean"
        },
        "coffee": {
            "type": "boolean"
        },
        "nothing": {
            "type": "boolean"
        },
        "run_out": {
            "type": "boolean"
        },
        "free_text": {
            "type": "string"
        }
    },
    "additionalProperties": False
}

geojson_schema = {
    "type": "object",
    "schema": "http://json-schema.org/draft-07/schema#",
    "properties": {
        "noms": {
            "type": ["object", "null"],
            "properties": {
                "bbq": {
                    "type": "boolean"
                },
                "cake": {
                    "type": "boolean"
                },
                "nothing": {
                    "type": "boolean"
                },
                "run_out": {
                    "type": "boolean"
                },
                "other": {
                    "type": "boolean"
                },
            }
        },
        "name": {
            "type": "string"
        }
    },
    "required": ["noms", "name"],
    "additionalProperties": False
}

stall_location_info_schema = {
    "type": "object",
    "schema": "http://json-schema.org/draft-07/schema#",
    "properties": {
        "name": {
            "type": "string"
        },
        "address": {
            "type": "string"
        },
        "state": {
            "type": "string"
        },
        "geom": {
            "type": "object",
            "properties": {
                "type": {
                    "type": "string"
                },
                "coordinates": {
                    "type": "array",
                    "items": {
                        "type": "number"
                    }
                }
            }
        }
    },
    "required": ["name", "address", "state", "geom"],
    "additionalProperties": False
}
