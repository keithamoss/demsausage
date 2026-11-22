"""Helpers for safely embedding data and text in HTML reports."""

from __future__ import annotations

import json


def embed_json(data: object) -> str:
    """Encode JSON so embedded data cannot close its script element.

    Args:
        data: The value to encode as JSON.

    Returns:
        JSON text with HTML-significant characters escaped.
    """
    return json.dumps(data).replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")


def escape_html(text: str) -> str:
    """Escape text before placing it in HTML markup.

    Args:
        text: The text to escape.

    Returns:
        Text with ampersands, angle brackets, and double quotes escaped.
    """
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")
