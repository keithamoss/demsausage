import os
from datetime import datetime

import pytz
from demsausage.app.test_data.utils import (
    cleanup,
    create_owner_submission_stall,
    create_polling_place_with_a_denied_owner_submission_stall,
    create_polling_place_with_a_denied_tip_off,
    create_polling_place_with_an_approved_owner_submission_stall,
    create_polling_place_with_an_approved_RCOS_tip_off,
    create_polling_place_with_an_approved_RunOut_tip_off,
    create_polling_place_with_an_approved_tip_off,
    create_RCOS_tipoff_stall,
    create_RunOut_tipoff_stall,
    create_tipoff_stall,
    create_unofficial_polling_place_approved_RCOS_tipoff_stall,
    create_unofficial_polling_place_approved_RunOut_tipoff_stall,
    create_unofficial_polling_place_approved_tipoff_stall,
    create_unofficial_polling_place_owner_submission_stall,
    create_unofficial_polling_place_RCOS_tipoff_stall,
    create_unofficial_polling_place_RunOut_tipoff_stall,
    create_unofficial_polling_place_tipoff_stall,
    create_unofficial_polling_place_with_an_approved_owner_submission_stall,
    get_next_polling_place,
)

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "demsausage.settings")
django.setup()

from demsausage.app.enums import StallStatus, StallTipOffSource
from demsausage.app.models import Stalls

# Cleanup
cleanup()


def polling_place_with_an_approved_owner_submission_and_a_new_stall_owner_submission():
    pollingPlace = get_next_polling_place(
        "Approved owner submission and a new stall owner submission"
    )

    create_polling_place_with_an_approved_owner_submission_stall(pollingPlace, "Stall")

    create_owner_submission_stall(pollingPlace, "Stall")


def polling_place_with_an_approved_owner_submission_and_a_new_newsletter_tip_off():
    pollingPlace = get_next_polling_place(
        "Approved owner submission and a new newsletter tip-off"
    )

    create_polling_place_with_an_approved_owner_submission_stall(pollingPlace, "Stall")

    create_tipoff_stall(pollingPlace, StallTipOffSource.Newsletter)


def polling_place_with_an_approved_owner_submission_that_has_pending_edits():
    pollingPlace = get_next_polling_place(
        "Approved owner submission that has pending edits"
    )

    stall = create_polling_place_with_an_approved_owner_submission_stall(
        pollingPlace, "Stall"
    )

    # Submit Stall Edit
    stallEdits = Stalls.objects.get(id=stall.id)
    stallEdits.status = StallStatus.PENDING
    stallEdits.owner_edit_timestamp = datetime.now(pytz.utc)
    stallEdits.noms = {
        "bbq": True,
        "cake": True,
    }
    stallEdits.save()


def polling_place_with_an_approved_owner_submission_that_has_pending_edits_and_an_other_tip_off():
    pollingPlace = get_next_polling_place(
        "Approved owner submission that has pending edits and an other tip-off"
    )

    stall = create_polling_place_with_an_approved_owner_submission_stall(
        pollingPlace, "Stall"
    )

    # Submit Stall Edit
    stallEdits = Stalls.objects.get(id=stall.id)
    stallEdits.status = StallStatus.PENDING
    stallEdits.owner_edit_timestamp = datetime.now(pytz.utc)
    stallEdits.name = "New name!"
    stallEdits.website = ""
    stallEdits.noms = {
        "bbq": True,
        "cake": True,
        "halal": True,
    }
    stallEdits.save()

    create_tipoff_stall(pollingPlace, StallTipOffSource.Other, "I work there")


def polling_place_with_an_approved_owner_submission_that_has_pending_edits_and_a_new_stall_owner_submission():
    pollingPlace = get_next_polling_place(
        "Approved owner submission that has pending edits and a new stall owner submission"
    )

    stall = create_polling_place_with_an_approved_owner_submission_stall(
        pollingPlace, "Stall"
    )

    # Submit Stall Edit
    stallEdits = Stalls.objects.get(id=stall.id)
    stallEdits.status = StallStatus.PENDING
    stallEdits.owner_edit_timestamp = datetime.now(pytz.utc)
    stallEdits.name = "Coffee and Cake Van"
    stallEdits.noms = {
        "cake": True,
        "coffee": True,
    }
    stallEdits.save()

    create_owner_submission_stall(pollingPlace, "Stall")


