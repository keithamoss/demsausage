NOMS_JSON_FIELD_SCHEMA = {
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
    "required": ["bbq", "cake", "nothing", "run_out"]
}
