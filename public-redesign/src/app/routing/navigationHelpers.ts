import { Feature, View } from 'ol';
import { NavigateFunction, Params } from 'react-router-dom';
import { createMapViewURLPathComponent } from '../../features/map/mapHelpers';
import { getPollingPlacePermalinkFromProps } from '../../features/pollingPlaces/pollingPlaceHelpers';
import { IPollingPlace } from '../../features/pollingPlaces/pollingPlacesInterfaces';

const addComponentToEndOfURLPath = (urlPathBase: string, param: string | undefined) => {
	const urlPathBaseWithTrailingSlash = urlPathBase.endsWith('/') === true ? urlPathBase : `${urlPathBase}/`;
	return param === undefined ? urlPathBaseWithTrailingSlash : `${urlPathBaseWithTrailingSlash}${param}/`;
};

export const getURLParams = (params: Params<string>) => {
	return {
		urlElectionName: params.election_name,
		urlSearchTerm: params.search_term,
		urlLonLat: params.lon_lat,
		urlGPSLonLat: params.gps_lon_lat,
		urlPollingPlaceName: params.polling_place_name,
		urlPollingPlacePremises: params.polling_place_premises,
		urlPollingPlaceState: params.polling_place_state,
		urlMapLatLonZoom: params.map_lat_lon_zoom,
	};
};

export const navigateToMapWithNewView = (params: Params<string>, navigate: NavigateFunction, view: View) => {
	// We handle going to all of these routes:
	// /:election_name/gps/:gps_lon_lat/:map_lat_lon_zoom?/
	// /:election_name/place/:search_term/:lon_lat/:map_lat_lon_zoom?/
	// /:election_name/place/:search_term/:map_lat_lon_zoom?/
	// /:election_name/:map_lat_lon_zoom?/

	const { urlElectionName } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	const mapViewString = createMapViewURLPathComponent(view);

	if (mapViewString !== undefined) {
		navigateToMap(params, navigate, mapViewString);
	}
};

export const navigateToMapUsingURLParams = (params: Params<string>, navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /:election_name/gps/:gps_lon_lat/:map_lat_lon_zoom?/
	// /:election_name/place/:search_term/:lon_lat/:map_lat_lon_zoom?/
	// /:election_name/place/:search_term/:map_lat_lon_zoom?/
	// /:election_name/:map_lat_lon_zoom?/

	const { urlMapLatLonZoom } = getURLParams(params);

	if (urlMapLatLonZoom !== undefined) {
		navigateToMap(params, navigate, urlMapLatLonZoom);
	}
};

const navigateToMap = (params: Params<string>, navigate: NavigateFunction, mapLatLonZoom: string) => {
	// We handle going to all of these routes:
	// /:election_name/gps/:gps_lon_lat/:map_lat_lon_zoom?/
	// /:election_name/place/:search_term/:lon_lat/:map_lat_lon_zoom?/
	// /:election_name/place/:search_term/:map_lat_lon_zoom?/
	// /:election_name/:map_lat_lon_zoom?/

	const { urlElectionName, urlSearchTerm, urlLonLat, urlGPSLonLat } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	if (urlGPSLonLat !== undefined) {
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/gps/${urlGPSLonLat}/`, mapLatLonZoom));
	} else if (urlSearchTerm !== undefined && urlLonLat !== undefined) {
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/place/${urlSearchTerm}/${urlLonLat}/`, mapLatLonZoom));
	} else if (urlSearchTerm !== undefined) {
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/place/${urlSearchTerm}/`, mapLatLonZoom));
	} else {
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/`, mapLatLonZoom));
	}
};

export const navigateToSearchDrawerRoot = (params: Params<string>, navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /:election_name/search/:map_lat_lon_zoom?/

	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/`, urlMapLatLonZoom));
};

export const navigateToSearchListOfPollingPlacesFromSearchTerm = (
	params: Params<string>,
	navigate: NavigateFunction,
	searchTerm: string,
) => {
	// We handle going to all of these routes:
	// /:election_name/search/location/:search_term/:map_lat_lon_zoom?/

	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/location/${searchTerm}/`, urlMapLatLonZoom), {
		state: { cameFromSearchDrawerOrMap: true },
	});
};

export const navigateToSearchListOfPollingPlacesFromSearchTermAndLonLat = (
	params: Params<string>,
	navigate: NavigateFunction,
	searchTerm: string,
	lonLat: string,
) => {
	// We handle going to all of these routes:
	// /:election_name/search/location/:search_term/:map_lat_lon_zoom?/

	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(
		addComponentToEndOfURLPath(`/${urlElectionName}/search/location/${searchTerm}/${lonLat}/`, urlMapLatLonZoom),
		{
			state: { cameFromSearchDrawerOrMap: true },
		},
	);
};

