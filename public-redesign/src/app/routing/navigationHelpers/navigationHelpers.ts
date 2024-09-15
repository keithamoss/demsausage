import { Params } from 'react-router-dom';

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
		urlSubmitterType: params.submitter_type,
		urlLocationName: params.location_name,
		urlLocationAddress: params.location_address,
		urlLocationState: params.location_state,
		urlLocationLonLat: params.location_lon_lat,
	};
};

export const addComponentToEndOfURLPath = (urlPathBase: string, param: string | undefined) => {
	const urlPathBaseWithTrailingSlash = urlPathBase.endsWith('/') === true ? urlPathBase : `${urlPathBase}/`;
	return param === undefined ? urlPathBaseWithTrailingSlash : `${urlPathBaseWithTrailingSlash}${param}/`;
};

export const removeLastComponentFromEndOfURLPath = (urlPathBase: string) => {
	const pathComponents = urlPathBase.split('/').filter((c) => c !== '');
	pathComponents.pop();
	return `/${pathComponents.join('/')}/`;
};

export const removeLastTwoComponentsFromEndOfURLPath = (urlPathBase: string) => {
	const oneComponentRemoved = removeLastComponentFromEndOfURLPath(urlPathBase);
	return removeLastComponentFromEndOfURLPath(oneComponentRemoved);
};
