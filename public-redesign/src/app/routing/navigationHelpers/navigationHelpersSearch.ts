import { NavigateFunction, Params } from 'react-router-dom';
import { addComponentToEndOfURLPath, getURLParams } from './navigationHelpers';

export const navigateToSearchDrawerRoot = (params: Params<string>, navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /:election_name/search/m/:map_lat_lon_zoom/
	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/`, `m/${urlMapLatLonZoom}`), {
		state: { cameFromInternalNavigation: true },
	});
};

export const navigateToSearchDrawerRootFromExternalToSearchBar = (
	params: Params<string>,
	navigate: NavigateFunction,
) => {
	// We handle going to all of these routes:
	// /:election_name/search/m/:map_lat_lon_zoom/
	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/`, `m/${urlMapLatLonZoom}`), {
		state: { cameFromInternalNavigation: false },
	});
};

export const navigateToSearchDrawerFromExternalToSearchBar = (params: Params<string>, navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /:election_name/search/gps/:gps_lon_lat/m/:map_lat_lon_zoom/
	// /:election_name/search/place/:search_term/m/:map_lat_lon_zoom/
	// /:election_name/search/place/:search_term/:place_lon_lat/m/:map_lat_lon_zoom/
	// /:election_name/search/m/:map_lat_lon_zoom/
	const { urlElectionName, urlSearchTerm, urlLonLat, urlGPSLonLat, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	if (urlGPSLonLat !== undefined) {
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/gps/${urlGPSLonLat}/`, `m/${urlMapLatLonZoom}`), {
			state: { cameFromInternalNavigation: false },
		});
	} else if (urlSearchTerm !== undefined && urlLonLat !== undefined) {
		navigate(
			addComponentToEndOfURLPath(
				`/${urlElectionName}/search/place/${urlSearchTerm}/${urlLonLat}/`,
				`m/${urlMapLatLonZoom}`,
			),
			{
				state: { cameFromInternalNavigation: false },
			},
		);
	} else if (urlSearchTerm !== undefined) {
		navigate(
			addComponentToEndOfURLPath(`/${urlElectionName}/search/place/${urlSearchTerm}/`, `m/${urlMapLatLonZoom}`),
			{
				state: { cameFromInternalNavigation: false },
			},
		);
	} else {
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/`, `m/${urlMapLatLonZoom}`), {
			state: { cameFromInternalNavigation: false },
		});
	}
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

	navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/place/${searchTerm}/`, `m/${urlMapLatLonZoom}`), {
		state: { cameFromInternalNavigation: true },
	});
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

export const navigateToSearchDrawerAndInitiateGPSSearch = (params: Params<string>, navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /:election_name/search/gps/m/:map_lat_lon_zoom/
	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/gps/`, `m/${urlMapLatLonZoom}`), {
		state: { cameFromInternalNavigation: true },
	});
};

export const navigateToSearchDrawerAndInitiateGPSSearchFromExternalToSearchBar = (
	params: Params<string>,
	navigate: NavigateFunction,
) => {
	// We handle going to all of these routes:
	// /:election_name/search/gps/m/:map_lat_lon_zoom/
	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/gps/`, `m/${urlMapLatLonZoom}`), {
		state: { cameFromInternalNavigation: false },
	});
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
		state: { cameFromInternalNavigation: true },
	});
};

export const navigateToSearchPollingPlacesByIds = (
	params: Params<string>,
	navigate: NavigateFunction,
	ids: number[],
) => {
	// We handle going to all of these routes:
	// /:election_name/search/by_ids/:polling_place_ids/m/:map_lat_lon_zoom/
	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/by_ids/${ids.join(',')}/`, `m/${urlMapLatLonZoom}`), {
		state: { cameFromInternalNavigation: false },
	});
};
