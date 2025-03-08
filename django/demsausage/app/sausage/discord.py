import json

import requests
from demsausage.app.admin import is_production
from demsausage.util import get_env


def send_discord_webhook_message(content):
    discordWebhookURL = get_env("DISCORD_WEBHOOK_URL_PENDING_STALLS_BOT")

    # environmentPrefix = (
    #     f"[{get_env('ENVIRONMENT')}] " if is_production() is False else ""
    # )
    environmentPrefix = f"[{get_env('ENVIRONMENT')}] "

    if discordWebhookURL is not None:
        try:
            requests.post(
                url=discordWebhookURL,
                headers={
                    "Content-Type": "application/json; charset=utf-8",
                },
                data=json.dumps(
                    {
                        "content": f"{environmentPrefix}{content}",
                    }
                ),
            )
        except:
            # Fail silently because we don't want to surface this sort of non-critical error to the user
            pass
