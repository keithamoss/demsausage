from django.core.exceptions import ValidationError
from django.core.validators import BaseValidator
from jsonschema import validate


class JSONSchemaValidator(BaseValidator):
    def compare(self, a, b):
        try:
            validate(a, b)
        except Exception:
            raise ValidationError(
                "%(value)s is not schema",
                params={"value": a},
            )
