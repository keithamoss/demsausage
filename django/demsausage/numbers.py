"""Number helpers with no Django dependency (re-exported by demsausage.util)."""


def is_float(string):
    """
    Here be dragons.
    https://stackoverflow.com/a/20929983
    """
    try:
        float(string)
        return True
    except ValueError:
        return False


def is_int(string):
    """
    Here be dragons.
    https://stackoverflow.com/a/20929983
    """
    try:
        int(string)
        return True
    except ValueError:
        return False


def is_numeric(subject):
    return is_float(subject) is True or is_int(subject) is True


def convert_string_to_number(subject):
    if is_int(subject) is True:
        return int(subject)
    elif is_float(subject) is True:
        return float(subject)
    else:
        raise Exception("Failed try to convert '{}' to a number".format(subject))
