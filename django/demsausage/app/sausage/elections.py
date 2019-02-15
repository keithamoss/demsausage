import csv
from io import StringIO
import logging
import re
import chardet

from django.core.cache import cache
from django.contrib.gis.geos import Point

from demsausage.app.models import PollingPlaces, Stalls
from demsausage.app.serializers import PollingPlacesGeoJSONSerializer, PollingPlacesManagementSerializer
from demsausage.app.exceptions import BadRequest
from demsausage.app.enums import StallStatus, PollingPlaceStatus
from demsausage.app.sausage.polling_places import find_by_distance, is_noms_item_true


def regenerate_election_geojson(election_id):
    polling_places = PollingPlacesGeoJSONSerializer(PollingPlaces.objects.select_related("noms").filter(election_id=election_id, status=PollingPlaceStatus.ACTIVE), many=True)
    cache.set(get_polling_place_geojson_cache_key(election_id), polling_places.data)


def clear_elections_cache():
    cache.delete_many([get_elections_cache_key(True), get_elections_cache_key(False)])


def get_polling_place_geojson_cache_key(electionId):
    return "election_{}_polling_places_geojson".format(electionId)


def get_elections_cache_key(includeHidden):
    return "elections_{}".format("with_hidden" if includeHidden is True else "without_hidden")


class PollingPlacesIngestBase():
    """
    IMPORTANT: This class assumes it is run inside an @transaction.atomic block.
    """

    def make_logger(self):
        logger = logging.getLogger(type(self).__name__)
        logger.setLevel(logging.DEBUG)
        fmt = logging.Formatter("[%(levelname)s] %(message)s")

        self.log_msgs = StringIO()
        handler = logging.StreamHandler(self.log_msgs)
        handler.setFormatter(fmt)
        logger.addHandler(handler)

        return logger

    def has_errors_messages(self):
        return "[ERROR] " in self.log_msgs.getvalue()

    def collects_logs(self):
        log_msgs = self.log_msgs.getvalue().split("\n")
        return {
            "errors": [msg.replace("[ERROR] ", "") for msg in log_msgs if msg.startswith("[ERROR] ")],
            "warnings": [msg.replace("[WARNING] ", "") for msg in log_msgs if msg.startswith("[WARNING] ")],
            "info": [msg.replace("[INFO] ", "") for msg in log_msgs if msg.startswith("[INFO] ")],
        }

    def raise_exception_if_errors(self):
        if self.has_errors_messages() is True:
            raise BadRequest({"message": "Oh dear, looks like we hit a snag (get it - snag?!)", "logs": self.collects_logs()})

    def is_dry_run(self):
        return self.dry_run

    def has_pending_stalls(self):
        return Stalls.objects.filter(election_id=self.election.id, status=StallStatus.PENDING).count() > 0

    def safe_find_by_distance(self, label, *args, **kwargs):
        results = find_by_distance(*args, **kwargs)
        count = results.count()
        if count >= 2:
            self.logger.error("Find by distance [{}]: Found {} existing polling places spatially near each other. Polling places: {}".format(label, count, "; ".join(["{}/{}/{}".format(pp.name, pp.premises, pp.address) for pp in results])))

        return results

    def invoke_and_bail_if_errors(self, method_name):
        getattr(self, method_name)()
        self.raise_exception_if_errors()


