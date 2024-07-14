import { NavigateFunction, Params } from 'react-router-dom';
import { getPollingPlacePermalinkFromProps } from '../../../features/pollingPlaces/pollingPlaceHelpers';
import { IPollingPlace } from '../../../features/pollingPlaces/pollingPlacesInterfaces';
import { IMapboxGeocodingAPIResponseFeature } from '../../../features/search/searchBarHelpers';
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

export const navigateToAddStallSearchListOfPollingPlacesFromMapboxResults = (
	params: Params<string>,
	navigate: NavigateFunction,
	searchTerm: string,
	lonLat: string,
) => {
	// We handle going to all of these routes:
	// /add-stall/:election_name/search/place/:search_term/:place_lon_lat/
	const { urlElectionName } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(`/add-stall/${urlElectionName}/search/place/${searchTerm}/${lonLat}/`, {
		state: { cameFromInternalNavigation: true },
	});
};

export const navigateToAddStallSearchDrawerAndInitiateGPSSearch = (
	params: Params<string>,
	navigate: NavigateFunction,
) => {
	// We handle going to all of these routes:
	// /add-stall/:election_name/search/gps/
	const { urlElectionName } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(`/add-stall/${urlElectionName}/search/gps/`);
};

export const navigateToAddStallSearchListOfPollingPlacesFromGPSSearch = (
	params: Params<string>,
	navigate: NavigateFunction,
	gpsLonLat: string,
) => {
	// We handle going to all of these routes:
	// /add-stall/:election_name/search/gps/:gps_lon_lat/
	const { urlElectionName } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(`/add-stall/${urlElectionName}/search/gps/${gpsLonLat}/`, {
		// Use replace here because otherwise we can't navigate back from the GPS search results.
		// Without replace, it just automatically retriggers another GPS search.
		// Since we're replacing, no need for cameFromInternalNavigation here.
		replace: true,
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

export const navigateToAddStallWhoIsSubmittingFromMapboxFeature = (
	params: Params<string>,
	navigate: NavigateFunction,
	feature: IMapboxGeocodingAPIResponseFeature,
) => {
	// We handle going to all of these routes:
	// /add-stall/:election_name/location/:location_name/:location_address/:location_state/:location_lon_lat/

	const { urlElectionName } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	const name = feature.text;
	const address = feature.place_name;
	const state = feature.context.find((i) => i.id.startsWith('region.') === true)?.text || 'Unknown';
	const lonlat = feature.geometry.coordinates.join(',');

	navigate(`/add-stall/${urlElectionName}/location/${name}/${address}/${state}/${lonlat}/`, {
		state: { cameFromInternalNavigation: true },
	});
};

export const navigateToAddStallWhoIsSubmittingFromURLParams = (params: Params<string>, navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /add-stall/:election_name/polling_places/:polling_place_name/:polling_place_premises/:polling_place_state/
	// /add-stall/:election_name/polling_places/:polling_place_name/:polling_place_state/
	// /add-stall/:election_name/location/:location_name/:location_address/:location_state/:location_lon_lat/
	const {
		urlElectionName,
		urlPollingPlaceName,
		urlPollingPlacePremises,
		urlPollingPlaceState,
		urlLocationName,
		urlLocationAddress,
		urlLocationState,
		urlLocationLonLat,
	} = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	if (
		urlPollingPlaceName !== undefined &&
		urlPollingPlacePremises !== undefined &&
		urlPollingPlaceState !== undefined
	) {
		navigate(
			`/add-stall${getPollingPlacePermalinkFromProps(urlElectionName, urlPollingPlaceName, urlPollingPlacePremises, urlPollingPlaceState)}`,
			{
				state: { cameFromInternalNavigation: true },
			},
		);
	} else if (
		urlLocationName !== undefined &&
		urlLocationAddress !== undefined &&
		urlLocationState !== undefined &&
		urlLocationLonLat !== undefined
	) {
		navigate(
			`/add-stall/${urlElectionName}/location/${urlLocationName}/${urlLocationAddress}/${urlLocationState}/${urlLocationLonLat}/`,
			{
				state: { cameFromInternalNavigation: true },
			},
		);
	}
};

export const navigateToAddStallForm = (
	params: Params<string>,
	navigate: NavigateFunction,
	submitterType: StallSubmitterType,
) => {
	// We handle going to all of these routes:
	// /add-stall/:election_name/polling_places/:polling_place_name/:polling_place_premises/:polling_place_state/submitter/:submitter_type/
	// /add-stall/:election_name/polling_places/:polling_place_name/:polling_place_state/submitter/:submitter_type/
	// /add-stall/:election_name/location/:location_name/:location_address/:location_state/:location_lon_lat/submitter/:submitter_type/
	const {
		urlElectionName,
		urlPollingPlaceName,
		urlPollingPlacePremises,
		urlPollingPlaceState,
		urlLocationName,
		urlLocationAddress,
		urlLocationState,
		urlLocationLonLat,
	} = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	if (
		urlPollingPlaceName !== undefined &&
		urlPollingPlacePremises !== undefined &&
		urlPollingPlaceState !== undefined
	) {
		navigate(
			`/add-stall${getPollingPlacePermalinkFromProps(urlElectionName, urlPollingPlaceName, urlPollingPlacePremises, urlPollingPlaceState)}submitter/${submitterType}/`,
			{
				state: { cameFromInternalNavigation: true },
			},
		);
	} else if (
		urlLocationName !== undefined &&
		urlLocationAddress !== undefined &&
		urlLocationState !== undefined &&
		urlLocationLonLat !== undefined
	) {
		navigate(
			`/add-stall/${urlElectionName}/location/${urlLocationName}/${urlLocationAddress}/${urlLocationState}/${urlLocationLonLat}/submitter/${submitterType}/`,
			{
				state: { cameFromInternalNavigation: true },
			},
		);
	}
};

export const navigateToAddStallSubmitted = (navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /add-stall/submitted/
	navigate('/add-stall/submitted/');
};
