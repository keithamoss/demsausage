import { Feature, View } from 'ol';
import { NavigateFunction, Params, generatePath } from 'react-router-dom';
import { createMapViewURLPathComponent } from '../../features/map/mapHelpers';
import { getPollingPlacePermalinkFromProps } from '../../features/pollingPlaces/pollingPlaceHelpers';
import { IPollingPlace } from '../../features/pollingPlaces/pollingPlacesInterfaces';
import { Election } from '../services/elections';

const addComponentToEndOfURLPath = (urlPathBase: string, param: string | undefined) => {
	const urlPathBaseWithTrailingSlash = urlPathBase.endsWith('/') === true ? urlPathBase : `${urlPathBase}/`;
	return param === undefined ? urlPathBaseWithTrailingSlash : `${urlPathBaseWithTrailingSlash}${param}/`;
};

export const getURLParams = (params: Params<string>) => {
	return {
		urlElectionName: params.election_name,
		urlSearchTerm: params.search_term,
		urlLonLat: params.place_lon_lat,
		urlGPSLonLat: params.gps_lon_lat,
		urlPollingPlaceName: params.polling_place_name,
		urlPollingPlacePremises: params.polling_place_premises,
		urlPollingPlaceState: params.polling_place_state,
		urlPollingPlaceIds: params.polling_place_ids,
		urlMapLatLonZoom: params.map_lat_lon_zoom,
	};
};

export const addURLMapLatLonZoomToCurrentPathAndNavigateAndReplace = (
	params: Params<string>,
	navigate: NavigateFunction,
	lastMatchedRoutePath: string | undefined,
	view: View,
) => {
	if (lastMatchedRoutePath !== undefined) {
		const mapViewString = createMapViewURLPathComponent(view);

		if (mapViewString !== undefined) {
			const generatedPath = generatePath(lastMatchedRoutePath, {
				...params,
				map_lat_lon_zoom: mapViewString,
			});

			navigate(generatedPath.endsWith('/') === true ? generatedPath : `${generatedPath}/`, {
				state: { updateMapView: true },
				replace: true,
			});
		}
	}
};

export const navigateToElection = (navigate: NavigateFunction, election: Election, view: View) => {
	// We handle going to all of these routes:
	// /:election_name/

	const mapViewString = createMapViewURLPathComponent(view);

	if (mapViewString !== undefined) {
		navigate(`/${election.name_url_safe}/${mapViewString}/`, { state: { updateMapView: true } });
	}
};

export const navigateToElectionAndReplace = (navigate: NavigateFunction, election: Election, view: View) => {
	// We handle going to all of these routes:
	// /:election_name/

	const mapViewString = createMapViewURLPathComponent(view);

	if (mapViewString !== undefined) {
		navigate(`/${election.name_url_safe}/${mapViewString}/`, { state: { updateMapView: true }, replace: true });
	}
};

export const navigateToMapAndUpdateMapWithNewView = (
	params: Params<string>,
	navigate: NavigateFunction,
	view: View,
) => {
	const { urlElectionName } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	const mapViewString = createMapViewURLPathComponent(view);

	if (mapViewString !== undefined) {
		navigateToMap(params, navigate, mapViewString, { updateMapView: true });
	}
};

export const navigateToMapUsingURLParamsWithoutUpdatingTheView = (
	params: Params<string>,
	navigate: NavigateFunction,
) => {
	const { urlMapLatLonZoom } = getURLParams(params);

	if (urlMapLatLonZoom !== undefined) {
		navigateToMapWithoutUpdatingTheView(params, navigate, urlMapLatLonZoom);
	}
};

// Not passing `state` of `{ updateMapView: true }` means we don't update the map's view when the URL changes
export const navigateToMapWithoutUpdatingTheView = (
	params: Params<string>,
	navigate: NavigateFunction,
	mapLatLonZoom: string,
) => navigateToMap(params, navigate, mapLatLonZoom);

export const navigateToMap = (
	params: Params<string>,
	navigate: NavigateFunction,
	mapLatLonZoom: string,
	state?: object,
) => {
	// We handle going to all of these routes:
	// /:election_name/by_ids/:polling_place_ids/m/:map_lat_lon_zoom/
	// /:election_name/gps/:gps_lon_lat/m/:map_lat_lon_zoom/
	// /:election_name/place/:search_term/:place_lon_lat/m/:map_lat_lon_zoom/
	// /:election_name/place/:search_term/m/:map_lat_lon_zoom/
	// /:election_name/:map_lat_lon_zoom?/

	const { urlElectionName, urlSearchTerm, urlLonLat, urlGPSLonLat, urlPollingPlaceIds } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	if (urlPollingPlaceIds !== undefined) {
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/by_ids/${urlPollingPlaceIds}/`, `m/${mapLatLonZoom}`), {
			state,
		});
	} else if (urlGPSLonLat !== undefined) {
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/gps/${urlGPSLonLat}/`, `m/${mapLatLonZoom}`), {
			state,
		});
	} else if (urlSearchTerm !== undefined && urlLonLat !== undefined) {
		navigate(
			addComponentToEndOfURLPath(`/${urlElectionName}/place/${urlSearchTerm}/${urlLonLat}/`, `m/${mapLatLonZoom}`),
			{
				state,
			},
		);
	} else if (urlSearchTerm !== undefined) {
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/place/${urlSearchTerm}/`, `m/${mapLatLonZoom}`), {
			state,
		});
	} else {
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/`, mapLatLonZoom), {
			state,
		});
	}
};