def polling_place_with_an_approved_owner_submission_that_has_pending_edits_to_free_text_noms():
    pollingPlace = get_next_polling_place(
        "Approved owner submission that has pending edits to free_text noms"
    )

    stall = create_polling_place_with_an_approved_owner_submission_stall(
        pollingPlace, "Stall"
    )

    # Submit Stall Edit
    stallEdits = Stalls.objects.get(id=stall.id)
    stallEdits.status = StallStatus.PENDING
    stallEdits.owner_edit_timestamp = datetime.now(pytz.utc)
    stallEdits.noms = {"bbq": True, "cake": True, "free_text": "And pony rides!"}
    stallEdits.save()


def polling_place_with_a_denied_owner_submission_and_a_new_other_tip_off():
    pollingPlace = get_next_polling_place(
        "Denied owner submission and a new other tip-off"
    )

    create_polling_place_with_a_denied_owner_submission_stall(pollingPlace, "Stall")

    create_tipoff_stall(
        pollingPlace, StallTipOffSource.Other, "Saw it on a poster at the school"
    )


def polling_place_with_a_denied_owner_submission_that_has_pending_edits():
    pollingPlace = get_next_polling_place(
        "Denied owner submission that has pending edits"
    )

    stall = create_polling_place_with_a_denied_owner_submission_stall(
        pollingPlace, "Stall"
    )

    # Submit Stall Edit
    stallEdits = Stalls.objects.get(id=stall.id)
    stallEdits.status = StallStatus.PENDING
    stallEdits.owner_edit_timestamp = datetime.now(pytz.utc)
    stallEdits.noms = {
        "bbq": True,
        "cake": True,
    }
    stallEdits.save()


def polling_place_with_a_denied_owner_submission_that_has_pending_edits_and_a_new_online_tip_off():
    pollingPlace = get_next_polling_place(
        "Denied owner submission that has pending edits and a new online tip-off"
    )

    stall = create_polling_place_with_a_denied_owner_submission_stall(
        pollingPlace, "Stall"
    )

    # Submit Stall Edit
    stallEdits = Stalls.objects.get(id=stall.id)
    stallEdits.status = StallStatus.PENDING
    stallEdits.owner_edit_timestamp = datetime.now(pytz.utc)
    stallEdits.noms = {
        "bbq": True,
        "cake": True,
    }
    stallEdits.save()

    create_tipoff_stall(pollingPlace, StallTipOffSource.Online)


def polling_place_with_a_denied_tip_off_and_a_new_owner_submission():
    pollingPlace = get_next_polling_place("Denied tip-off and a new owner submission")

    create_polling_place_with_a_denied_tip_off(pollingPlace, "Stall")

    create_owner_submission_stall(pollingPlace, "Stall")


def polling_place_with_no_stall_and_a_single_new_stall_owner_submission():
    pollingPlace = get_next_polling_place(
        "No stall and a single new stall owner submission"
    )

    create_owner_submission_stall(pollingPlace, "Stall")


def polling_place_with_no_stall_and_a_single_new_in_person_tip_off():
    pollingPlace = get_next_polling_place("No stall and a single new in-person tip-off")

    create_tipoff_stall(pollingPlace, StallTipOffSource.In_Person)


def polling_place_with_no_stall_and_two_new_tip_offs():
    pollingPlace = get_next_polling_place("No stall and two new tip-offs")

    create_tipoff_stall(pollingPlace, StallTipOffSource.Online)

    create_tipoff_stall(
        pollingPlace, StallTipOffSource.Other, "Saw it in the local newspaper"
    )


def polling_place_with_no_stall_and_a_single_new_in_person_tip_off_and_a_stall_owner_submission():
    pollingPlace = get_next_polling_place(
        "No stall and a single new in person tip-off and a stall owner submission"
    )

    create_tipoff_stall(pollingPlace, StallTipOffSource.In_Person)

    create_owner_submission_stall(pollingPlace, "Stall")


def polling_place_with_no_stall_and_a_single_new_newsletter_tip_off_and_two_stall_owner_submissions():
    pollingPlace = get_next_polling_place(
        "No stall and a single new newsletter tip-off and two stall owner submissions"
    )

    create_tipoff_stall(pollingPlace, StallTipOffSource.Newsletter)

    create_owner_submission_stall(pollingPlace, "Stall")
    create_owner_submission_stall(pollingPlace, "Stall")


