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


class MetaPollingPlaceJurisdiction(str, EnumBase):
    NSW = "NSW"
    VIC = "VIC"
    QLD = "QLD"
    WA = "WA"
    SA = "SA"
    TAS = "TAS"
    ACT = "ACT"
    NT = "NT"

    def __str__(self):
        return self.value


class MetaPollingPlaceStatus(str, EnumBase):
    ACTIVE = "Active"
    RETIRED = "Retired"
    DRAFT = "Draft"

    def __str__(self):
        return self.value


class MetaPollingPlaceTaskStatus(str, EnumBase):
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"

    def __str__(self):
        return self.value


class MetaPollingPlaceTaskCategory(str, EnumBase):
    REVIEW = "Review"
    QA = "QA"
    ENRICHMENT = "Enrichment"
    CROWDSOURCING = "Crowdsourcing"

    def __str__(self):
        return self.value


class MetaPollingPlaceTaskType(str, EnumBase):
    REVIEW_DRAFT = "Review Draft"
    # REVIEW_ALL = "Review All Information"

    # @TODO Notes:
    # Some Polling Places, and as a result Meta Polling Places, have double spaces (and maybe other whitespace) in their names

    # QA_ALL = "All"
    # QA_SINGLETONS = "Singletons"
    # QA_USED_MORE_THAN_ONCE_IN_AN_ELECTION = "Used More Than Once in an Election"
    # QA_TOO_MANY_PPs = "Too Many Polling Places"
    # QA_HAS_CLOSE_NEIGHBOURS = "Has Close Neighbours"
    # QA_GEOMETRY_EXCEPTIONS = "Geometry Exceptions"
    # QA_GEOCODING_EXCEPTIONS = "Geocoding Exceptions"
    # QA_NAMES_MISMATCH = "Names Mismatch"
    # QA_PREMISES_MISMATCH = "Premises Mismatch"
    # ...and other QA tasks could exist, such as QAing the data we brought in in the initial MPP load e.g. all of those old facility types we had setup

    # ENRICHMENT_STALL_INFORMATION = "Enrich from Stall Information"
    # ENRICHMENT_ALL_MISSING_INFORMATION = "Enrich All Missing Information"
    # ENRICHMENT_FACILITY_TYPE = "Enrich Facility Type"
    # ENRICHMENT_WHEELCHAIR_ACCESS = "Enrich Wheelchair Access"
    # ENRICHMENT_BOUNDARY = "Enrich Boundary Information"
    # ENRICHMENT_ADDRESS = "Enrich Address Information"
    # ENRICHMENT_EMAILS = "Enrich Emails"
    # ENRICHMENT_LINKS = "Enrich Links"

    CROWDSOURCE_FROM_FACEBOOK = "Crowdsource from Facebook"

    def __str__(self):
        return self.value


class MetaPollingPlaceTaskOutcome(str, EnumBase):
    COMPLETED = "Completed"
    DEFERRED = "Deferred"
    CLOSED = "Closed"

    def __str__(self):
        return self.value


class MetaPollingPlaceContactType(str, EnumBase):
    EMAIL = "Email"

    def __str__(self):
        return self.value


class MetaPollingPlaceContactCategory(str, EnumBase):
    PRIMARY = "Primary"
    SECONDRY = "Secondary"

    def __str__(self):
        return self.value


class MetaPollingPlaceLinkType(str, EnumBase):
    OFFICIAL = "Official Website"
    FACEBOOK = "Facebook"
    OTHER = "Other"

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
    TIPOFF_RUN_OUT = "tipoff_run_out"
    TIPOFF_RED_CROSS_OF_SHAME = "tipoff_red_cross_of_shame"

    def __str__(self):
        return self.value


class StallTipOffSource(str, EnumBase):
    In_Person = "in-person"
    Online = "online"
    Newsletter = "newsletter"
    Other = "other"

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


class PollingPlaceHistoryEventType(str, EnumBase):
    ADDED_DIRECTLY = "Added Directly"
    EDITED_DIRECTLY = "Edited Directly"
    SUBMISSION_RECEIVED = "Submission Received"
    SUBMISSION_APPROVED = "Submission Approved"
    SUBMISSION_DECLINED = "Submission Declined"
    SUBMISSION_EDITED = "Submission Edited"
    UNKNOWN = "UNKNOWN_HISTORY_EVENT_TYPE"

    def __str__(self):
        return self.value
