import { Tooltip } from '@mui/material';
import { View } from 'ol';
import { transformExtent } from 'ol/proj';
import React from 'react';
import { NavigateFunction, Params } from 'react-router-dom';
import { navigateToMapAndUpdateMapWithNewView } from '../../app/routing/navigationHelpers/navigationHelpersMap';
import { Election, IGeoJSONPoylgon } from '../../app/services/elections';
import { eAppEnv, getCSVStringsAsFloats, getEnvironment } from '../../app/utils';
import { getAllFoodsAvailableOnStalls, supportingIcons } from '../icons/iconHelpers';
import { getStandardViewPadding } from '../map/mapHelpers';
import { IPollingPlace } from '../pollingPlaces/pollingPlacesInterfaces';

// https://docs.mapbox.com/api/search/geocoding/#geocoding-response-object
export interface IMapboxGeocodingAPIResponse {
	type: 'FeatureCollection';
	query: string[];
	features: IMapboxGeocodingAPIResponseFeature[];
	attribution: string;
}

export enum EMapboxPlaceType {
	country = 'country',
	region = 'region',
	postcode = 'postcode',
	district = 'district',
	place = 'place',
	locality = 'locality',
	neighborhood = 'neighborhood',
	address = 'address',
	poi = 'poi',
}

export enum EMapboxPropertiesAccuracy {
	rooftop = 'rooftop',
	parcel = 'parcel',
	point = 'point',
	interpolated = 'interpolated',
	intersection = 'intersection',
	street = 'street',
}

export interface IMapboxGeocodingAPIResponseFeature {
	id: string;
	type: 'Feature';
	place_type: EMapboxPlaceType[];
	relevance: number;
	address?: string;
	properties: {
		mapbox_id?: string;
		accuracy?: EMapboxPropertiesAccuracy;
		address?: string;
		category?: string;
		maki?: string;
		wikidata?: string;
		short_code?: string;
		foursquare?: string;
	};
	text: string;
	place_name: string;
	matching_text?: string;
	matching_place_name?: string;
	bbox: [number, number, number, number];
	center: [number, number];
	geometry: {
		type: 'Point';
		coordinates: [number, number];
		interpolated?: boolean;
		omitted?: boolean;
	};
	context: {
		id: string;
		mapbox_id?: string;
		short_code?: string;
		text?: string;
		wikidata?: string;
	}[];
}

export const onViewOnMap = (
	params: Params<string>,
	navigate: NavigateFunction,
	pollingPlaceNearbyResultsFiltered: IPollingPlace[] | undefined,
) => {
	if (pollingPlaceNearbyResultsFiltered !== undefined && pollingPlaceNearbyResultsFiltered.length >= 1) {
		const bboxOfPollingPlaces = getBBoxExtentForPollingPlaces(pollingPlaceNearbyResultsFiltered);

		if (bboxOfPollingPlaces !== undefined) {
			const olMapDOMRect = document.getElementById('openlayers-map')?.getBoundingClientRect();

			const view = new View();
			view.fit(transformExtent(bboxOfPollingPlaces, 'EPSG:4326', 'EPSG:3857'), {
				// Fallback to the window if for some weird reason we can't get the size of the OpenLayers Map.
				// It won't be exatly the same size (because of the header), but it'll do.
				size:
					olMapDOMRect !== undefined
						? [olMapDOMRect.width, olMapDOMRect.height]
						: [window.innerWidth, window.innerHeight],
				padding: getStandardViewPadding(),
			});

			navigateToMapAndUpdateMapWithNewView(params, navigate, view);
		}
	}
};

// https://docs.mapbox.com/api/search/geocoding/#data-types
// Note: Only Country and Region data types are excluded from the defaults.
export const defaultMapboxSearchTypes = [
	EMapboxPlaceType.postcode,
	EMapboxPlaceType.district,
	EMapboxPlaceType.place,
	EMapboxPlaceType.locality,
	EMapboxPlaceType.neighborhood,
	EMapboxPlaceType.address,
	EMapboxPlaceType.poi,
];

export const mapboxSearchTypesForElectionsWithoutPollingPlaces = [EMapboxPlaceType.address, EMapboxPlaceType.poi];

