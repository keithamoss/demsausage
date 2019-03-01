from django.dispatch import receiver
from django.db.models.signals import post_save, post_delete
from django.contrib.auth.models import User
from simple_history.signals import pre_create_historical_record
from simple_history.models import HistoricalRecords

from demsausage.app.models import Profile, PollingPlaces, PollingPlaceNoms, Elections, Stalls
from demsausage.app.sausage.elections import regenerate_election_geojson, clear_elections_cache
from demsausage.app.enums import PollingPlaceStatus


@receiver(post_save, sender=PollingPlaceNoms)
@receiver(post_delete, sender=PollingPlaceNoms)
def regenerate_geojson_for_noms_change(sender, instance, created, **kwargs):
    # We only need to update when the "noms" field of an existing noms record changes
    # The other post_save() signal below takes care of regenerating GeoJSON for
    # newly created noms records. We handle it this way because this post_save() triggers before the post_save() that actually links the polling_place and noms records.
    if created is False and instance.tracker.has_changed("noms") is True:
        regenerate_election_geojson(instance.polling_place.election_id)


@receiver(post_save, sender=PollingPlaces)
@receiver(post_delete, sender=PollingPlaces)
def regenerate_geojson_for_new_polling_place_or_noms_link(sender, instance, created, **kwargs):
    if instance.status == PollingPlaceStatus.ACTIVE:
        if created is True or instance.tracker.has_changed("noms") is True:
            regenerate_election_geojson(instance.election_id)


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

    forwarded_for = HistoricalRecords.thread.request.META["HTTP_X_FORWARDED_FOR"]
    if ", " in forwarded_for:
        # 123.4.5.6, 172.68.2.109
        # Remote IP, Docker NGinx Container IP
        remote_addr, rest = forwarded_for.split(", ")
        history_instance.ip_address = remote_addr
    else:
        history_instance.ip_address = forwarded_for
