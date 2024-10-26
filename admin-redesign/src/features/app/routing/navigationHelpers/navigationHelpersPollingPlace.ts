import type { NavigateFunction, Params } from 'react-router-dom';
import { getURLParams } from '../../../../app/routing/navigationHelpers/navigationHelpers';
import type { IPollingPlace } from '../../../pollingPlaces/pollingPlacesInterfaces';

export const navigateToPollingPlaceEdit = (
	params: Params<string>,
	navigate: NavigateFunction,
	pollingPlace: IPollingPlace,
) => {
	// We handle going to all of these routes:
	// /:election_name/polling_places/:polling_place_id/
	const { id } = pollingPlace;

	const { urlElectionName } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	if (Number.isInteger(id) === true) {
		navigate(`/polling_places/${urlElectionName}/${id}/`);
	}
};