export const isSearchingYet = (search_term: string) => search_term.length >= 3;

export function getMapboxAPIKey(): string {
	return getEnvironment() === eAppEnv.DEVELOPMENT
		? import.meta.env.VITE_MAPBOX_API_KEY_DEV
		: import.meta.env.VITE_MAPBOX_API_KEY_PROD;
}

export const getBBoxFromGeoJSONPolygonCoordinates = (geometry: IGeoJSONPoylgon): [number, number, number, number] => {
	return [
		// The smallest longitude (aka the left-most point)
		Math.min(...geometry.coordinates[0].map((coord) => coord[0])),
		// The biggest latitude (aka the bottom-most point)
		Math.min(...geometry.coordinates[0].map((coord) => coord[1])),
		// The biggest longitude (aka the right-most point)
		Math.max(...geometry.coordinates[0].map((coord) => coord[0])),
		// The smallest latitude (aka the bottom-most point)
		Math.max(...geometry.coordinates[0].map((coord) => coord[1])),
	];
};

// https://docs.mapbox.com/api/search/geocoding/#forward-geocoding
export const getMapboxSearchParamsForElection = (election: Election): string =>
	election.is_federal === false
		? `country=au&bbox=${getBBoxFromGeoJSONPolygonCoordinates(election.geom).join('%2C')}`
		: '';

// https://stackoverflow.com/a/57528471
export const wrapIconWithTooltip = (icon: JSX.Element, title: string) => (
	<Tooltip key={title} title={title} disableFocusListener enterTouchDelay={0}>
		{icon}
	</Tooltip>
);

export const getNomsIconsForPollingPlace = (pollingPlace: IPollingPlace, allowRedCrossOfShame: boolean) => {
	if (pollingPlace.stall?.noms.nothing) {
		// For PollingPlaceCards, we don't display the Red Cross of Shame in the list of noms icons, it gets displayed as part of other elements of the card
		return allowRedCrossOfShame === true
			? wrapIconWithTooltip(supportingIcons.red_cross.icon.react, supportingIcons.red_cross.description)
			: null;
	} else {
		const foodIcons = getAllFoodsAvailableOnStalls();

		return (
			<React.Fragment>
				{Object.keys(pollingPlace.stall?.noms || {}).map((key) => {
					const foodIcon = foodIcons.find((i) => i.value === key);

					if (foodIcon !== undefined) {
						return wrapIconWithTooltip(foodIcon.icon.react, foodIcon.label);
					}
				})}
			</React.Fragment>
		);
	}
};

export const getLonLatFromString = (lonlat: string) => {
	if (lonlat === '') {
		return { lon: 0, lat: 0 };
	}

	// "115,-32" => {lon: 115, lat: -32}
	const [lon, lat] = getCSVStringsAsFloats(lonlat);
	return { lon, lat };
};

export const getBBoxExtentForPollingPlaces = (pollingPlaces: IPollingPlace[]) => {
	const bbox = {
		lat_top: Math.max(...pollingPlaces.map((p) => p.geom.coordinates[1])),
		lat_bottom: Math.min(...pollingPlaces.map((p) => p.geom.coordinates[1])),
		lon_left: Math.min(...pollingPlaces.map((p) => p.geom.coordinates[0])),
		lon_right: Math.max(...pollingPlaces.map((p) => p.geom.coordinates[0])),
	};

	if (Object.values(bbox).includes(Infinity) || Object.values(bbox).includes(-Infinity)) {
		return undefined;
	}

	return getBBoxExtentFromString(Object.values(bbox).join(','));
};

export const getBBoxExtentFromString = (bbox?: string): [number, number, number, number] | undefined => {
	if (bbox !== undefined) {
		const bboxArray = bbox.split(',');

		if (bboxArray.length === 4) {
			// We need to return [minX, minY, maxX, maxY]
			// ['-31.88573783', '-31.9441543633231', '115.88422', '115.944482222191']
			// becomes
			// [115.88422, -31.9441543633231, 115.944482222191, -31.88573783]
			return [parseFloat(bboxArray[2]), parseFloat(bboxArray[1]), parseFloat(bboxArray[3]), parseFloat(bboxArray[0])];
		}
	}

	return undefined;
};
