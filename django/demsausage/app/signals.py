from demsausage.app.enums import PollingPlaceStatus
from demsausage.app.models import (
    Elections,
    PollingPlaceNoms,
    PollingPlaces,
    Profile,
    Stalls,
)
from demsausage.app.sausage.elections import clear_elections_cache
from demsausage.rq.jobs import task_regenerate_cached_election_data
from demsausage.util import is_iterable
from simple_history.models import HistoricalRecords
from simple_history.signals import pre_create_historical_record

from django.contrib.auth.models import User
from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver


@receiver(post_save, sender=PollingPlaceNoms)
def regenerate_geojson_for_noms_change(sender, instance, created, **kwargs):
    # We only need to update when the "noms" field of an existing noms record changes
    # The other post_save() and post_delete() signals below takes care of regenerating GeoJSON for
    # newly created or deleted noms records. We handle it this way because this post_save() triggers before the post_save() that actually links the polling_place and noms records.
    if created is False and instance.tracker.has_changed("noms") is True:
        task_regenerate_cached_election_data.delay(
            election_id=instance.polling_place.election_id
        )


@receiver(post_save, sender=PollingPlaceNoms)
def regenerate_geojson_for_noms_soft_delete(sender, instance, created, **kwargs):
    # Regenerate GeoJSON when a noms gets soft deleted by an admin
    if created is False and instance.tracker.has_changed("deleted") is True:
        task_regenerate_cached_election_data.delay(
            election_id=instance.polling_place.election_id
        )


# I'm not actually sure if this ever runs into the if branch - since a delete noms would never know it's election_id
# @TODO The better approach in future might be to change this from a OneToOneField to something else that doesn't mean .delete() cascades to delete either the PollingPlace or the Noms when the other is deleted - since that's not really our intent.
# i.e. We want to delete Noms without deleting a PollingPlace and we never delete PollingPlaces.
# We worked around this in the redesign by adding delete_polling_place_noms() in views.py, but it's not ideal and ripe for reconsideration when we get around to a rewrite of the spaghetti mess of the backend.
@receiver(post_delete, sender=PollingPlaceNoms)
def regenerate_geojson_for_noms_deletion(sender, instance, **kwargs):
    if hasattr(instance, "polling_place") and instance.polling_place is not None:
        task_regenerate_cached_election_data.delay(
            election_id=instance.polling_place.election_id
        )


# I think this is only for when we have unofficial polling places?
# The usual polling place loading process triggers the function, but
# the logic prevents it getting to cache regeneration.
@receiver(post_save, sender=PollingPlaces)
def regenerate_geojson_for_new_polling_place_or_noms_link(
    sender, instance, created, **kwargs
):
    if instance.status == PollingPlaceStatus.ACTIVE:
        if created is True or instance.tracker.has_changed("noms") is True:
            task_regenerate_cached_election_data.delay(election_id=instance.election_id)


@receiver(post_save, sender=Elections)
@receiver(post_delete, sender=Elections)
def clear_elections_json(sender, instance, created, **kwargs):
    clear_elections_cache()


@receiver(post_save, sender=User)
def create_user(sender, instance, created, **kwargs):
    if created:
        is_approved = True
        Profile.objects.create(user=instance, is_approved=is_approved)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


@receiver(pre_create_historical_record)
def pre_create_historical_record_callback(sender, **kwargs):
    history_instance = kwargs["history_instance"]

    # When running in an RQ task there's no request object
    if hasattr(HistoricalRecords.thread, "request"):
        forwarded_for = HistoricalRecords.thread.request.META["HTTP_X_FORWARDED_FOR"]
        if ", " in forwarded_for:
            # 123.4.5.6, 172.68.2.109
            # Remote IP, Docker NGinx Container IP
            remote_addr, rest = forwarded_for.split(", ")
            history_instance.ip_address = remote_addr
        else:
            history_instance.ip_address = forwarded_for
    else:
        history_instance.ip_address = None


@receiver(pre_save, sender=Stalls)
def pre_save_stall_track_previous_status(sender, instance, **kwargs):
    if instance.tracker.has_changed("status") is True:
        try:
            old_instance = Stalls.objects.get(id=instance.id)
            instance.previous_status = old_instance.status
        except Stalls.DoesNotExist:  # Handle initial object creation
            return None
