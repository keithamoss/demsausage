from django.db.models import F, Sum, Count, IntegerField, Q
from django.db.models.functions import Cast
from django.contrib.postgres.fields.jsonb import KeyTextTransform

from demsausage.app.sausage.polling_places import get_active_polling_place_queryset


class SausagelyticsBase():
    def __init__(self, election):
        self.election = election
        self.noms_names = ["bbq", "cake", "coffee", "vego", "halal", "bacon_and_eggs"]

    def get_queryset(self):
        return get_active_polling_place_queryset().filter(election_id=self.election.id)

    def _get_states(self):
        return list(self.get_queryset().values_list("state", flat=True).annotate(scount=Count("state")).order_by("-scount"))


class FederalSausagelytics(SausagelyticsBase):
    def get_stats(self):
        return {
            "australia": self._get_stats_for_australia(),
            "states": self._get_stats_by_state(),
            "divisions": self._get_stats_by_division(),
        }

    def get_queryset(self):
        return super(FederalSausagelytics, self).get_queryset().exclude(state__exact="Overseas")

    def _get_stats_for_australia(self):
        queryset_all_booths = self.get_queryset()
        queryset_all_booths_sum_expected_voters = self._cast_vote_counts_to_numbers(queryset_all_booths).aggregate(total=Sum(F("ordvoteest") + F("decvoteest")))

        queryset_with_bbq = queryset_all_booths.filter(noms__isnull=False).filter(noms__noms__bbq=True)
        queryset_with_bbq_sum_expected_voters = self._cast_vote_counts_to_numbers(queryset_with_bbq).aggregate(total=Sum(F("ordvoteest") + F("decvoteest")))

        # queryset_with_bbq_or_strong_chance = queryset_all_booths.filter((Q(noms__isnull=False) & Q(noms__noms__bbq=True)) | Q(chance_of_sausage__gte=3))
        # queryset_with_bbq_or_strong_chance_sum_expected_voters = self._cast_vote_counts_to_numbers(queryset_with_bbq_or_strong_chance).aggregate(total=Sum(F("ordvoteest") + F("decvoteest")))

        return {
            "domain": "Australia",
            "data": {
                "all_booths": {
                    "booth_count": queryset_all_booths.count(),
                    "expected_voters": queryset_all_booths_sum_expected_voters["total"],
                },
                "all_booths_by_noms": {
                    "bbq": {
                        "booth_count": queryset_with_bbq.count(),
                        "expected_voters": queryset_with_bbq_sum_expected_voters["total"]
                    }
                },
                # "all_booths_with_bbq_or_strong_chance": {
                #     "booth_count": queryset_with_bbq_or_strong_chance.count(),
                #     "expected_voters": queryset_with_bbq_or_strong_chance_sum_expected_voters["total"]
                # }
            },
        }

    def _get_stats_by_state(self):
        data = {}

        # Calculate stats for all booths in each state
        queryset_all_booths = self.get_queryset()
        queryset_stats_by_state = self._cast_vote_counts_to_numbers(queryset_all_booths).values("state").annotate(expected_voters=Sum(F("ordvoteest") + F("decvoteest"))).annotate(booth_count=Count("state")).order_by("-expected_voters")

        for stats in queryset_stats_by_state:
            data[stats["state"]] = {
                "domain": stats["state"],
                "data": {
                    "all_booths": {
                        "booth_count": stats["booth_count"],
                        "expected_voters": stats["expected_voters"],
                    },
                    "all_booths_by_noms": {}
                }
            }

        # Calculate stats for booths by noms in each state
        for noms_name in self.noms_names:
            queryset_stats_by_state_with_bbq = self._group_by_state_and_noms(queryset_all_booths, noms_name)

            for stats in queryset_stats_by_state_with_bbq:
                data[stats["state"]]["data"]["all_booths_by_noms"][noms_name] = {
                    "booth_count": stats["booth_count"],
                    "expected_voters": stats["expected_voters"],
                }

        # Find the top and bottom five by % of voters with access to sausage sizzles
        data_sorted = reversed(sorted(data.values(), key=lambda x: x["data"]["all_booths_by_noms"]["bbq"]["expected_voters"] / x["data"]["all_booths"]["expected_voters"]))

        return data_sorted

    def _get_stats_by_division(self):
        data = {}
        n_to_fetch = 5

        # Calculate stats for all booths in each division
        queryset_all_booths = self.get_queryset()
        queryset_stats_by_division = self._cast_vote_counts_to_numbers(queryset_all_booths).values("divisions__0", "state").annotate(expected_voters=Sum(F("ordvoteest") + F("decvoteest"))).annotate(booth_count=Count("divisions__0")).order_by("-expected_voters")

        for stats in queryset_stats_by_division:
            data[stats["divisions__0"]] = {
                "domain": stats["divisions__0"],
                "metadata": {
                    "state": stats["state"],
                },
                "data": {
                    "all_booths": {
                        "booth_count": stats["booth_count"],
                        "expected_voters": stats["expected_voters"],
                    },
                    "all_booths_by_noms": {
                        "bbq": {
                            "booth_count": 0,
                            "expected_voters": 0,
                        }
                    }
                }
            }

        # Calculate stats for booths with sausage sizzles in each divisions
        queryset_with_bbq = queryset_all_booths.filter(noms__isnull=False).filter(noms__noms__bbq=True)
        queryset_stats_by_division_with_bbq = self._cast_vote_counts_to_numbers(queryset_with_bbq).values("divisions__0").annotate(expected_voters=Sum(F("ordvoteest") + F("decvoteest"))).annotate(booth_count=Count("divisions__0"))

        for stats in queryset_stats_by_division_with_bbq:
            data[stats["divisions__0"]]["data"]["all_booths_by_noms"]["bbq"] = {
                "booth_count": stats["booth_count"],
                "expected_voters": stats["expected_voters"],
            }

        # Find the top and bottom five by % of voters with access to sausage sizzles
        data_sorted = sorted(data.values(), key=lambda x: x["data"]["all_booths_by_noms"]["bbq"]["expected_voters"] / x["data"]["all_booths"]["expected_voters"])

        def _rank(item, rank_by_list_idx):
            item["metadata"]["rank"] = rank_by_list_idx + 1
            return item

        top = reversed(data_sorted[-n_to_fetch:])
        top = [_rank(v, k) for (k, v) in enumerate(top)]

        bottom = reversed(data_sorted[:n_to_fetch])
        bottom = [_rank(v, len(data_sorted) - n_to_fetch + k) for (k, v) in enumerate(bottom)]

        return {
            "top": top,
            "bottom": bottom,
        }

    def _cast_vote_counts_to_numbers(self, queryset):
        # http://www.cannonade.net/blog.php?id=1803
        # https://stackoverflow.com/a/47433663
        return queryset.exclude(extras__OrdVoteEst__exact="").exclude(extras__DecVoteEst__exact="").annotate(ordvoteest=Cast(KeyTextTransform("OrdVoteEst", "extras"), IntegerField())).annotate(decvoteest=Cast(KeyTextTransform("DecVoteEst", "extras"), IntegerField()))

    def _group_by_state_and_noms(self, queryset, noms_name):
        queryset_with_noms = queryset.filter(noms__isnull=False).filter(**{"noms__noms__{}".format(noms_name): True})
        return self._cast_vote_counts_to_numbers(queryset_with_noms).values("state").annotate(expected_voters=Sum(F("ordvoteest") + F("decvoteest"))).annotate(booth_count=Count("state"))

    def _group_by_noms(self, queryset, noms_name):
        queryset_with_noms = queryset.filter(noms__isnull=False).filter(**{"noms__noms__{}".format(noms_name): True})
        return self._cast_vote_counts_to_numbers(queryset_with_noms).aggregate(expected_voters=Sum(F("ordvoteest") + F("decvoteest")))
