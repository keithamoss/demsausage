import { NavigateFunction, Params } from 'react-router-dom';
import { getPollingPlacePermalinkFromProps } from '../../../features/pollingPlaces/pollingPlaceHelpers';
import { IPollingPlace } from '../../../features/pollingPlaces/pollingPlacesInterfaces';
import { Election } from '../../services/elections';
import { StallSubmitterType } from '../../services/stalls';
import { getURLParams } from './navigationHelpers';

export const navigateToAddStallRoot = (navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /add-stall/
	navigate('/add-stall/', {
		state: { cameFromInternalNavigation: true },
	});
};

export const navigateToAddStallSearchMapboxResults = (
	params: Params<string>,
	navigate: NavigateFunction,
	searchTerm: string,
) => {
	// We handle going to all of these routes:
	// /add-stall/:election_name/search/place/:search_term/
	const { urlElectionName } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(`/add-stall/${urlElectionName}/search/place/${searchTerm}/`, {
		state: { cameFromInternalNavigation: true },
	});
};

export const navigateToAddStallSelectPollingPlace = (params: Params<string>, navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /add-stall/:election_name/
	const { urlElectionName } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(`/add-stall/${urlElectionName}/`, {
		state: { cameFromInternalNavigation: true },
	});
};

export const navigateToAddStallSelectPollingPlaceFromElection = (navigate: NavigateFunction, election: Election) => {
	// We handle going to all of these routes:
	// /add-stall/:election_name/
	navigate(`/add-stall/${election.name_url_safe}/`, {
		state: { cameFromInternalNavigation: true },
	});
};

export const navigateToAddStallSelectPollingPlaceFromElectionAndReplace = (
	navigate: NavigateFunction,
	election: Election,
) => {
	// We handle going to all of these routes:
	// /add-stall/:election_name/
	navigate(`/add-stall/${election.name_url_safe}/`, {
		state: { replace: true },
	});
};

export const navigateToAddStallWhoIsSubmitting = (
	params: Params<string>,
	navigate: NavigateFunction,
	pollingPlace: IPollingPlace,
) => {
	// We handle going to all of these routes:
	// /add-stall/:election_name/polling_places/:polling_place_name/:polling_place_premises/:polling_place_state/
	// /add-stall/:election_name/polling_places/:polling_place_name/:polling_place_state/
	const { name, premises, state } = pollingPlace;

	const { urlElectionName } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	if (typeof name === 'string' && typeof premises === 'string' && typeof state === 'string') {
		navigate(`/add-stall${getPollingPlacePermalinkFromProps(urlElectionName, name, premises, state)}`, {
			state: { cameFromInternalNavigation: true },
		});
	}
};

export const navigateToAddStallWhoIsSubmittingFromURLParams = (params: Params<string>, navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /add-stall/:election_name/polling_places/:polling_place_name/:polling_place_premises/:polling_place_state/
	// /add-stall/:election_name/polling_places/:polling_place_name/:polling_place_state/
	const { urlElectionName, urlPollingPlaceName, urlPollingPlacePremises, urlPollingPlaceState } = getURLParams(params);

	if (
		urlElectionName === undefined ||
		urlPollingPlaceName === undefined ||
		urlPollingPlacePremises === undefined ||
		urlPollingPlaceState === undefined
	) {
		return;
	}

	navigate(
		`/add-stall${getPollingPlacePermalinkFromProps(urlElectionName, urlPollingPlaceName, urlPollingPlacePremises, urlPollingPlaceState)}`,
		{
			state: { cameFromInternalNavigation: true },
		},
	);
};

export const navigateToAddStallForm = (
	params: Params<string>,
	navigate: NavigateFunction,
	submitterType: StallSubmitterType,
) => {
	// We handle going to all of these routes:
	// /add-stall/:election_name/polling_places/:polling_place_name/:polling_place_premises/:polling_place_state/submitter/:submitter_type/
	// /add-stall/:election_name/polling_places/:polling_place_name/:polling_place_state/submitter/:submitter_type/
	const { urlElectionName, urlPollingPlaceName, urlPollingPlacePremises, urlPollingPlaceState } = getURLParams(params);

	if (
		urlElectionName === undefined ||
		urlPollingPlaceName === undefined ||
		urlPollingPlacePremises === undefined ||
		urlPollingPlaceState === undefined
	) {
		return;
	}

	navigate(
		`/add-stall${getPollingPlacePermalinkFromProps(urlElectionName, urlPollingPlaceName, urlPollingPlacePremises, urlPollingPlaceState)}submitter/${submitterType}/`,
		{
			state: { cameFromInternalNavigation: true },
		},
	);
};

export const navigateToAddStallSubmitted = (navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /add-stall/submitted/
	navigate('/add-stall/submitted/');
};