def polling_place_with_no_stall_and_a_single_new_online_tip_off_that_has_pending_edits():
    pollingPlace = get_next_polling_place(
        "No stall and a single new online tip-off that has pending edits"
    )

    stall = create_tipoff_stall(pollingPlace, StallTipOffSource.Online)

    # Submit Stall Edit
    stallEdits = Stalls.objects.get(id=stall.id)
    stallEdits.status = StallStatus.PENDING
    stallEdits.owner_edit_timestamp = datetime.now(pytz.utc)
    stallEdits.noms = {
        "bbq": True,
        "cake": True,
        "coffee": True,
        "bacon_and_eggs": True,
        "free_text": "Donkey rides too!",
    }
    stallEdits.save()


def polling_place_with_with_an_approved_tip_off_and_a_new_newsletter_tip_off():
    pollingPlace = get_next_polling_place(
        "Approved tip-off and a new newsletter tip-off"
    )

    create_polling_place_with_an_approved_tip_off(
        pollingPlace, StallTipOffSource.Online
    )

    create_tipoff_stall(pollingPlace, StallTipOffSource.Newsletter)


def polling_place_with_with_an_approved_tip_off_and_a_new_stall_owner_submission():
    pollingPlace = get_next_polling_place(
        "Approved tip-off and a new stall owner submission"
    )

    create_polling_place_with_an_approved_tip_off(
        pollingPlace, StallTipOffSource.Other, "My kids told me"
    )

    create_owner_submission_stall(pollingPlace, "Stall")


def polling_place_with_with_an_approved_tip_off_that_has_pending_edits():
    pollingPlace = get_next_polling_place("Approved tip-off that has pending edits")

    stall = create_polling_place_with_an_approved_tip_off(
        pollingPlace, StallTipOffSource.Online
    )

    # Submit Stall Edit
    stallEdits = Stalls.objects.get(id=stall.id)
    stallEdits.status = StallStatus.PENDING
    stallEdits.owner_edit_timestamp = datetime.now(pytz.utc)
    stallEdits.noms = {
        "bbq": True,
        "halal": True,
    }
    stallEdits.save()


def polling_place_with_with_an_approved_tip_off_that_has_pending_edits_and_an_other_tip_off():
    pollingPlace = get_next_polling_place(
        "Approved tip-off that has pending edits and another tip off"
    )

    stall = create_polling_place_with_an_approved_tip_off(
        pollingPlace, StallTipOffSource.Online
    )

    # Submit Stall Edit
    stallEdits = Stalls.objects.get(id=stall.id)
    stallEdits.status = StallStatus.PENDING
    stallEdits.owner_edit_timestamp = datetime.now(pytz.utc)
    stallEdits.noms = {
        "cake": True,
    }
    stallEdits.save()

    create_tipoff_stall(pollingPlace, StallTipOffSource.Newsletter)


def polling_place_with_with_an_approved_tip_off_that_has_pending_edits_and_a_new_stall_owner_submission():
    pollingPlace = get_next_polling_place(
        "Approved tip-off that has pending edits and a new stall owner submission"
    )

    stall = create_polling_place_with_an_approved_tip_off(
        pollingPlace, StallTipOffSource.Online
    )

    # Submit Stall Edit
    stallEdits = Stalls.objects.get(id=stall.id)
    stallEdits.status = StallStatus.PENDING
    stallEdits.owner_edit_timestamp = datetime.now(pytz.utc)
    stallEdits.noms = {
        "coffee": True,
    }
    stallEdits.save()

    create_owner_submission_stall(pollingPlace, "Stall")


def polling_place_with_two_approved_owner_submissions_with_pending_edits_to_both():
    pollingPlace = get_next_polling_place(
        "Two approved owner submissions with pending edits to both"
    )

    stall1 = create_polling_place_with_an_approved_owner_submission_stall(
        pollingPlace, "Stall"
    )

    # Submit Stall Edit
    stall2Edits = Stalls.objects.get(id=stall1.id)
    stall2Edits.status = StallStatus.PENDING
    stall2Edits.owner_edit_timestamp = datetime.now(pytz.utc)
    stall2Edits.noms = {
        "cake": True,
    }
    stall2Edits.save()

    stall2 = create_polling_place_with_an_approved_owner_submission_stall(
        pollingPlace, "Stall"
    )

    # Submit Stall Edit
    stall2Edits = Stalls.objects.get(id=stall2.id)
    stall2Edits.status = StallStatus.PENDING
    stall2Edits.owner_edit_timestamp = datetime.now(pytz.utc)
    stall2Edits.noms = {
        "halal": True,
    }
    stall2Edits.save()


