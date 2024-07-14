import { View } from 'ol';
import { NavigateFunction, Params, generatePath } from 'react-router-dom';
import { createMapViewURLPathComponent } from '../../../features/map/mapHelpers';
import { Election } from '../../services/elections';
import { addComponentToEndOfURLPath, getURLParams } from './navigationHelpers';

export const navigateToElection = (navigate: NavigateFunction, election: Election, view: View) => {
	// We handle going to all of these routes:
	// /:election_name/
	const mapViewString = createMapViewURLPathComponent(view);

	if (mapViewString !== undefined) {
		navigate(`/${election.name_url_safe}/m/${mapViewString}/`, { state: { updateMapView: true } });
	}
};

export const navigateToElectionAndReplace = (navigate: NavigateFunction, election: Election, view: View) => {
	// We handle going to all of these routes:
	// /:election_name/
	const mapViewString = createMapViewURLPathComponent(view);

	if (mapViewString !== undefined) {
		navigate(`/${election.name_url_safe}/m/${mapViewString}/`, { state: { updateMapView: true }, replace: true });
	}
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
	// /:election_name/gps/:gps_lon_lat/m/:map_lat_lon_zoom/
	// /:election_name/place/:search_term/:place_lon_lat/m/:map_lat_lon_zoom/
	// /:election_name/place/:search_term/m/:map_lat_lon_zoom/
	// /:election_name/:map_lat_lon_zoom?/
	const { urlElectionName, urlSearchTerm, urlLonLat, urlGPSLonLat } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	if (urlGPSLonLat !== undefined) {
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
		navigate(addComponentToEndOfURLPath(`/${urlElectionName}/`, `m/${mapLatLonZoom}`), {
			state,
		});
	}
};
