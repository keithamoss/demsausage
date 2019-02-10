from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.auth.models import User

from demsausage.app.models import Profile, PollingPlaces, PollingPlaceNoms
from demsausage.app.sausage.elections import regenerate_election_geojson
from demsausage.app.enums import PollingPlaceStatus


@receiver(post_save, sender=PollingPlaceNoms)
def regenerate_geojson_for_noms_change(sender, instance, **kwargs):
    if instance.tracker.has_changed("noms") is True:
        print("Making GeoJSON #2!")
        regenerate_election_geojson(instance.polling_place.election_id)


@receiver(post_save, sender=PollingPlaces)
def regenerate_geojson_for_new_polling_place(sender, instance, created, **kwargs):
    if created is True and instance.status == PollingPlaceStatus.ACTIVE:
        print("Making GeoJSON #1!")
        regenerate_election_geojson(instance.election_id)


@receiver(post_save, sender=User)
def create_user(sender, instance, created, **kwargs):
    if created:
        is_approved = True
        Profile.objects.create(user=instance, is_approved=is_approved)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
