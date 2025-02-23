import { isEmpty } from 'lodash-es';
import type { UseFormSetValue } from 'react-hook-form';
import type { PendingStall, PollingPlaceWithPendingStall } from '../../app/services/stalls';
import type { IPollingPlace, IPollingPlaceStallModifiableProps } from './pollingPlacesInterfaces';

export const getNomsFormDefaultValues = (pollingPlace: IPollingPlace | PollingPlaceWithPendingStall) => ({
	// Important: If we ever add new stall fields here, be sure to update below as well
	noms: pollingPlace.stall?.noms || {},
	name: pollingPlace.stall?.name || '',
	description: pollingPlace.stall?.description || '',
	opening_hours: pollingPlace.stall?.opening_hours || '',
	website: pollingPlace.stall?.website || '',
	extra_info: pollingPlace.stall?.extra_info || '',
	source: pollingPlace.stall?.source || '',
	favourited: pollingPlace.stall?.favourited || false,
});

export const mergeStallWithPollingPlaceFormNomsAndUpdateForm = (
	stall: PendingStall,
	pollingPlace: PollingPlaceWithPendingStall,
	setValue: UseFormSetValue<IPollingPlaceStallModifiableProps>,
) => {
	// Scenario 1: Automatically merging a regular submission
	// - Each food and drink choice in the submission is added to the booth.
	// - If the booth already has a food and drink choice, but the submission doesn't include it, it stays on the booth.
	//
	// - Other fields:
	//   - If the submission includes a 'stall name', add it to the booth. If the booth already has the 'stall name' set, this overwrites it.
	//   - If the submission includes a 'stall description', add it to the booth. If the booth already has the 'stall description' set, this overwrites it.
	//   - If the submission includes a 'opening hours', add it to the booth. If the booth already has the 'opening hours' set, this overwrites it.
	//   - If the submission includes a 'website', add it to the booth. If the booth already has the 'website' set, this overwrites it.
	//
	// Scenario 2: Merging a Red Cross of Shame submission
	// - Remove all food and drink choices from the booth
	// - Set a Red Cross of Shame
	// - Remove any stall name, description, opening hours, or website information from the booth
	//
	// Scenario 3: Merging a submission where the booth already has a Red Cross of Shame
	// - Remove the Red Cross of Shame
	// - Set the food and drink choices from the submsision (as above)
	// - Set the stall name, description, opening hours, or website information based on the submission (as above)

	const setValueIfPresent = (field: keyof IPollingPlaceStallModifiableProps, value: string | undefined) => {
		if (value !== undefined && value !== '') {
			setValue(field, value, { shouldDirty: true });
		}
	};

	if (isEmpty(stall.noms) === false) {
		// If the stall is setting a Red Cross of Shame, wipe out everything else
		if (stall.noms.nothing === true) {
			setValue('noms', { nothing: true }, { shouldDirty: true });
			setValue('name', '', { shouldDirty: true });
			setValue('description', '', { shouldDirty: true });
			setValue('opening_hours', '', { shouldDirty: true });
			setValue('website', '', { shouldDirty: true });
		} else {
			// If the polling place already has a Red Cross of Shame, but the stall doesn't, remove the RCOS
			if (pollingPlace.stall?.noms.nothing === true && stall.noms.nothing === undefined) {
				setValue(
					'noms',
					{ ...(pollingPlace.stall?.noms || {}), ...stall.noms, nothing: undefined },
					{ shouldDirty: true },
				);
			} else {
				// Otherwise, just merge the stall's noms over the top of the polling place
				setValue('noms', { ...(pollingPlace.stall?.noms || {}), ...stall.noms }, { shouldDirty: true });
			}

			setValueIfPresent('name', stall.name);
			setValueIfPresent('description', stall.description);
			setValueIfPresent('opening_hours', stall.opening_hours);
			setValueIfPresent('website', stall.website);
		}
	}

	// Note: extra_info, source, and favourited are not here because users can't submit that info. Only admins can set it.
};
