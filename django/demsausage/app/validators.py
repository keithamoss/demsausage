from jsonschema import validate
from django.core.validators import BaseValidator
from django.core.exceptions import ValidationError


class JSONSchemaValidator(BaseValidator):
    def compare(self, a, b):
        try:
            validate(a, b)
        except Exception:
            raise ValidationError("%(value)s is not schema", params={"value": a}, )
