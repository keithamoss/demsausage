import csv
from io import StringIO
import logging
import re
import chardet
from datetime import datetime
from timeit import default_timer as timer
import json

from django.core.cache import cache
from django.contrib.gis.geos import Point
import googlemaps

from demsausage.app.models import PollingPlaces, Stalls
from demsausage.app.serializers import PollingPlacesGeoJSONSerializer, PollingPlacesManagementSerializer, PollingPlaceLoaderEventsSerializer
from demsausage.app.exceptions import BadRequest
from demsausage.app.enums import StallStatus, PollingPlaceStatus, PollingPlaceChanceOfSausage
from demsausage.app.sausage.polling_places import find_by_distance, is_noms_item_true
from demsausage.util import get_env


def regenerate_election_geojson(election_id):
    polling_places = PollingPlacesGeoJSONSerializer(PollingPlaces.objects.select_related("noms").filter(election_id=election_id, status=PollingPlaceStatus.ACTIVE), many=True)
    cache.set(get_polling_place_geojson_cache_key(election_id), json.dumps(polling_places.data))


def clear_elections_cache():
    cache.delete(get_elections_cache_key())


def get_polling_place_geojson_cache_key(electionId):
    return "election_{}_polling_places_geojson".format(electionId)


def get_elections_cache_key():
    return "elections_list"


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
        logs = {
            "errors": [msg.replace("[ERROR] ", "") for msg in log_msgs if msg.startswith("[ERROR] ")],
            "warnings": [msg.replace("[WARNING] ", "") for msg in log_msgs if msg.startswith("[WARNING] ")],
            "info": [msg.replace("[INFO] ", "") for msg in log_msgs if msg.startswith("[INFO] ")],
        }

        self.save_logs(logs)
        return logs

    def save_logs(self, logs):
        serializer = PollingPlaceLoaderEventsSerializer(data={
            "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
            "payload": logs
        })

        if serializer.is_valid() is True:
            serializer.save()
        else:
            raise BadRequest("Error saving logs :(")

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
        print("Calling {}".format(method_name))
        start = timer()
        getattr(self, method_name)()
        end = timer()

        self.logger.info("[Timing] {} took {}s".format(method_name, round(end - start, 2)))
        self.raise_exception_if_errors()


