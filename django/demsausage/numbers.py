"""Number helpers with no Django dependency (re-exported by demsausage.util)."""

from numbers import Number
from typing import Any

__all__ = ("is_float", "is_int", "is_numeric", "convert_string_to_number")


def is_float(subject: Any) -> bool:
    """Check whether a value can be read as a floating-point number.

    Args:
            subject: Value to test.

    Returns:
        ``True`` when the value can be converted to a float; otherwise ``False``.

    Example:
        ``is_float("12.5")`` returns ``True``.
    """
    try:
        float(subject)
        return True
    except (TypeError, ValueError):
        return False


def is_int(subject: Any) -> bool:
    """Check whether a value can be read as a whole number.

    Args:
            subject: Value to test.

    Returns:
        ``True`` when the value can be converted to an integer; otherwise
        ``False``.

    Example:
        ``is_int("12")`` returns ``True``.
    """
    try:
        int(subject)
        return True
    except (TypeError, ValueError):
        return False


def is_numeric(subject: Any) -> bool:
    """Check whether a value is a valid integer or floating-point number.

    Args:
        subject: Value to test.

    Returns:
        ``True`` for a value that can be converted to an integer or float;
        otherwise ``False``.
    """
    return isinstance(subject, Number) or is_float(subject) or is_int(subject)


def convert_string_to_number(subject: Any) -> int | float:
    """Convert numeric text to an integer or floating-point number.

    Args:
        subject: Numeric text or another value accepted by the number helpers.

    Returns:
        An integer when the text is a whole number, or a float otherwise.

    Raises:
        ValueError: When the value is not numeric.
    """
    if is_int(subject):
        return int(subject)
    if is_float(subject):
        return float(subject)
    raise ValueError(f"Failed to convert '{subject}' to a number")
