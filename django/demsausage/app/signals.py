from django.dispatch import receiver
from django.db.models.signals import post_save
from django.contrib.auth.models import User
from demsausage.app.models import Profile
# from .mailgun import send_new_user_welcome_mail, send_new_user_signed_up_admin_mail, send_new_user_welcome_awaiting_approval_mail, send_new_user_admin_awaiting_approval_mail, send_new_user_approved_mail


# @receiver(pre_save, sender=Profile)
# def approve_user(sender, instance, **kwargs):
#     if is_private_site():
#         if instance.tracker.has_changed("is_approved") and instance.is_approved is True:
#             send_new_user_approved_mail(instance.user)


@receiver(post_save, sender=User)
def create_user(sender, instance, created, **kwargs):
    if created:
        is_approved = True
        Profile.objects.create(user=instance, is_approved=is_approved)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