def polling_place_with_two_approved_owner_submissions_and_a_new_tip_off():
    pollingPlace = get_next_polling_place(
        "Two approved owner submissions and a new tip-off"
    )

    create_polling_place_with_an_approved_owner_submission_stall(pollingPlace, "Stall")
    create_polling_place_with_an_approved_owner_submission_stall(pollingPlace, "Stall")

    create_tipoff_stall(pollingPlace, StallTipOffSource.Newsletter)


def polling_place_with_an_approved_owner_submission_with_pending_edits_and_an_approved_tip_off():
    pollingPlace = get_next_polling_place(
        "Approved owner submission with pending edits and an approved tip-off"
    )

    create_polling_place_with_an_approved_tip_off(
        pollingPlace, StallTipOffSource.Online
    )

    stall = create_polling_place_with_an_approved_owner_submission_stall(
        pollingPlace, "Stall"
    )

    # Submit Stall Edit
    stallEdits = Stalls.objects.get(id=stall.id)
    stallEdits.status = StallStatus.PENDING
    stallEdits.owner_edit_timestamp = datetime.now(pytz.utc)
    stallEdits.noms = {
        "cake": True,
    }
    stallEdits.save()


def polling_place_with_an_approved_owner_submission_with_pending_edits_and_an_approved_owner_submission_and_a_new_owner_submission():
    pollingPlace = get_next_polling_place(
        "Approved owner submission with pending edits, approved owner submission, and a new owner submission"
    )

    stall = create_polling_place_with_an_approved_owner_submission_stall(
        pollingPlace, "Stall"
    )

    # Submit Stall Edit
    stallEdits = Stalls.objects.get(id=stall.id)
    stallEdits.status = StallStatus.PENDING
    stallEdits.owner_edit_timestamp = datetime.now(pytz.utc)
    stallEdits.name = "Something something"
    stallEdits.noms = {
        "vego": True,
    }
    stallEdits.save()

    create_polling_place_with_an_approved_owner_submission_stall(pollingPlace, "Stall")

    create_owner_submission_stall(pollingPlace, "Stall")


def polling_place_with_an_approved_owner_submission_and_an_approved_tip_off_and_a_new_owner_submission():
    pollingPlace = get_next_polling_place(
        "Approved owner submission, approved tip-off, and a new owner submission"
    )

    create_polling_place_with_an_approved_owner_submission_stall(pollingPlace, "Stall")

    create_polling_place_with_an_approved_tip_off(
        pollingPlace, StallTipOffSource.Online
    )

    create_owner_submission_stall(pollingPlace, "Stall")


def polling_place_with_no_stall_and_a_red_cross_of_shame_tip_off():
    pollingPlace = get_next_polling_place("No stall and a Red Cross of Shame tip-off")

    create_RCOS_tipoff_stall(pollingPlace, StallTipOffSource.In_Person)


def polling_place_with_with_an_approved_red_cross_of_shame_tip_off_and_a_new_owner_submission():
    pollingPlace = get_next_polling_place(
        "Approved Red Cross of Shame tip-off and a new stall owner submission"
    )

    create_polling_place_with_an_approved_RCOS_tip_off(
        pollingPlace, StallTipOffSource.In_Person
    )

    create_owner_submission_stall(pollingPlace, "Stall")


def polling_place_with_an_approved_owner_submission_and_a_new_red_cross_of_shame_tip_off():
    pollingPlace = get_next_polling_place(
        "Approved owner submission and a new Red Cross of Shame tip-off"
    )

    create_polling_place_with_an_approved_owner_submission_stall(pollingPlace, "Stall")

    create_RCOS_tipoff_stall(
        pollingPlace, StallTipOffSource.Other, "I came, I saw, I conquered"
    )


def polling_place_with_no_stall_and_a_run_out_tip_off():
    pollingPlace = get_next_polling_place("No stall and a run out tip-off")

    create_RunOut_tipoff_stall(pollingPlace, StallTipOffSource.In_Person)