class LoadPollingPlaces(PollingPlacesIngestBase):
    """
    IMPORTANT: This class assumes it is run inside an @transaction.atomic block.
    """

    def __init__(self, election, file, dry_run, config):
        def check_config_is_valid(config):
            if config is not None:
                allowed_fields = ["address_fields", "address_format", "division_fields"]
                for field in config.keys():
                    if field not in allowed_fields:
                        self.logger.error("Config: Invalid field '{}' in config".format(field))

                if "address_fields" in config and "address_format" not in config:
                    self.logger.error("Config: address_format required if address_fields provided")
                if "address_fields" not in config and "address_format" in config:
                    self.logger.error("Config: address_fields required if address_format provided")

                return True

        self.election = election
        self.dry_run = dry_run
        self.logger = self.make_logger()

        self.has_config = True if config is not None and check_config_is_valid(config) else False
        self.raise_exception_if_errors()
        self.address_fields = config["address_fields"] if self.has_config is True else None
        self.address_format = config["address_format"] if self.has_config is True else None
        self.division_fields = config["division_fields"] if self.has_config is True else None

        self.file = file
        file_body = self.file.read()
        encoding = chardet.detect(file_body)["encoding"]
        self.reader = csv.DictReader(StringIO(file_body.decode(encoding)))
        self.polling_places = list(self.reader)

    def can_loading_begin(self):
        if self.has_pending_stalls() is True:
            return False
        return True

    def prepare_polling_place(self, polling_place):
        def get_or_merge_address_fields(polling_place):
            if "address" in polling_place:
                return polling_place

            if self.address_format is not None:
                address_data = {key: value.strip() for (key, value) in dict(polling_place).items() if key in self.address_fields}
                address = self.address_format.format(**address_data)

                # Handle missing address components
                address = re.sub(r"\s{2,}", " ", address)
                address = address.replace(", ,", ",").replace(" , ", ", ")
                if address.startswith(", ") is True:
                    address = address[2:]

                polling_place["address"] = address

                # Trim now merged polling place address component fields
                for field in self.address_fields:
                    del polling_place[field]

                return polling_place

            self.logger.error("Address merging: No address or address fields found for polling place '{}'".format(polling_place["name"]))

        def get_or_merge_divisions_fields(polling_place):
            if "divisions" in polling_place:
                polling_place["divisions"] = [d.strip() for d in polling_place["divisions"].split(",")]
                return polling_place

            if self.division_fields is not None:
                polling_place["divisions"] = [value.strip() for (key, value) in dict(polling_place).items() if key in self.division_fields and value.strip() != ""]

                # Trim the now merged divisions fields
                for field in self.division_fields:
                    del polling_place[field]

                return polling_place

            return polling_place

        polling_place["geom"] = Point(float(polling_place["lon"]), float(polling_place["lat"]), srid=4326)
        del polling_place["lon"]
        del polling_place["lat"]

        if "facility_type" not in polling_place or polling_place["facility_type"] == "":
            polling_place["facility_type"] = None
        polling_place["status"] = PollingPlaceStatus.DRAFT
        polling_place["election"] = self.election.id
        polling_place = get_or_merge_address_fields(polling_place)
        polling_place = get_or_merge_divisions_fields(polling_place)

        return polling_place

    def check_file_validity(self):
        def check_file_header_validity(reader):
            allowable_field_names = [f.name for f in PollingPlaces._meta.get_fields()] + ["lat", "lon"]
            if self.address_fields is not None:
                allowable_field_names += self.address_fields
            if self.division_fields is not None:
                allowable_field_names += self.division_fields

            required_model_field_names = [f.name for f in PollingPlaces._meta.get_fields() if hasattr(f, "blank") and f.blank is False and hasattr(f, "null") and f.null is False and f.name not in ("geom", "election", "status")] + ["lat", "lon"]

            # We're doing on-the-fly address merging in prepare_polling_place(). This will attach an address field for us.
            if self.address_fields is not None:
                del required_model_field_names[required_model_field_names.index("address")]

            # Check for allowable field names (optional extras)
            for field in reader.fieldnames:
                if field not in allowable_field_names:
                    self.logger.error("Unknown field in header: {}".format(field))

            # Check for mandatory field names
            for field in required_model_field_names:
                if field not in reader.fieldnames:
                    self.logger.error("Required field missing in header: {}".format(field))

            # Check for address fields (if necessary)
            if self.address_fields is not None:
                for field in self.address_fields:
                    if field not in reader.fieldnames:
                        self.logger.error("Required address field missing in header: {}".format(field))

            # Check for division fields (if necessary)
            if self.division_fields is not None:
                for field in self.division_fields:
                    if field not in reader.fieldnames:
                        self.logger.error("Required division field missing in header: {}".format(field))

        def is_polling_place_valid(polling_place):
            serialiser = PollingPlacesManagementSerializer(data=self.prepare_polling_place(polling_place))
            if serialiser.is_valid() is True:
                return True
            return serialiser.errors

        # Ensure we have all of the required fields and no unknown/excess fields
        check_file_header_validity(self.reader)

        self.raise_exception_if_errors()

        # Ensure each polling place is valid
        for polling_place in self.polling_places:
            validation = is_polling_place_valid(polling_place)
            if validation is not True:
                self.logger.error("Polling place invalid: {}".format(validation))

    def dedupe_polling_places(self):
        def get_key(polling_place):
            return "{},{}".format(polling_place["geom"].x, polling_place["geom"].y)

        # Group by lon,lat to detect and merge multi-division polling places
        polling_places_group_by = {}

        for polling_place in self.polling_places:
            key = get_key(polling_place)
            if key not in polling_places_group_by:
                polling_places_group_by[key] = []
            polling_places_group_by[key].append(polling_place)

        indexes_to_remove = []
        for polling_places in [i for i in polling_places_group_by.values() if len(i) >= 2]:
            # Try to ensure that the group polling places are actually the same place
            unique_keys = list(set(["{}/{}".format(pp["name"], pp["premises"]) for pp in polling_places]))
            if len(unique_keys) > 1:
                self.logger.error("Deduping: Found multiple unique polling places sharing the same location: {}".format(", ".join(unique_keys)))

            key = get_key(polling_places[0])
            indexes = [i for i, pp in enumerate(self.polling_places) if get_key(pp) == key]

            # Merge divisions for duplicate polling places
            # Divisions are optional - not all states use them
            if "divisions" in polling_places[0]:
                divisions = []
                for pp in polling_places:
                    divisions += pp["divisions"]
                divisions = list(set(divisions))

                self.polling_places[indexes[0]]["divisions"] = divisions

                self.logger.info("Deduping: Merged divisions for {} polling places with the same location ({}). Divisions: {}. Polling Places: {}".format(len(indexes), key, divisions, "; ".join(["{}/{}/{}".format(pp["name"], pp["premises"], pp["address"]) for pp in polling_places])))
            else:
                self.logger.info("Deduping: Discarded {} duplicate polling places with the same location ({}). No divisions were present. Polling Places: {}".format(len(indexes) - 1, key, "; ".join(["{}/{}/{}".format(pp["name"], pp["premises"], pp["address"]) for pp in polling_places])))

            # We can safely remove all bar the first polling place
            indexes_to_remove += indexes[1:]

        # Remove deduplicate polling places
        self.polling_places = [polling_place for idx, polling_place in enumerate(self.polling_places) if idx not in indexes_to_remove]

        # To be extra sure - group by name and bail out if there are dupes
        polling_places_group_by = {}

        for polling_place in self.polling_places:
            key = polling_place["name"]
            if key not in polling_places_group_by:
                polling_places_group_by[key] = []
            polling_places_group_by[key].append(polling_place)

        for polling_places in [i for i in polling_places_group_by.values() if len(i) >= 2]:
            self.logger.error("Deduping: Found {} polling places sharing the same name ({})".format(len(polling_places), polling_places[0]["name"]))

    def write_draft_polling_places(self):
        for polling_place in self.polling_places:
            serialiser = PollingPlacesManagementSerializer(data=polling_place)
            if serialiser.is_valid() is True:
                serialiser.save()
            else:
                self.logger.error("Polling place invalid: {}".format(serialiser.errors))

    def migrate_noms(self):
        queryset = PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.ACTIVE, noms__isnull=False)
        for polling_place in queryset:
            matching_polling_places = self.safe_find_by_distance("Noms Migration", polling_place.geom, 0.2, limit=None, qs=PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.DRAFT))

            if len(matching_polling_places) != 1:
                self.logger.error("Noms Migration: {} matching polling places found in new data: '{}' ({})".format(len(matching_polling_places), polling_place.name, polling_place.address))

            else:
                # Repoint polling place noms table
                noms_id = polling_place.noms

                polling_place.noms = None
                polling_place.save()

                matching_polling_places[0].noms = noms_id
                matching_polling_places[0].save()

                # Repoint stalls table
                stalls_updated = Stalls.objects.filter(election_id=self.election.id, polling_place=polling_place.id).update(polling_place=matching_polling_places[0].id)
                if stalls_updated > 0:
                    self.logger.info("Noms Migration: {} stalls updated for polling place '{}' ({})".format(stalls_updated, matching_polling_places[0].name, matching_polling_places[0].address))

                # If this is our first load of polling place info, log some INFO-level
                # messages to compare the user-entered location info with the official
                # location info. This is a poke for us to pick up any discrepancies.
                if self.election.polling_places_loaded is False:
                    self.logger.warning("Noms Migration: User-added polling place '{}' ({}) has been merged successfully into the official polling place '{}' ({}). Is this correct?".format(polling_place.name, polling_place.address, matching_polling_places[0].name, matching_polling_places[0].address))

        self.logger.info("Noms Migration: Migrated {} polling places".format(queryset.count()))

        queryset = PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.ACTIVE, noms__isnull=False)
        count = queryset.count()
        if count > 0:
            self.logger.error("Found {} old polling places with attached noms. This shouldn't happen.".format(count))
            for polling_place in queryset:
                self.logger.error("Polling place with noms still attached: {}".format(polling_place.id))

        queryset = Stalls.objects.filter(election=self.election, polling_place__status=PollingPlaceStatus.ACTIVE)
        count = queryset.count()
        if count > 0:
            self.logger.error("Found {} stalls with old polling places attached. This shouldn't happen.".format(count))
            for stall in queryset:
                self.logger.error("Stall: {}; Polling Place: {}".format(stall.id, stall.polling_place.id))

    def detect_facility_type(self):
        update_count = 0

        queryset = PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.DRAFT, facility_type__isnull=True)
        for polling_place in queryset:
            most_recent_facility_type = find_by_distance(polling_place.geom, 0.2, limit=None, qs=PollingPlaces.objects.only("facility_type").filter(status=PollingPlaceStatus.ACTIVE, facility_type__isnull=False)).order_by("election_id").last()

            if most_recent_facility_type is not None:
                polling_place.facility_type = most_recent_facility_type.facility_type
                polling_place.save()

                update_count += 1

        self.logger.info("Facility types detected from historical data: {}".format(update_count))

    def calculate_chance_of_sausage(self):
        def calculate_score(polling_place):
            if polling_place.noms is not None and polling_place.noms.noms is not None:
                if is_noms_item_true(polling_place.noms.noms, "bbq") or is_noms_item_true(polling_place.noms.noms, "cake"):
                    return 1
            return 0
        update_count = 0

        queryset = PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.DRAFT, noms__isnull=False)
        for polling_place in queryset:
            matching_polling_places = find_by_distance(polling_place.geom, 0.2, limit=None, qs=PollingPlaces.objects.filter(status=PollingPlaceStatus.ACTIVE)).order_by("election_id")

            if len(matching_polling_places) > 0:
                scores = [calculate_score(pp) for pp in matching_polling_places]

                polling_place.noms.chance_of_sausage = sum(scores) / len(matching_polling_places)
                polling_place.save()

                update_count += 1

        self.logger.info("Chance of Sausage calculations completed: Considered = {}; Updated = {}".format(queryset.count(), update_count))

    def cleanup(self):
        # Migrate to new polling places
        old_archived_polling_places_queryset = PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.ARCHIVED)
        old_polling_places_queryset = PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.ACTIVE)
        new_polling_places_queryset = PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.DRAFT)

        self.logger.info("Loaded {} new polling places (previous set = {}, previous archived = {})".format(new_polling_places_queryset.count(), old_polling_places_queryset.count(), old_archived_polling_places_queryset.count()))

        old_archived_polling_places_queryset.delete()
        old_polling_places_queryset.update(status=PollingPlaceStatus.ARCHIVED)
        new_polling_places_queryset.update(status=PollingPlaceStatus.ACTIVE)

        # Update GeoJSON
        regenerate_election_geojson(self.election.id)

        # Update election if necessary
        if self.election.polling_places_loaded is False:
            self.election.polling_places_loaded = True
            self.election.polling_places_loaded.save()

    def run(self):
        if self.can_loading_begin() is False:
            self.logger.error("Loading can't begin. There's probably pending stalls.")
        else:
            self.invoke_and_bail_if_errors("check_file_validity")
            self.invoke_and_bail_if_errors("dedupe_polling_places")
            self.invoke_and_bail_if_errors("write_draft_polling_places")
            self.invoke_and_bail_if_errors("migrate_noms")
            self.invoke_and_bail_if_errors("detect_facility_type")
            self.invoke_and_bail_if_errors("calculate_chance_of_sausage")
            self.invoke_and_bail_if_errors("cleanup")