export const navigateToSearchListOfPollingPlacesFromGPSSearch = (
	params: Params<string>,
	navigate: NavigateFunction,
	gpsLonLat: string,
) => {
	// We handle going to all of these routes:
	// /:election_name/search/gps/:gps_lon_lat/:map_lat_lon_zoom?/

	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/gps/${gpsLonLat}/`, urlMapLatLonZoom), {
		state: { cameFromSearchDrawerOrMap: true },
	});
};

export const navigateToSearchDrawer = (params: Params<string>, navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /:election_name/search/gps/:gps_lon_lat/:map_lat_lon_zoom?/
	// /:election_name/search/location/:search_term/:map_lat_lon_zoom?/
	// /:election_name/search/location/:search_term/:lon_lat/:map_lat_lon_zoom?/
	// /:election_name/search/:map_lat_lon_zoom?/

	const { urlElectionName, urlSearchTerm, urlLonLat, urlGPSLonLat, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	if (urlGPSLonLat !== undefined) {
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/gps/${urlGPSLonLat}/`, urlMapLatLonZoom), {
			state: { cameFromSearchDrawerOrMap: true },
		});
	} else if (urlSearchTerm !== undefined && urlLonLat !== undefined) {
		navigate(
			addComponentToEndOfURLPath(
				`/${urlElectionName}/search/location/${urlSearchTerm}/${urlLonLat}/`,
				urlMapLatLonZoom,
			),
			{
				state: { cameFromSearchDrawerOrMap: true },
			},
		);
	} else if (urlSearchTerm !== undefined) {
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/location/${urlSearchTerm}/`, urlMapLatLonZoom));
	} else {
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/`, urlMapLatLonZoom));
	}
};

export const navigateToPollingPlacesByIds = (params: Params<string>, navigate: NavigateFunction, ids: number[]) => {
	// We handle going to all of these routes:
	// //:election_name/search/by_ids/:polling_place_ids/

	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(addComponentToEndOfURLPath(`/${urlElectionName}/search/by_ids/${ids.join(',')}/`, urlMapLatLonZoom), {
		state: { cameFromSearchDrawerOrMap: true },
	});
};

export const navigateToPollingPlaceFromFeature = (
	params: Params<string>,
	navigate: NavigateFunction,
	feature: Feature,
) => {
	// We handle going to all of these routes:
	// /:election_name/polling_places/:polling_place_name/:polling_place_premises/:polling_place_state/
	// /:election_name/polling_places/:polling_place_name/:polling_place_state/

	const { name, premises, state } = feature.getProperties();

	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	if (typeof name === 'string' && typeof premises === 'string' && typeof state === 'string') {
		navigate(
			addComponentToEndOfURLPath(
				getPollingPlacePermalinkFromProps(urlElectionName, name, premises, state),
				urlMapLatLonZoom,
			),
			{ state: { cameFromSearchDrawerOrMap: true } },
		);
	}
};

export const navigateToPollingPlace = (
	params: Params<string>,
	navigate: NavigateFunction,
	pollingPlace: IPollingPlace,
) => {
	// We handle going to all of these routes:
	// /:election_name/polling_places/:polling_place_name/:polling_place_premises/:polling_place_state/
	// /:election_name/polling_places/:polling_place_name/:polling_place_state/

	const { name, premises, state } = pollingPlace;

	const { urlElectionName, urlMapLatLonZoom } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	if (typeof name === 'string' && typeof premises === 'string' && typeof state === 'string') {
		navigate(
			addComponentToEndOfURLPath(
				getPollingPlacePermalinkFromProps(urlElectionName, name, premises, state),
				urlMapLatLonZoom,
			),
			{ state: { cameFromSearchDrawerOrMap: true } },
		);
	}
};

// This was an experiment to build our own "Pass a template URL and we'll insert the relevant params if they exist"
// Abandoned because further logic was required to skip parameters, so going the full declarative approach
// seen in this file was more reliable, involved less magic, and was aligned to the declarative
// approach taken in routes.tsx
// const buildURL = (params: Params<string>, template: string) => {
// 	console.log('params', params);
// 	console.log('template', template);
// 	let url = template;

// 	for (const match of template.matchAll(/\/?:(?<param_name>[a-zA-Z_]+)\??\/?/g)) {
// 		console.log('match', match.groups?.param_name);
// 		if (match.groups?.param_name !== undefined) {
// 			console.log(
// 				'replace',
// 				match.groups?.param_name,
// 				'with',
// 				getStringParamOrEmptyString(params, match.groups.param_name),
// 			);
// 			url = url.replace(`:${match.groups?.param_name}`, getStringParamOrEmptyString(params, match.groups.param_name));
// 		}
// 	}

// 	// Object.keys(params).forEach((param_name) => {
// 	// 	if (template.includes(`:${param_name}`) === true) {
// 	// 		// if (params[param_name] !== undefined) {
// 	// 		console.log('replace', param_name);
// 	// 		url.replace(`:${param_name}`, params[param_name] || 'foo');
// 	// 		// }
// 	// 	}
// 	// });

// 	console.log('url', url);
// 	return url;
// };
