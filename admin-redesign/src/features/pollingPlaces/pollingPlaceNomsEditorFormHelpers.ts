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
	const setValueIfPresent = (field: keyof IPollingPlaceStallModifiableProps, value: string | undefined) => {
		if (value !== undefined && value !== '') {
			setValue(field, value, { shouldDirty: true });
		}
	};

	if (isEmpty(stall.noms) === false) {
		// If the stall is setting a Red Cross of Shame, wipe out everything else
		if (stall.noms.nothing === true) {
			setValue('noms', { nothing: true }, { shouldDirty: true });
			setValue('name', '');
			setValue('description', '');
			setValue('opening_hours', '');
			setValue('website', '');
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