class RollbackPollingPlaces(PollingPlacesIngestBase):
    """
    IMPORTANT: This class assumes it is run inside an @transaction.atomic block.
    """

    def __init__(self, election, dry_run):
        self.election = election
        self.dry_run = dry_run

    def has_draft_polling_places(self):
        return PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.DRAFT).count() > 0

    def all_polling_places_are_unofficial(self):
        return Stalls.objects.filter(election_id=self.election.id, location_info__isnull=True).count() > 0

    def can_loading_begin(self):
        if self.has_pending_stalls() is True:
            return False
        if self.has_draft_polling_places() is True:
            return False
        return True

    def rollback_noms(self):
        queryset = PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.ACTIVE, noms__isnull=False)
        for polling_place in queryset:
            matching_polling_places = self.safe_find_by_distance("Noms Rollback", polling_place.geom, 0.2, limit=None, qs=PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.ARCHIVED))

            if len(matching_polling_places) != 1:
                self.logger.error("Noms Rollback: {} matching polling places found in new data: '{}' ({})".format(len(matching_polling_places), polling_place.name, polling_place.address))

            else:
                # Repoint polling place noms table
                noms_id = polling_place.noms

                polling_place.noms = None
                polling_place.save()

                matching_polling_places[0].noms = noms_id
                matching_polling_places[0].save()

                # Repoint stalls table
                stalls_updated = Stalls.objects.filter(election_id=self.election.id, polling_place=polling_place.id).update(polling_place=matching_polling_places[0].id)
                if stalls_updated > 0:
                    self.logger.info("Noms Rollback: {} stalls updated for polling place '{}' ({})".format(stalls_updated, matching_polling_places[0].name, matching_polling_places[0].address))

        self.logger.info("Noms Rollback: Migrated {} polling places and stalls".format(queryset.count()))

        queryset = PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.ACTIVE, noms__isnull=False)
        count = queryset.count()
        if count > 0:
            self.logger.error("Found {} old polling places with attached noms. This shouldn't happen.".format(count))
            for polling_place in queryset:
                self.logger.error("Polling place with noms still attached: {}".format(polling_place.id))

        queryset = Stalls.objects.filter(election=self.election, polling_place__status=PollingPlaceStatus.ACTIVE)
        count = queryset.count()
        if count > 0:
            self.logger.error("Found {} stalls with old polling places attached. This shouldn't happen.".format(count))
            for stall in queryset:
                self.logger.error("Stall: {}; Polling Place: {}".format(stall.id, stall.polling_place.id))

    def cleanup(self):
        # Rollback to archived polling places
        active_polling_places_queryset = PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.ACTIVE)
        archived_polling_places_queryset = PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.ARCHIVED)

        self.logger.info("Rolledback to {} archived polling places (previous active set = {})".format(archived_polling_places_queryset.count(), active_polling_places_queryset.count()))

        active_polling_places_queryset.delete()
        archived_polling_places_queryset.update(status=PollingPlaceStatus.ACTIVE)

        # Update GeoJSON
        regenerate_election_geojson(self.election.id)

        # Update election if necessary
        if self.all_polling_places_are_unofficial() is True:
            self.election.polling_places_loaded = False
            self.election.polling_places_loaded.save()

    def run(self):
        if self.can_loading_begin() is False:
            self.logger.error("Loading can't begin. There's probably pending stalls or draft polling places left over.")
        else:
            self.invoke_and_bail_if_errors("rollback_noms")
            self.invoke_and_bail_if_errors("cleanup")
