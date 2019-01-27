from enum import Enum


class EnumBase(Enum):
    @classmethod
    def has_value(cls, value):
        return any(value == item.value for item in cls)


class ProfileSettings(str, EnumBase):
    pass


class StallStatus(str, EnumBase):
    PENDING = "Pending"
    APPROVED = "Approved"
    DECLINED = "Declined"

    def __str__(self):
        return self.value