def polling_place_with_with_an_approved_run_out_tip_off_and_a_new_owner_submission():
    pollingPlace = get_next_polling_place(
        "Approved run out tip-off and a new stall owner submission"
    )

    create_polling_place_with_an_approved_RunOut_tip_off(
        pollingPlace, StallTipOffSource.In_Person
    )

    create_owner_submission_stall(pollingPlace, "Stall")


def polling_place_with_an_approved_owner_submission_and_a_new_run_out_tip_off():
    pollingPlace = get_next_polling_place(
        "Approved owner submission and a new Run Out tip-off"
    )

    create_polling_place_with_an_approved_owner_submission_stall(pollingPlace, "Stall")

    create_RunOut_tipoff_stall(
        pollingPlace, StallTipOffSource.Other, "I came, I saw, I conquered"
    )


def unofficial_polling_place_owner_submission():
    create_unofficial_polling_place_owner_submission_stall(
        "One unofficial polling place owner submission", "Stall"
    )


def unofficial_polling_place_two_owner_submissions():
    create_unofficial_polling_place_owner_submission_stall(
        "Two unofficial polling place owner submissions", "Stall"
    )
    create_unofficial_polling_place_owner_submission_stall(
        "Two unofficial polling place owner submissions", "Stall"
    )


def unofficial_polling_place_tip_off():
    create_unofficial_polling_place_tipoff_stall(
        "Unofficial polling place tip-off", StallTipOffSource.Newsletter
    )


def unofficial_polling_place_two_tip_offs():
    create_unofficial_polling_place_tipoff_stall(
        "Unofficial polling place two tip-offs (IP)", StallTipOffSource.In_Person
    )
    create_unofficial_polling_place_tipoff_stall(
        "Unofficial polling place two tip-offs (OL)", StallTipOffSource.Online
    )


def unofficial_polling_place_red_cross_of_shame_tip_off():
    create_unofficial_polling_place_RCOS_tipoff_stall(
        "Unofficial polling place Red Cross of Shame tip-off",
        StallTipOffSource.Other,
        "Saw stuff, m8!",
    )


def unofficial_polling_place_run_out_tip_off():
    create_unofficial_polling_place_RunOut_tipoff_stall(
        "Unofficial polling place Run Out tip-off", StallTipOffSource.Online
    )


def unofficial_polling_place_owner_submission_approved_with_pending_edits():
    stall = create_unofficial_polling_place_with_an_approved_owner_submission_stall(
        "Approved unofficial polling place owner submission with pending edits", "Stall"
    )

    # Submit Stall Edit
    stallEdits = Stalls.objects.get(id=stall.id)
    stallEdits.status = StallStatus.PENDING
    stallEdits.owner_edit_timestamp = datetime.now(pytz.utc)
    stallEdits.description = "More info"
    stallEdits.noms = {
        "vego": True,
    }
    stallEdits.save()


def unofficial_polling_place_submission_approved_with_a_second_pending_owner_submission():
    create_unofficial_polling_place_with_an_approved_owner_submission_stall(
        "Approved unofficial polling place owner submission with a second pending owner submission",
        "Stall",
    )

    create_unofficial_polling_place_owner_submission_stall(
        "Approved unofficial polling place owner submission with a second owner submission",
        "Stall",
    )


def unofficial_polling_place_approved_tip_off_with_a_pending_owner_submisison():
    create_unofficial_polling_place_approved_tipoff_stall(
        "Approved unofficial polling place tip-off with a pending owner submission",
        StallTipOffSource.Online,
    )

    create_unofficial_polling_place_owner_submission_stall(
        "Approved unofficial polling place owner submission with a second owner submission",
        "Stall",
    )


def unofficial_polling_place_approved_red_cross_of_shame_tip_off_with_a_second_tip_off():
    create_unofficial_polling_place_approved_RCOS_tipoff_stall(
        "Approved unofficial polling place Red Cross of Shame tip-off with a pending tip-off",
        StallTipOffSource.Online,
    )

    create_unofficial_polling_place_tipoff_stall(
        "Approved unofficial polling place Red Cross of Shame tip-off with a pending tip-off",
        StallTipOffSource.Online,
    )


