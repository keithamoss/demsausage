from enum import Enum


class EnumBase(Enum):
    @classmethod
    def has_value(cls, value):
        return any(value == item.value for item in cls)


class ProfileSettings(str, EnumBase):
    pass


class PollingPlaceStatus(str, EnumBase):
    ARCHIVED = "Archived"
    ACTIVE = "Active"
    DRAFT = "Draft"

    def __str__(self):
        return self.value


class PollingPlaceWheelchairAccess(str, EnumBase):
    NONE = "None"
    ASSISTED = "Assisted"
    FULL = "Full"
    UNKNOWN = "Unknown"

    def __str__(self):
        return self.value

class PollingPlaceChanceOfSausage(int, EnumBase):
    NO_IDEA = 0
    UNLIKELY = 1
    MIXED = 2
    FAIR = 3
    STRONG = 4

    def __int__(self):
        return self.value


class StallStatus(str, EnumBase):
    PENDING = "Pending"
    APPROVED = "Approved"
    DECLINED = "Declined"

    def __str__(self):
        return self.value


class TaskStatus(str, EnumBase):
    SUCCESS = "Success"
    FAILED = "Failed"

    def __str__(self):
        return self.value
