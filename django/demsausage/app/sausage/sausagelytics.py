from django.db.models import F, Sum, Count, BigIntegerField
from django.db.models.functions import Cast
from django.contrib.postgres.fields.jsonb import KeyTextTransform

from demsausage.app.sausage.polling_places import get_active_polling_place_queryset


class SausagelyticsBase():
    def __init__(self, election):
        self.election = election

    def get_queryset(self):
        return get_active_polling_place_queryset().filter(election_id=self.election.id)

    def _get_states(self):
        return list(self.get_queryset().values_list("state", flat=True).annotate(scount=Count("state")).order_by("-scount"))


class FederalSausagelytics(SausagelyticsBase):
    def get_stats(self):
        queryset = self.get_queryset()
        states = []
        for state in self._get_states():
            state_queryset = queryset.filter(state__exact=state)
            states.append({"domain": state, "data": self._get_aggregate_stats_for_bbq(state_queryset)})

        return {
            "australia": {"domain": "Australia", "data": self._get_aggregate_stats_for_bbq(queryset)},
            "states": states
        }

    def get_queryset(self):
        return super(FederalSausagelytics, self).get_queryset().exclude(state__exact="Overseas")

    def _get_aggregate_stats_for_bbq(self, queryset):
        def _fix_ordvoteest(qs):
            # http://www.cannonade.net/blog.php?id=1803
            # https://stackoverflow.com/a/47433663
            return qs.filter(extras__has_key="OrdVoteEst").exclude(extras__OrdVoteEst__isnull=True).exclude(extras__OrdVoteEst__exact="").annotate(ordvoteest=Cast(KeyTextTransform("OrdVoteEst", "extras"), BigIntegerField())).filter(ordvoteest__gte=0)

        def _fix_decvoteest(qs):
            # http://www.cannonade.net/blog.php?id=1803
            # https://stackoverflow.com/a/47433663
            return qs.filter(extras__has_key="DecVoteEst").exclude(extras__DecVoteEst__isnull=True).exclude(extras__DecVoteEst__exact="").annotate(decvoteest=Cast(KeyTextTransform("DecVoteEst", "extras"), BigIntegerField())).filter(decvoteest__gte=0)

        # @TODO Fix names
        # @TODO Fix extras values in elections.py (so we store numbers as numbers, not strings)
        queryset_sum_ordvoteest = _fix_ordvoteest(queryset)
        queryset_sum_ordvoteest = _fix_decvoteest(queryset_sum_ordvoteest).aggregate(total=Sum(F("ordvoteest") + F("decvoteest")))
        queryset_with_bbq = queryset.filter(noms__isnull=False).filter(noms__noms__bbq=True)
        queryset_sum_ordvoteest_with_bbq = _fix_ordvoteest(queryset_with_bbq)
        queryset_sum_ordvoteest_with_bbq = _fix_decvoteest(queryset_sum_ordvoteest_with_bbq).aggregate(total=Sum(F("ordvoteest") + F("decvoteest")))

        return {
            "all_booths": {
                "count": queryset.count(),
                "expected_voters": queryset_sum_ordvoteest["total"],
            },
            "all_booths_with_bbq": {
                "count": queryset_with_bbq.count(),
                "expected_voters": queryset_sum_ordvoteest_with_bbq["total"]
            }
        }
