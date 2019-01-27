from jsonschema import validate
from django.core.validators import BaseValidator


class JSONSchemaValidator(BaseValidator):
    def compare(self, a, b):
        try:
            validate(a, b)
        except:
            raise ValidationError(_('%(value)s is not schema'), params={'value': a}, )
