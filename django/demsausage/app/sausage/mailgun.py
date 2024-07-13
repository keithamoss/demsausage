import hashlib
import hmac
import time
from random import getrandbits

import requests
from demsausage.app.admin import (get_admins, get_super_admins, is_development,
                                  is_production)
from demsausage.app.enums import StallSubmitterType
from demsausage.app.sausage.polling_places import getFoodDescription
from demsausage.util import get_env, get_url_safe_election_name
from rest_framework.exceptions import APIException

from django.forms.models import model_to_dict


class MailgunException(APIException):
    pass


def send(body):
    # Warning: This assumes that body["to"] is a string representing a single email address
    # If we're in development we still want to send emails to the super admins so we can still test that flow
    if is_development() is True and body["to"] not in get_super_admins():
        print(f"Mailgun Dev Wrapper: Subject = {body['subject']}, To = {body['to']}, HTML = {body['html'][:100]}")
        return True

    else:
        r = requests.post(
            get_env("MAILGUN_API_BASE_URL") + "/messages",
            auth=("api", get_env("MAILGUN_API_KEY")),
            data={
                **{
                    "from": get_env("MAILGUN_FROM_ADDRESS"),
                    "h:Reply-To": get_env("MAILGUN_REPLY_TO_ADDRESS"),
                },
                **body
            }
        )

        if r.status_code != 200:
            raise MailgunException("Mailgun Error ({}): {}".format(r.status_code, r.text))
        return True


def get_mail_template(template_name, params=None):
    with open("/app/demsausage/app/sausage/mail_templates/{}.html".format(template_name)) as f:
        return f.read().format_map(params)


def send_stall_submitted_email(stall):
    if stall.election.polling_places_loaded is False:
        location_info = stall.location_info
        stall_name = location_info["name"]
    else:
        location_info = model_to_dict(stall.polling_place)
        stall_name = location_info["premises"]

    token = str(getrandbits(128))
    signature = make_confirmation_hash(stall.id, token)

    if stall.submitter_type == StallSubmitterType.OWNER:
        html = get_mail_template("stall_submitted_owner", {
            "POLLING_PLACE_NAME": location_info["name"],
            "POLLING_PLACE_ADDRESS": location_info["address"],
            "STALL_NAME": stall.name,
            "STALL_DESCRIPTION": stall.description,
            "STALL_OPENING_HOURS": stall.opening_hours,
            "STALL_WEBSITE": stall.website,
            "DELICIOUSNESS": getFoodDescription(stall),
            "STALL_EDIT_URL": "{site_url}/edit-stall?stall_id={stall_id}&token={token}&signature={signature}".format(site_url=get_env("PUBLIC_SITE_URL"), stall_id=stall.id, token=token, signature=signature),
        })
    elif stall.submitter_type == StallSubmitterType.TIPOFF:
        html = get_mail_template("stall_submitted_tipoff", {
            "POLLING_PLACE_NAME": location_info["name"],
            "POLLING_PLACE_ADDRESS": location_info["address"],
            "DELICIOUSNESS": getFoodDescription(stall),
            "STALL_EDIT_URL": "{site_url}/edit-stall?stall_id={stall_id}&token={token}&signature={signature}".format(site_url=get_env("PUBLIC_SITE_URL"), stall_id=stall.id, token=token, signature=signature),
        })
    else:
        html = "Could not locate a valid email template! No one should ever see this message!"

    return send({
        "to": stall.email,
        "subject": "Your Democracy Sausage stall for {} has been received!".format(stall_name),
        "html": html,
    })


