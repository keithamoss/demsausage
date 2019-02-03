import requests
from rest_framework.exceptions import APIException

from demsausage.app.sausage.polling_places import getFoodDescription
from demsausage.util import get_env

import hmac
import hashlib
import time
import os


class MailgunException(APIException):
    pass


def send(body):
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


def get_mail_template(template_name, params):
    with open(os.path.join("demsausage", "app", "sausage", "mail_templates", "{}.html".format(template_name))) as f:
        return f.read().format_map(params)


def send_stall_submitted_email(stall):
    if stall.election.polling_places_loaded is False:
        location_info = stall.location_info
    else:
        location_info = dict(stall.polling_place)

    html = get_mail_template("stall_submitted", {
        "POLLING_PLACE_NAME": location_info["name"],
        "POLLING_PLACE_ADDRESS": location_info["address"],
        "STALL_NAME": stall.name,
        "STALL_DESCRIPTION": stall.description,
        "STALL_WEBSITE": stall.website,
        "DELICIOUSNESS": getFoodDescription(stall),
    })

    return send({
        "to": stall.email,
        "subject": "Your Democracy Sausage stall has been received!",
        "html": html,
    })


def send_stall_approved_email(stall):
    html = get_mail_template("stall_approved", {
        "POLLING_PLACE_NAME": stall.polling_place.name,
        "POLLING_PLACE_ADDRESS": stall.polling_place.address,
        "STALL_NAME": stall.name,
        "STALL_DESCRIPTION": stall.description,
        "STALL_WEBSITE": stall.website,
        "DELICIOUSNESS": getFoodDescription(stall),
        "CONFIRM_OPTOUT_URL": get_env("API_BASE_URL") + "/foobar/?confirm_key=" + make_confirmation_hash(stall.email, stall.id),
    })

    return send({
        "to": stall.email,
        "subject": "Your Democracy Sausage stall has been approved!",
        "html": html,
    })


# https://documentation.mailgun.com/en/latest/user_manual.html#webhooks
def verify_webhook(api_key, token, timestamp, signature):
    # Check if the timestamp is fresh
    if abs(time.time() - timestamp) > 15:
        return False

    return generate_signature(api_key, "{}{}".format(timestamp, token)) == signature


def make_confirmation_hash(email, stall_id):
    return generate_signature(get_env("MAILGUN_HMAC_KEY"), "{}{}{}".format(email, stall_id, get_env("MAILGUN_CONFIRM_SECRET")))


def generate_signature(key, msg):
    return hmac.new(bytes(key, "latin-1"), bytes(msg, "latin-1"), hashlib.sha256).hexdigest()


def check_confirmation_hash(email, stall_id, confirm_code):
    return make_confirmation_hash(email, stall_id) == confirm_code
