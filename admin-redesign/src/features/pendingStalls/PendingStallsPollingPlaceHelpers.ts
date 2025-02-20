import type { PendingStall, StallFoodOptions, StallNonFoodOptions } from '../../app/services/stalls';
import type { IPollingPlaceStallModifiableProps } from '../pollingPlaces/pollingPlacesInterfaces';

export const isStallMergedWithPollingPlace = (
	stall: PendingStall,
	pollingPlaceStall: IPollingPlaceStallModifiableProps,
) => {
	// This is a quick and dirty merge check:
	// If the noms on the stall match the polling place, we'll consider the submission merged,

	let key: keyof (StallFoodOptions & StallNonFoodOptions);

	for (key in stall.noms) {
		const value = stall.noms[key];

		if (key === 'free_text') {
			if (pollingPlaceStall.noms[key] === undefined || pollingPlaceStall.noms[key] === '') {
				return false;
			}
		} else {
			if (pollingPlaceStall.noms[key] === undefined || pollingPlaceStall.noms[key] !== true) {
				return false;
			}
		}
	}

	// All of the noms have been applied, so we're good!
	return true;
};
