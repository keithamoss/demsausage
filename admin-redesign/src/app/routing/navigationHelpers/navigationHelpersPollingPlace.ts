import type { NavigateFunction, Params } from 'react-router-dom';
import type { IPollingPlace } from '../../../features/pollingPlaces/pollingPlacesInterfaces';
import type { Election } from '../../services/elections';
import { getURLParams } from './navigationHelpers';

export const navigateToPollingPlaceSearch = (params: Params<string>, navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /polling-places/:election_name/
	const { urlElectionName } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(`/polling-places/${urlElectionName}/`);
};

export const navigateToPollingPlaceSearchFromElection = (navigate: NavigateFunction, election: Election) => {
	// We handle going to all of these routes:
	// /polling-places/:election_name/

	navigate(`/polling-places/${election.name_url_safe}/`);
};

export const navigateToPollingPlaceSearchResults = (
	params: Params<string>,
	navigate: NavigateFunction,
	searchTerm: string,
) => {
	// We handle going to all of these routes:
	// /polling-places/:election_name/search/:search_term/
	const { urlElectionName } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(`/polling-places/${urlElectionName}/search/${searchTerm}/`);
};

export const navigateToPollingPlaceSearchResultsFromURLSearchTerm = (
	params: Params<string>,
	navigate: NavigateFunction,
) => {
	// We handle going to all of these routes:
	// /polling-places/:election_name/search/:search_term/
	const { urlElectionName, urlSearchTerm } = getURLParams(params);

	if (urlElectionName === undefined || urlSearchTerm === undefined) {
		return;
	}

	// Disable auto focus so when coming from the 'Back' button on PollingPlaceNomsEditor (i.e. we just want to show them their list of search results again)
	navigate(`/polling-places/${urlElectionName}/search/${urlSearchTerm}/`, { state: { disableAutoFocus: true } });
};

export const navigateToPollingPlaceEditorForm = (
	params: Params<string>,
	navigate: NavigateFunction,
	pollingPlace: IPollingPlace,
) => {
	// We handle going to all of these routes:
	// /polling-places/:election_name/search/:search_term/:polling_place_id/
	const { id } = pollingPlace;

	const { urlElectionName, urlSearchTerm } = getURLParams(params);

	if (urlElectionName === undefined || urlSearchTerm === undefined) {
		return;
	}

	if (Number.isInteger(id) === true) {
		navigate(`/polling-places/${urlElectionName}/search/${urlSearchTerm}/${id}/`);
	}
};

export const navigateToPollingPlaceHistory = (
	params: Params<string>,
	navigate: NavigateFunction,
	pollingPlace: IPollingPlace,
) => {
	// We handle going to all of these routes:
	// /polling-places/:election_name/search/:search_term/:polling_place_id/history/
	const { id } = pollingPlace;

	const { urlElectionName, urlSearchTerm } = getURLParams(params);

	if (urlElectionName === undefined || urlSearchTerm === undefined) {
		return;
	}

	if (Number.isInteger(id) === true) {
		navigate(`/polling-places/${urlElectionName}/search/${urlSearchTerm}/${id}/history/`);
	}
};

export const navigateToPollingPlaceStalls = (
	params: Params<string>,
	navigate: NavigateFunction,
	pollingPlace: IPollingPlace,
) => {
	// We handle going to all of these routes:
	// /polling-places/:election_name/search/:search_term/:polling_place_id/stalls/
	const { id } = pollingPlace;

	const { urlElectionName, urlSearchTerm } = getURLParams(params);

	if (urlElectionName === undefined || urlSearchTerm === undefined) {
		return;
	}

	if (Number.isInteger(id) === true) {
		navigate(`/polling-places/${urlElectionName}/search/${urlSearchTerm}/${id}/stalls/`);
	}
};