def send_stall_approved_email(stall):
    if stall.election.polling_places_loaded is False:
        location_info = stall.location_info
        stall_name = location_info["name"]
    else:
        location_info = model_to_dict(stall.polling_place)
        stall_name = location_info["premises"]

    token = str(getrandbits(128))
    signature = make_confirmation_hash(stall.id, token)

    html = get_mail_template("stall_approved_with_mail_optout", {
        "POLLING_PLACE_NAME": location_info["name"],
        "POLLING_PLACE_ADDRESS": location_info["address"],
        "STALL_NAME": stall.name,
        "STALL_DESCRIPTION": stall.description,
        "STALL_OPENING_HOURS": stall.opening_hours,
        "STALL_WEBSITE": stall.website,
        "DELICIOUSNESS": getFoodDescription(stall),
        "STALL_PERMALINK": "{site_url}/{election_name}/stalls/{stall_id}".format(site_url=get_env("PUBLIC_SITE_URL"), stall_id=stall.id, election_name=get_url_safe_election_name(stall.election)),
        "STALL_EDIT_URL": "{site_url}/edit-stall?stall_id={stall_id}&token={token}&signature={signature}".format(site_url=get_env("PUBLIC_SITE_URL"), stall_id=stall.id, token=token, signature=signature),
        "CONFIRM_OPTOUT_URL": "{api_url}/0.1/mail/opt_out/?format=json&stall_id={stall_id}&token={token}&signature={signature}".format(api_url=get_env("PUBLIC_API_BASE_URL"), stall_id=stall.id, token=token, signature=signature),
    })

    return send({
        "to": stall.email,
        "subject": "Your Democracy Sausage stall for {} has been approved!".format(stall_name),
        "html": html,
    })


def send_stall_edited_email(stall):
    if stall.election.polling_places_loaded is False:
        location_info = stall.location_info
        stall_name = location_info["name"]
    else:
        location_info = model_to_dict(stall.polling_place)
        stall_name = location_info["premises"]

    token = str(getrandbits(128))
    signature = make_confirmation_hash(stall.id, token)

    html = get_mail_template("stall_edited", {
        "POLLING_PLACE_NAME": location_info["name"],
        "POLLING_PLACE_ADDRESS": location_info["address"],
        "STALL_NAME": stall.name,
        "STALL_DESCRIPTION": stall.description,
        "STALL_OPENING_HOURS": stall.opening_hours,
        "STALL_WEBSITE": stall.website,
        "DELICIOUSNESS": getFoodDescription(stall),
        "STALL_PERMALINK": "{site_url}/{election_name}/stalls/{stall_id}".format(site_url=get_env("PUBLIC_SITE_URL"), stall_id=stall.id, election_name=get_url_safe_election_name(stall.election)),
        "STALL_EDIT_URL": "{site_url}/edit-stall?stall_id={stall_id}&token={token}&signature={signature}".format(site_url=get_env("PUBLIC_SITE_URL"), stall_id=stall.id, token=token, signature=signature),
    })

    return send({
        "to": stall.email,
        "subject": "Your changes to your Democracy Sausage stall for {} have been received!".format(stall_name),
        "html": html,
    })


def send_pending_stall_reminder_email(pending_stall_count):
    if is_production() is True:
        admin_emails = [u.email for u in get_admins()]
    else:
        admin_emails = get_super_admins()

    if len(admin_emails) > 0:
        return send({
            "to": ", ".join(admin_emails),
            "subject": "Reminder: There are {} Democracy Sausage stalls waiting to be reviewed".format(pending_stall_count),
            "html": get_mail_template("pending_stall_reminder"),
        })


def send_monthly_reminder_heartbeat_email():
    import datetime

    if datetime.datetime.today().day == 1:
        return send({
            "to": ", ".join(get_super_admins()),
            "subject": f"This is your monthly hearbeat email for the Democracy Sausage ({get_env('ENVIRONMENT')}) pending stalls reminder email",
            "html": "Nothing to see here.",
        })


def generate_signature(key, msg):
    return hmac.new(bytes(key, "latin-1"), bytes(msg, "latin-1"), hashlib.sha256).hexdigest()


# https://documentation.mailgun.com/en/latest/user_manual.html#webhooks
def verify_webhook(token, timestamp, signature):
    # Check if the timestamp is fresh
    if abs(time.time() - timestamp) > 30:  # seconds
        return False

    return generate_signature(get_env("MAILGUN_API_KEY"), "{}{}".format(timestamp, token)) == signature


def make_confirmation_hash(stall_id, token):
    return generate_signature(get_env("SECRET_KEY"), "{}{}".format(stall_id, token))