export const navigateToSearchDrawerRoot = (params: Params<string>, navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /:election_name/search/m/:map_lat_lon_zoom/

	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/`, `m/${urlMapLatLonZoom}`));
};

export const navigateToSearchDrawer = (params: Params<string>, navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /:election_name/search/by_ids/:polling_place_ids/m/:map_lat_lon_zoom/
	// /:election_name/search/gps/:gps_lon_lat/m/:map_lat_lon_zoom/
	// /:election_name/search/place/:search_term/m/:map_lat_lon_zoom/
	// /:election_name/search/place/:search_term/:place_lon_lat/m/:map_lat_lon_zoom/
	// /:election_name/search/m/:map_lat_lon_zoom/

	const { urlElectionName, urlSearchTerm, urlLonLat, urlGPSLonLat, urlPollingPlaceIds, urlMapLatLonZoom } =
		getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	if (urlPollingPlaceIds !== undefined) {
		navigate(
			addComponentToEndOfURLPath(`/${urlElectionName}/search/by_ids/${urlPollingPlaceIds}/`, `m/${urlMapLatLonZoom}`),
			{
				state: { cameFromInternalNavigation: true },
			},
		);
	} else if (urlGPSLonLat !== undefined) {
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/gps/${urlGPSLonLat}/`, `m/${urlMapLatLonZoom}`), {
			state: { cameFromInternalNavigation: true },
		});
	} else if (urlSearchTerm !== undefined && urlLonLat !== undefined) {
		navigate(
			addComponentToEndOfURLPath(
				`/${urlElectionName}/search/place/${urlSearchTerm}/${urlLonLat}/`,
				`m/${urlMapLatLonZoom}`,
			),
			{
				state: { cameFromInternalNavigation: true },
			},
		);
	} else if (urlSearchTerm !== undefined) {
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/place/${urlSearchTerm}/`, `m/${urlMapLatLonZoom}`));
	} else {
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/`, `m/${urlMapLatLonZoom}`));
	}
};

export const navigateToSearchDrawerAndInitiateGPSSearch = (params: Params<string>, navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /:election_name/search/gps/m/:map_lat_lon_zoom/

	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/gps/`, `m/${urlMapLatLonZoom}`));
};

export const navigateToSearchListOfPollingPlacesFromGPSSearch = (
	params: Params<string>,
	navigate: NavigateFunction,
	gpsLonLat: string,
) => {
	// We handle going to all of these routes:
	// /:election_name/search/gps/:gps_lon_lat/m/:map_lat_lon_zoom/

	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/gps/${gpsLonLat}/`, `m/${urlMapLatLonZoom}`), {
		// Use replace here because otherwise we can't navigate back from the GPS search results.
		// Without replace, it just automatically retriggers another GPS search.
		// Since we're replacing, no need for cameFromInternalNavigation here.
		replace: true,
	});
};

export const navigateToSearchMapboxResults = (
	params: Params<string>,
	navigate: NavigateFunction,
	searchTerm: string,
) => {
	// We handle going to all of these routes:
	// /:election_name/search/place/:search_term/m/:map_lat_lon_zoom/

	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/place/${searchTerm}/`, `m/${urlMapLatLonZoom}`));
};

export const navigateToSearchListOfPollingPlacesFromMapboxResults = (
	params: Params<string>,
	navigate: NavigateFunction,
	searchTerm: string,
	lonLat: string,
) => {
	// We handle going to all of these routes:
	// /:election_name/search/place/:search_term/:place_lon_lat/m/:map_lat_lon_zoom/

	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(
		addComponentToEndOfURLPath(`/${urlElectionName}/search/place/${searchTerm}/${lonLat}/`, `m/${urlMapLatLonZoom}`),
		{
			state: { cameFromInternalNavigation: true },
		},
	);
};

export const navigateToSearchPollingPlacesByIds = (
	params: Params<string>,
	navigate: NavigateFunction,
	ids: number[],
) => {
	// We handle going to all of these routes:
	// //:election_name/search/by_ids/:polling_place_ids/m/:map_lat_lon_zoom/

	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/by_ids/${ids.join(',')}/`, `m/${urlMapLatLonZoom}`), {
		state: { cameFromInternalNavigation: true },
	});
};

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
		navigate(
			addComponentToEndOfURLPath(
				getPollingPlacePermalinkFromProps(urlElectionName, name, premises, state),
				`m/${urlMapLatLonZoom}`,
			),
			{ state: { cameFromInternalNavigation: true } },
		);
	}
};
