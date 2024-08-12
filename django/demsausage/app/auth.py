from demsausage.app.models import AllowedUsers

USER_FIELDS = ["username", "email"]


def allowed_email(email):
    allowed_emails = list(AllowedUsers.objects.all().values_list("email", flat=True))
    if len(allowed_emails) >= 1:
        return email in allowed_emails
    return False

# https://medium.com/trabe/user-account-validation-with-social-auth-django-658ff00404b5
# https://stackoverflow.com/questions/39472975/django-python-social-auth-only-allow-certain-users-to-sign-in


def create_user(strategy, details, user=None, *args, **kwargs):
    if user:
        return {
            "is_new": False
        }

    fields = dict((name, kwargs.get(name, details.get(name)))
                  for name in strategy.setting("USER_FIELDS", USER_FIELDS))

    if not fields:
        return

    if not allowed_email(fields["email"]):
        return

    return {
        "is_new": True,
        "user": strategy.create_user(**fields)
    }


def social_uid(backend, details, response, *args, **kwargs):
    # Required for social_core.backends.azuread.AzureADOAuth2 via https://github.com/python-social-auth/social-app-django/issues/111
    # https://github.com/python-social-auth/social-core/issues/684 suggests to use the `oid` because the `upn` (used in https://github.com/python-social-auth/social-core/blob/master/social_core/backends/azuread.py by default) isn't provided
    #
    # https://github.com/python-social-auth/social-core/blob/9afa1a2d45a5088329f6ef40ba2b6a12a1181e06/social_core/pipeline/social_auth.py#L8
    # def social_uid(backend, details, response, *args, **kwargs):
    #     return {"uid": backend.get_user_id(details, response)}

    if backend.__class__.__name__ == "AzureADOAuth2":
        return {"uid": response["email"]}
    else:
        return {"uid": backend.get_user_id(details, response)}


def get_avatar(strategy, backend, uid, response, details, user, social, *args, **kwargs):
    """Source: https://stackoverflow.com/a/33161353/7368493"""

    # The users isn't on our list of authorised users
    if user is None:
        return

    url = None
    if backend.name == 'facebook':
        url = "https://graph.facebook.com/%s/picture?type=large" % response['id']
    if backend.name == 'twitter':
        url = response.get('profile_image_url', '').replace('_normal', '')
    if backend.name == 'google-oauth2':
        url = response['picture']

    if url is not None:
        user.profile.profile_image_url = url
        user.profile.save()