class LoadPollingPlaces(PollingPlacesIngestBase):
    """
    IMPORTANT: This class assumes it is run inside an @transaction.atomic block.
    """

    def __init__(self, election, file, dry_run, config):
        def _get_config_or_none(param_name, config):
            return config[param_name] if self.has_config is True and param_name in config else None

        def check_config_is_valid(config):
            if config is not None:
                allowed_fields = ["filters", "exclude_columns", "rename_columns", "extras_fields", "cleaning_regexes", "address_fields", "address_format", "division_fields", "fix_data_issues", "geocoding"]
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
        self.filters = _get_config_or_none("filters", config)
        self.exclude_columns = _get_config_or_none("exclude_columns", config)
        self.rename_columns = _get_config_or_none("rename_columns", config)
        self.extras_fields = _get_config_or_none("extras_fields", config)
        self.cleaning_regexes = _get_config_or_none("cleaning_regexes", config)
        self.address_fields = _get_config_or_none("address_fields", config)
        self.address_format = _get_config_or_none("address_format", config)
        self.division_fields = _get_config_or_none("division_fields", config)
        self.fix_data_issues = _get_config_or_none("fix_data_issues", config)
        self.geocoding = _get_config_or_none("geocoding", config)

        if self.geocoding is not None and self.geocoding["enabled"] is True:
            self.gmaps = googlemaps.Client(key=get_env("GOOGLE_GEOCODING_API_KEY"))

        self.file = file
        file_body = self.file.read()
        encoding = chardet.detect(file_body)["encoding"]
        self.reader = csv.DictReader(StringIO(file_body.decode(encoding)))
        self.polling_places = list(self.reader)

    def can_loading_begin(self):
        if self.has_pending_stalls() is True:
            return False
        return True

    def convert_to_demsausage_schema(self):
        def _filter():
            def _apply_filter(polling_place):
                for filter in self.filters:
                    if filter["type"] == "is_exactly":
                        if polling_place[filter["column"]] not in filter["matches"]:
                            return False
                return True

            if self.filters is not None:
                filtered_polling_places = []
                for polling_place in self.polling_places:
                    if _apply_filter(polling_place) is True:
                        filtered_polling_places.append(polling_place)

                self.logger.info("Filtered out {} polling places of {}. New total: {}.".format(len(self.polling_places) - len(filtered_polling_places), len(self.polling_places), len(filtered_polling_places)))
                self.polling_places = filtered_polling_places

        def _exclude_columns():
            def _remove_excluded_fields(polling_place):
                return {field_name: polling_place[field_name] for idx, field_name in enumerate(polling_place) if field_name not in self.exclude_columns}

            if self.exclude_columns is not None:
                processed_polling_places = []
                for polling_place in self.polling_places:
                    processed_polling_places.append(_remove_excluded_fields(polling_place))

                self.logger.info("Removed {} excluded columns".format(len(self.exclude_columns)))
                self.polling_places = processed_polling_places

        def _rename_columns():
            def _rename_fields(polling_place):
                for current_name, new_name in self.rename_columns.items():
                    polling_place[new_name] = polling_place[current_name]
                    del polling_place[current_name]
                return polling_place

            if self.rename_columns is not None:
                processed_polling_places = []
                for polling_place in self.polling_places:
                    processed_polling_places.append(_rename_fields(polling_place))

                self.logger.info("Renamed {} columns".format(len(self.rename_columns)))
                self.polling_places = processed_polling_places

        def _create_extras():
            def _create(polling_place):
                extras = {}
                for field_name in self.extras_fields:
                    extras[field_name] = polling_place[field_name]
                    del polling_place[field_name]

                polling_place["extras"] = extras
                return polling_place

            if self.extras_fields is not None:
                processed_polling_places = []
                for polling_place in self.polling_places:
                    processed_polling_places.append(_create(polling_place))

                self.logger.info("Created extras field from {} columns".format(len(self.extras_fields)))
                self.polling_places = processed_polling_places

        # def _skip_blank_coordinates():
        #     def _has_blank_coordinates(polling_place):
        #         return len(polling_place["lon"].strip()) == 0 or len(polling_place["lat"].strip()) == 0

        #     processed_polling_places = []
        #     skipped_polling_places = []
        #     for polling_place in self.polling_places:
        #         if _has_blank_coordinates(polling_place) is False:
        #             processed_polling_places.append(polling_place)
        #         else:
        #             skipped_polling_places.append("{} ({})".format(polling_place["name"], polling_place["premises"]))

        #     self.polling_places = processed_polling_places

        #     if len(skipped_polling_places) > 0:
        #         self.logger.warning("Skipped {} polling places with blank coordinates. {}".format(len(skipped_polling_places), ", ".join(skipped_polling_places)))

        def _run_regexes():
            def _apply_regexes(polling_place):
                for regex in self.cleaning_regexes:
                    # If we need to include field names at some point in the future
                    # field_data = {key: value.strip() for (key, value) in dict(polling_place).items() if key in regex["fields"]}
                    # match = re.search(regex["regex"].format(**field_data), polling_place[regex["field"]])

                    match = re.search(regex["regex"], polling_place[regex["field"]])
                    if match:
                        polling_place[regex["field"]] = match.groupdict()["main"].strip()
                    else:
                        self.logger.error("No regex match for {} for {}".format(polling_place["name"], regex["regex"]))
                return polling_place

            if self.cleaning_regexes is not None:
                processed_polling_places = []
                for polling_place in self.polling_places:
                    processed_polling_places.append(_apply_regexes(polling_place))

                self.logger.info("Ran {} cleaning regexes".format(len(self.cleaning_regexes)))
                self.polling_places = processed_polling_places

        _filter()
        _exclude_columns()
        _rename_columns()
        _create_extras()
        # _skip_blank_coordinates()
        _run_regexes()

        self.raise_exception_if_errors()

    def check_file_validity(self):
        def _get_header():
            return self.polling_places[0].keys()

        def check_file_header_validity(header):
            allowable_field_names = [f.name for f in PollingPlaces._meta.get_fields()] + ["lat", "lon"]
            if self.address_fields is not None:
                allowable_field_names += self.address_fields
            if self.division_fields is not None:
                allowable_field_names += self.division_fields

            required_model_field_names = [f.name for f in PollingPlaces._meta.get_fields() if hasattr(f, "blank") and f.blank is False and hasattr(f, "null") and f.null is False and f.name not in ("geom", "election", "status")] + ["lat", "lon"]

            # We're doing on-the-fly address merging in prepare_polling_places(). This will attach an address field for us.
            if self.address_fields is not None:
                del required_model_field_names[required_model_field_names.index("address")]

            # Check for allowable field names (optional extras)
            for field in header:
                if field not in allowable_field_names:
                    self.logger.error("Unknown field in header: {}".format(field))

            # Check for mandatory field names
            for field in required_model_field_names:
                if field not in header:
                    self.logger.error("Required field missing in header: {}".format(field))

            # Check for address fields (if necessary)
            if self.address_fields is not None:
                for field in self.address_fields:
                    if field not in header:
                        self.logger.error("Required address field missing in header: {}".format(field))

            # Check for division fields (if necessary)
            if self.division_fields is not None:
                for field in self.division_fields:
                    if field not in header:
                        self.logger.error("Required division field missing in header: {}".format(field))

        # Ensure we have all of the required fields and no unknown/excess fields
        check_file_header_validity(_get_header())

        self.raise_exception_if_errors()

    def prepare_polling_places(self):
        def _prepare_polling_place(polling_place):
            def get_or_merge_address_fields(polling_place):
                if "address" in polling_place:
                    return polling_place

                if self.address_format is not None:
                    address_data = {key: value.strip() for (key, value) in dict(polling_place).items() if key in self.address_fields}
                    address = self.address_format.format(**address_data)

                    # Handle missing address components
                    address = re.sub(r"\s{2,}", " ", address)
                    address = address.replace(", ,", ",").replace(" , ", ", ").replace(",, ", ", ")
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

            def _has_blank_coordinates(polling_place):
                return len(str(polling_place["lon"]).strip()) == 0 or len(str(polling_place["lat"]).strip()) == 0

            # Blanks will be filled in by the next step (geocode_missing_locations)
            if _has_blank_coordinates(polling_place) is False:
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

        # Prepare each polling place for ingest by merging addresses, merging by division, et cetera
        processed_polling_places = []
        for polling_place in self.polling_places:
            processed_polling_places.append(_prepare_polling_place(polling_place))
        self.polling_places = processed_polling_places

        self.raise_exception_if_errors()

    def geocode_missing_locations(self):
        def _geocode_polling_places():
            def _has_blank_coordinates(polling_place):
                return "geom" not in polling_place

            def _geocode(polling_place):
                def _do_geocode(term):
                    def _is_good_result(geocode_result):
                        if len(geocode_result) == 0:
                            return False
                        elif len(geocode_result) > 1:
                            return False
                        else:
                            return True

                    
                    geocode_result = self.gmaps.geocode(term, components=self.geocoding["components"])

                    if _is_good_result(geocode_result) is False:
                        return None
                    return geocode_result[0]

                def _get_best_result(polling_place):
                    geocode_result = _do_geocode("{}, {}".format(polling_place["premises"], polling_place["address"]))

                    if geocode_result is None:
                        geocode_result = _do_geocode(polling_place["premises"])

                        if geocode_result is None:
                            geocode_result = _do_geocode(polling_place["address"])

                            if geocode_result is None:
                                self.logger.warning("[Geocoding Skipping - No good results found] {} ({})".format(polling_place["premises"], polling_place["address"]))
                    
                    return geocode_result

                def _is_geocoding_accurate_enough(geocode_result):
                    # https://stackoverflow.com/a/32038696
                    if "partial_match" in geocode_result and geocode_result["partial_match"] is True:
                        if geocode_result["geometry"]["location_type"] == "ROOFTOP":
                            return True
                        return False

                    return True

                geocode_result = _get_best_result(polling_place)

                if geocode_result is not None:
                    if _is_geocoding_accurate_enough(geocode_result) is True:
                        polling_place["geom"] = Point(float(geocode_result["geometry"]["location"]["lng"]), float(geocode_result["geometry"]["location"]["lat"]), srid=4326)
                        del polling_place["lon"]
                        del polling_place["lat"]

                        return polling_place
                    else:
                        self.logger.warning("[Geocoding Skipping - Not accurate enough] {} ({}) {}".format(polling_place["premises"], polling_place["address"], geocode_result))

                return None

            processed_polling_places = []
            skipped_polling_places = []
            geocoding_success_counter = 0
            geocoding_skipped_counter = 0

            for polling_place in self.polling_places:
                if _has_blank_coordinates(polling_place) is False:
                    processed_polling_places.append(polling_place)
                else:
                    if self.geocoding is not None and self.geocoding["enabled"] is True:
                        new_polling_place = _geocode(polling_place)
                        if new_polling_place is not None:
                            geocoding_success_counter += 1
                            processed_polling_places.append(new_polling_place)
                        else:
                            geocoding_skipped_counter += 1
                    
                    else:
                        geocoding_skipped_counter += 1
                        self.logger.warning("[Geocoding Skipping - Not enabled] {} ({})".format(polling_place["premises"], polling_place["address"]))

            self.polling_places = processed_polling_places

            self.logger.info("Geocoded {} polling places successfully".format(geocoding_success_counter))
            self.logger.info("Geocoded skipped {} polling places".format(geocoding_skipped_counter))

        _geocode_polling_places()

        self.raise_exception_if_errors()

    def fix_polling_places(self):
        def _fix():
            def _apply_fix(config, polling_place):
                fixed_polling_place = polling_place
                for defn in config["overwrite"]:
                    if defn["field"] in polling_place:
                        # self.logger.info("Setting {} to {} for {} = {} for '{}'".format(defn["field"], defn["value"], config["field"], config["value"], polling_place["premises"]))
                        polling_place[defn["field"]] = defn["value"]
                return fixed_polling_place

            def _fix_matching_polling_places(config, polling_places):
                processed_polling_places = []

                for polling_place in polling_places:
                    if config["field"] in polling_place and str(polling_place[config["field"]]) == str(config["value"]):
                        processed_polling_places.append(_apply_fix(config, polling_place))
                    else:
                        processed_polling_places.append(polling_place)

                return processed_polling_places

            if self.fix_data_issues is not None:
                processed_polling_places = self.polling_places
                for config in self.fix_data_issues:
                    processed_polling_places = _fix_matching_polling_places(config, processed_polling_places)

                self.logger.info("Ran {} field fixers".format(len(self.fix_data_issues)))
                self.polling_places = processed_polling_places

        _fix()

        self.raise_exception_if_errors()

    def check_polling_place_validity(self):
        def is_polling_place_valid(polling_place):
            serialiser = PollingPlacesManagementSerializer(data=polling_place)
            if serialiser.is_valid() is True:
                return True
            return serialiser.errors

        # Ensure each polling place is valid
        for polling_place in self.polling_places:
            validation = is_polling_place_valid(polling_place)
            if validation is not True:
                self.logger.error("Polling place {} ({}) invalid: {}".format(polling_place["name"], polling_place["premises"], validation))

        self.raise_exception_if_errors()

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

                # self.logger.info("Deduping: Merged divisions for {} polling places with the same location ({}). Divisions: {}. Polling Places: {}".format(len(indexes), key, divisions, "; ".join(["{}/{}/{}".format(pp["name"], pp["premises"], pp["address"]) for pp in polling_places])))
            else:
                self.logger.info("Deduping: Discarded {} duplicate polling places with the same location ({}). No divisions were present. Polling Places: {}".format(len(indexes) - 1, key, "; ".join(["{}/{}/{}".format(pp["name"], pp["premises"], pp["address"]) for pp in polling_places])))

            # We can safely remove all bar the first polling place
            indexes_to_remove += indexes[1:]

        # Remove deduplicate polling places
        self.polling_places = [polling_place for idx, polling_place in enumerate(self.polling_places) if idx not in indexes_to_remove]
        self.logger.info("Deduping: Merged divisions for {} polling places with the same location".format(len(indexes_to_remove)))

        # To be extra sure - group by name and bail out if there are dupes
        polling_places_group_by = {}

        for polling_place in self.polling_places:
            key = "{}:{}:{}".format(polling_place["name"], polling_place["premises"], polling_place["address"])
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
        # Migrate polling places with attached noms (and their stalls)
        queryset = PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.ACTIVE, noms__isnull=False)
        for polling_place in queryset:
            matching_polling_places = self.safe_find_by_distance("Noms Migration", polling_place.geom, distance_threshold_km=0.1, limit=None, qs=PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.DRAFT))

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

        # Migrate any leftover declined stalls
        queryset = Stalls.objects.filter(election=self.election, status=StallStatus.DECLINED, polling_place__status=PollingPlaceStatus.ACTIVE)
        for stall in queryset:
            matching_polling_places = self.safe_find_by_distance("Declined Stall Migration", stall.polling_place.geom, distance_threshold_km=0.1, limit=None, qs=PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.DRAFT))

            if len(matching_polling_places) != 1:
                self.logger.error("Declined Stall Migration: {} matching polling places found in new data: '{}' ({})".format(len(matching_polling_places), stall.polling_place.name, stall.polling_place.address))

            else:
                # Repoint stall
                stall.polling_place_id = matching_polling_places[0].id
                stall.save()

                self.logger.info("Declined Stall Migration: Stall {} updated to point to polling place '{}' ({})".format(stall.id, matching_polling_places[0].name, matching_polling_places[0].address))

        self.logger.info("Noms Migration: Migrated {} declined stalls".format(queryset.count()))

        # Validate that we've actually migrated all stalls and polling places
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
        facility_type_this_election_queryset = PollingPlaces.objects.filter(status=PollingPlaceStatus.ACTIVE, election_id=self.election.id, facility_type__isnull=False)
        facility_type_queryset = PollingPlaces.objects.filter(status=PollingPlaceStatus.ACTIVE, facility_type__isnull=False)

        for polling_place in queryset:
            # Check if its current active polling place in this election already has a facility type
            most_recent_facility_type_this_election = find_by_distance(polling_place.geom, 0.2, limit=None, qs=facility_type_this_election_queryset).last()

            if most_recent_facility_type_this_election is not None:
                polling_place.facility_type = most_recent_facility_type_this_election.facility_type
                polling_place.save()

                update_count += 1
                continue

            # Failing that, try to find any historical polling places that match
            most_recent_facility_type = find_by_distance(polling_place.geom, 0.2, limit=None, qs=facility_type_queryset).order_by("election_id").last()

            if most_recent_facility_type is not None:
                polling_place.facility_type = most_recent_facility_type.facility_type
                polling_place.save()

                update_count += 1

        self.logger.info("Facility types detected from historical data: {}".format(update_count))

    def calculate_chance_of_sausage(self):
        def calculate_score(polling_places):
            def _is_a_positive_report(polling_place):
                return is_noms_item_true(polling_place, "bbq") or is_noms_item_true(polling_place, "cake")

            def _has_multiple_positive_reports(polling_places):
                count = 0
                for polling_place in polling_places:
                    if _is_a_positive_report(polling_place) is True:
                        count += 1

                        if count >= 2:
                            return True
                return False

            def _has_one_positive_report(polling_places):
                for polling_place in polling_places:
                    if _is_a_positive_report(polling_place) is True:
                        return True
                return False

            def _has_a_red_cross_of_shame(polling_places):
                for polling_place in polling_places:
                    if is_noms_item_true(polling_place, "nothing") is True:
                        return True
                return False

            def _has_multiple_red_crosses_of_shame(polling_places):
                count = 0
                for polling_place in polling_places:
                    if is_noms_item_true(polling_place, "nothing") is True:
                        count += 1

                        if count >= 2:
                            return True
                return False

            if _has_multiple_red_crosses_of_shame(polling_places) is True:
                if _has_one_positive_report(polling_places) is True:
                    return PollingPlaceChanceOfSausage.MIXED
                return PollingPlaceChanceOfSausage.UNLIKELY
            elif _has_multiple_positive_reports(polling_places) is True:
                if _has_a_red_cross_of_shame(polling_places) is True:
                    return PollingPlaceChanceOfSausage.MIXED
                return PollingPlaceChanceOfSausage.STRONG
            elif _has_one_positive_report(polling_places) is True:
                if _has_a_red_cross_of_shame(polling_places) is True:
                    return PollingPlaceChanceOfSausage.MIXED
                return PollingPlaceChanceOfSausage.FAIR
            else:
                return PollingPlaceChanceOfSausage.NO_IDEA

        if self.is_dry_run() is False:
            update_count = 0

            queryset = PollingPlaces.objects.filter(election=self.election, status=PollingPlaceStatus.DRAFT, noms__isnull=True)
            for polling_place in queryset:
                matching_polling_places = find_by_distance(polling_place.geom, 0.2, limit=None, qs=PollingPlaces.objects.filter(status=PollingPlaceStatus.ACTIVE)).order_by("election_id")

                if len(matching_polling_places) > 0:
                    polling_place.chance_of_sausage = calculate_score(matching_polling_places)
                    polling_place.save()

                    update_count += 1

            self.logger.info("Chance of Sausage calculations completed: Considered = {}; Updated = {}".format(queryset.count(), update_count))

        else:
            self.logger.info("Skipping Chance of Sausage calculations whilst in dry run mode")

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
            self.election.save()

    def run(self):
        if self.can_loading_begin() is False:
            self.logger.error("Loading can't begin. There's probably pending stalls.")
        else:
            self.invoke_and_bail_if_errors("convert_to_demsausage_schema")
            self.invoke_and_bail_if_errors("check_file_validity")
            self.invoke_and_bail_if_errors("fix_polling_places")
            self.invoke_and_bail_if_errors("prepare_polling_places")
            self.invoke_and_bail_if_errors("geocode_missing_locations")
            self.invoke_and_bail_if_errors("check_polling_place_validity")
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
