import type { Feature } from 'ol';
import type { NavigateFunction, Params } from 'react-router-dom';
import { getPollingPlacePermalinkFromProps } from '../../../features/pollingPlaces/pollingPlaceHelpers';
import type { IPollingPlace } from '../../../features/pollingPlaces/pollingPlacesInterfaces';
import { addComponentToEndOfURLPath, getURLParams } from './navigationHelpers';

export const navigateToPollingPlaceFromFeature = (
	params: Params<string>,
	navigate: NavigateFunction,
	feature: Feature,
) => {
	// We handle going to all of these routes:
	// /:election_name/polling_places/:polling_place_name/:polling_place_premises/:polling_place_state/m?/:map_lat_lon_zoom?/
	// /:election_name/polling_places/:polling_place_name/:polling_place_state/m?/:map_lat_lon_zoom?/
	const { name, premises, state } = feature.getProperties();

	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	if (typeof name === 'string' && typeof premises === 'string' && typeof state === 'string') {
		navigate(
			addComponentToEndOfURLPath(
				getPollingPlacePermalinkFromProps(urlElectionName, name, premises, state),
				`m/${urlMapLatLonZoom}`,
			),
			{ state: { cameFromInternalNavigation: true } },
		);
	}
};

export const navigateToPollingPlace = (
	params: Params<string>,
	navigate: NavigateFunction,
	pollingPlace: IPollingPlace,
) => {
	// We handle going to all of these routes:
	// /:election_name/polling_places/:polling_place_name/:polling_place_premises/:polling_place_state/m?/:map_lat_lon_zoom?/
	// /:election_name/polling_places/:polling_place_name/:polling_place_state/m?/:map_lat_lon_zoom?/
	const { name, premises, state } = pollingPlace;

	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	if (typeof name === 'string' && typeof premises === 'string' && typeof state === 'string') {
		if (urlMapLatLonZoom !== undefined) {
			navigate(
				addComponentToEndOfURLPath(
					getPollingPlacePermalinkFromProps(urlElectionName, name, premises, state),
					`m/${urlMapLatLonZoom}`,
				),
				{ state: { cameFromInternalNavigation: true } },
			);
		} else {
			// Used by StallPermalink to come in from outside (e.g. stall approval emails), look up a stall, and redirect us to the PollingPlaceCardDrawer without knowing the map MapLatLonZoom.
			// map.tsx handles attaching the election's default MapLatLonZoom for us.
			navigate(getPollingPlacePermalinkFromProps(urlElectionName, name, premises, state), {
				state: { cameFromInternalNavigation: true },
			});
		}
	}
};
