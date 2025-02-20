import { type PendingStall, type PollingPlaceWithPendingStall, StallSubmitterType } from '../../app/services/stalls';
import { isStallATipOff } from '../pollingPlaces/pollingPlaceStallsHelpers';

export const isApproveAndMergeAutomaticallyAllowed = (
	stall: PendingStall,
	pollingPlace: PollingPlaceWithPendingStall,
) => {
	// Business rules:
	// 1. DON'T allow automatic merging for polling places that already have a Red Cross of Shame or Run Out (due to their complexity)
	// 2. DON'T allow automatic merging of 'Stall Owner' submissions when there is already another 'Stall Owner' submission (humans need to handle this manually)
	// 3. DON'T allow automatic merging for an edited submission (humans need to handle this manually)
	// 4. DO allow automatic merging when there is 1 'Stall Owner' submission and 1 or more 'Tip-off Submissions'

	// Polling places with RCOS or Run Out need more careful human attention
	if (pollingPlace.stall?.noms.nothing === true || pollingPlace.stall?.noms.run_out === true) {
		return false;
	}

	// Allow unedited Tip-off Submissions
	if (isStallATipOff(stall) === true && stall.triaged_on === null) {
		return true;
	}

	// Allow unedited Owner Submissions...
	if (stall.submitter_type === StallSubmitterType.Owner && stall.triaged_on === null) {
		// if there isn't already an approved, or edited and previously approved, Owner Submission
		if ('previous_subs' in pollingPlace && pollingPlace.previous_subs.approved_owner_subs === 0) {
			return true;
		}

		// if there isn't already either another pending Owner Submission
		// if (
		// 	'pending_stalls' in pollingPlace &&
		// 	pollingPlace.pending_stalls.filter((s) => s.submitter_type === StallSubmitterType.Owner && s.id !== stall.id)
		// 		.length === 0
		// ) {
		// 	return true;
		// }
	}

	// For all else, deny
	return false;
};

export const getWhyApproveAndMergeAutomaticallyNotAllowed = (
	stall: PendingStall,
	pollingPlace: PollingPlaceWithPendingStall,
) => {
	// "Automatic merging has been disabled because...""

	// The polling place has an RCOS or...
	if (pollingPlace.stall?.noms.nothing === true) {
		return 'this submission has a Red Cross of Shame.';
	}

	// ...has been flaged as run out
	if (pollingPlace.stall?.noms.run_out === true) {
		return 'this submission has already been flagged as having run out of food.';
	}

	// It's an edited submission
	if (stall.triaged_on !== null) {
		return 'this submission has been edited.';
	}

	// It's an edited Owner Submission and...
	if (stall.submitter_type === StallSubmitterType.Owner) {
		// There is already another approved 'Stall Owner' submission
		if ('previous_subs' in pollingPlace && pollingPlace.previous_subs.approved_owner_subs !== 0) {
			return 'there is already another approved owner submission.';
		}

		// There is already another pending 'Stall Owner' submission
		// if (
		// 	'pending_stalls' in pollingPlace &&
		// 	pollingPlace.pending_stalls.filter((s) => s.submitter_type === StallSubmitterType.Owner && s.id !== stall.id)
		// 		.length !== 0
		// ) {
		// 	return 'there is another pending owner submission.';
		// }
	}

	if (isApproveAndMergeAutomaticallyAllowed(stall, pollingPlace) === false) {
		return 'UNKNOWN_REASON';
	}
	return undefined;
};
