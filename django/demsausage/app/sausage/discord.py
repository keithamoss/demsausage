import json

import requests

from demsausage.app.admin import is_production
from demsausage.util import get_env, make_logger

logger = make_logger(__name__)


def send_discord_webhook_message(content):
    discordWebhookURL = get_env("DISCORD_WEBHOOK_URL_PENDING_STALLS_BOT")

    environmentPrefix = (
        f"[{get_env('ENVIRONMENT')}] " if is_production() is False else ""
    )

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
        except requests.RequestException as exc:
            logger.warning("Failed to send Discord webhook (%s)", type(exc).__name__)