def unofficial_polling_place_approved_run_out_tip_off_with_a_second_tip_off():
    create_unofficial_polling_place_approved_RunOut_tipoff_stall(
        "Approved unofficial polling place Run Out tip-off with a pending tip-off",
        StallTipOffSource.Online,
    )

    create_unofficial_polling_place_tipoff_stall(
        "Approved unofficial polling place Run Out tip-off with a pending tip-off",
        StallTipOffSource.Newsletter,
    )


def unofficial_polling_place_run_out_approved_tip_off_with_a_new_owner_submission():
    create_unofficial_polling_place_approved_RunOut_tipoff_stall(
        "Approved unofficial polling place Run Out tip-off with a pending owner stall submission",
        StallTipOffSource.Online,
    )

    create_unofficial_polling_place_owner_submission_stall(
        "Approved unofficial polling place Run Out tip-off with a pending owner stall submission",
        "Stall",
    )


polling_place_with_an_approved_owner_submission_and_a_new_stall_owner_submission()
polling_place_with_an_approved_owner_submission_and_a_new_newsletter_tip_off()
polling_place_with_an_approved_owner_submission_that_has_pending_edits()
polling_place_with_an_approved_owner_submission_that_has_pending_edits_and_an_other_tip_off()
polling_place_with_an_approved_owner_submission_that_has_pending_edits_and_a_new_stall_owner_submission()
polling_place_with_an_approved_owner_submission_that_has_pending_edits_to_free_text_noms()

polling_place_with_a_denied_owner_submission_and_a_new_other_tip_off()
polling_place_with_a_denied_owner_submission_that_has_pending_edits()
polling_place_with_a_denied_owner_submission_that_has_pending_edits_and_a_new_online_tip_off()
polling_place_with_a_denied_tip_off_and_a_new_owner_submission()

polling_place_with_no_stall_and_a_single_new_stall_owner_submission()
polling_place_with_no_stall_and_a_single_new_in_person_tip_off()
polling_place_with_no_stall_and_two_new_tip_offs()
polling_place_with_no_stall_and_a_single_new_in_person_tip_off_and_a_stall_owner_submission()
polling_place_with_no_stall_and_a_single_new_newsletter_tip_off_and_two_stall_owner_submissions()
polling_place_with_no_stall_and_a_single_new_online_tip_off_that_has_pending_edits()

polling_place_with_with_an_approved_tip_off_and_a_new_newsletter_tip_off()
polling_place_with_with_an_approved_tip_off_and_a_new_stall_owner_submission()
polling_place_with_with_an_approved_tip_off_that_has_pending_edits()
polling_place_with_with_an_approved_tip_off_that_has_pending_edits_and_an_other_tip_off()
polling_place_with_with_an_approved_tip_off_that_has_pending_edits_and_a_new_stall_owner_submission()

polling_place_with_two_approved_owner_submissions_with_pending_edits_to_both()
polling_place_with_two_approved_owner_submissions_and_a_new_tip_off()
polling_place_with_an_approved_owner_submission_with_pending_edits_and_an_approved_tip_off()
polling_place_with_an_approved_owner_submission_with_pending_edits_and_an_approved_owner_submission_and_a_new_owner_submission()
polling_place_with_an_approved_owner_submission_and_an_approved_tip_off_and_a_new_owner_submission()

polling_place_with_no_stall_and_a_red_cross_of_shame_tip_off()
polling_place_with_with_an_approved_red_cross_of_shame_tip_off_and_a_new_owner_submission()
polling_place_with_an_approved_owner_submission_and_a_new_red_cross_of_shame_tip_off()

polling_place_with_no_stall_and_a_run_out_tip_off()
polling_place_with_with_an_approved_run_out_tip_off_and_a_new_owner_submission()
polling_place_with_an_approved_owner_submission_and_a_new_run_out_tip_off()

unofficial_polling_place_owner_submission()
unofficial_polling_place_two_owner_submissions()
unofficial_polling_place_tip_off()
unofficial_polling_place_two_tip_offs()
unofficial_polling_place_red_cross_of_shame_tip_off()
unofficial_polling_place_run_out_tip_off()

unofficial_polling_place_owner_submission_approved_with_pending_edits()
unofficial_polling_place_submission_approved_with_a_second_pending_owner_submission()
unofficial_polling_place_approved_tip_off_with_a_pending_owner_submisison()
unofficial_polling_place_approved_red_cross_of_shame_tip_off_with_a_second_tip_off()
unofficial_polling_place_run_out_approved_tip_off_with_a_new_owner_submission()
