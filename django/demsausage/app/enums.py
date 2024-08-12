from enum import Enum


class EnumBase(Enum):
    @classmethod
    def has_value(cls, value):
        return any(value == item.value for item in cls)


class ProfileSettings(str, EnumBase):
    pass


class PollingPlaceState(str, EnumBase):
    NSW = "NSW"
    VIC = "VIC"
    QLD = "QLD"
    WA = "WA"
    SA = "SA"
    TAS = "TAS"
    ACT = "ACT"
    NT = "NT"
    Overseas = "Overseas"

    def __str__(self):
        return self.value


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


class PollingPlaceJurisdiction(str, EnumBase):
    WA = "wa"
    SA = "sa"
    NSW = "nsw"
    ACT = "act"
    VIC = "vic"
    NT = "nt"
    TAS = "tas"
    QLD = "qld"
    AUS = "aus"

    def __str__(self):
        return self.value


class StallSubmitterType(str, EnumBase):
    OWNER = "owner"
    TIPOFF = "tipoff"

    def __str__(self):
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
