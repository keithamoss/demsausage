import { Tooltip } from '@mui/material';
import { View } from 'ol';
import { transformExtent } from 'ol/proj';
import React from 'react';
import type { NavigateFunction, Params } from 'react-router-dom';
import { navigateToMapAndUpdateMapWithNewView } from '../../app/routing/navigationHelpers/navigationHelpersMap';
import type { Election, IGeoJSONPoylgon } from '../../app/services/elections';
import { eAppEnv, getCSVStringsAsFloats, getEnvironment } from '../../app/utils';
import { getAllFoodsAvailableOnStalls, supportingIcons } from '../icons/iconHelpers';
import { getStandardViewPadding } from '../map/mapHelpers';
import type { IPollingPlace } from '../pollingPlaces/pollingPlacesInterfaces';

// https://docs.mapbox.com/api/search/search-box/#response-search-request
export interface IMapboxSearchboxAPIV1Response {
	type: 'FeatureCollection';
	features: IMapboxSearchboxAPIV1ResponseFeature[];
	attribution: string;
}

// https://docs.mapbox.com/api/search/geocoding/#geocoding-response-object
export interface IMapboxGeocodingAPIV6Response {
	type: 'FeatureCollection';
	features: IMapboxGeocodingAPIV6ResponseFeature[];
	attribution: string;
}

export enum EMapboxFeatureType {
	country = 'country',
	region = 'region',
	postcode = 'postcode',
	district = 'district',
	place = 'place',
	locality = 'locality',
	neighborhood = 'neighborhood',
	street = 'street',
	address = 'address',
	poi = 'poi',
}

export interface IMapboxSearchboxAPIV1ResponseFeature {
	type: 'Feature';
	geometry: {
		type: 'Point';
		coordinates: [number, number];
	};
	properties: {
		name: string;
		mapbox_id: string;
		feature_type: EMapboxFeatureType;
		address?: string;
		full_address?: string;
		place_formatted: string;
		coordinates: {
			longitude: number;
			latitude: number;
		};
		bbox: [number, number, number, number];
		context: {
			[key: string]: {
				name: string;
				id?: string;
				wikidata_id?: string;
				address_number?: string;
				street_name?: string;
				region_code?: string;
				region_code_full?: string;
				country_code?: string;
				country_code_full?: string;
			};
		};
	};
}

export interface IMapboxGeocodingAPIV6ResponseFeature {
	type: 'Feature';
	id: string;
	geometry: {
		type: 'Point';
		coordinates: [number, number];
	};
	properties: {
		mapbox_id: string;
		feature_type: EMapboxFeatureType;
		full_address: string;
		name: string;
		name_preferred: string;
		place_formatted: string;
		coordinates: {
			longitude: number;
			latitude: number;
			accuracy?: string;
		};
		bbox: [number, number, number, number];
		context: {
			[key: string]: {
				mapbox_id: string;
				name: string;
				wikidata_id?: string;
				address_number?: string;
				street_name?: string;
				region_code?: string;
				region_code_full?: string;
				country_code?: string;
				country_code_full?: string;
			};
		};
	};
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
	EMapboxFeatureType.postcode,
	EMapboxFeatureType.district,
	EMapboxFeatureType.place,
	EMapboxFeatureType.locality,
	EMapboxFeatureType.neighborhood,
	EMapboxFeatureType.address,
	EMapboxFeatureType.street,
	EMapboxFeatureType.poi,
];

export const mapboxSearchTypesForElectionsWithoutPollingPlaces = [
	EMapboxFeatureType.address,
	EMapboxFeatureType.street,
	EMapboxFeatureType.poi,
];

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

// Partial list taken from a chunk of https://api.mapbox.com/search/searchbox/v1/list/category
export const getMapboxPOICategories = (): string[] => [
	'school',
	'education',
	'place_of_worship',
	'temple',
	'church',
	'outdoors',
	'park',
	'government',
	'social_club',
	'community_center',
];

// https://docs.mapbox.com/api/search/geocoding/#forward-geocoding
export const getMapboxSearchParamsForElection = (election: Election) =>
	election.is_federal === false
		? {
				country: 'au',
				bbox: getBBoxFromGeoJSONPolygonCoordinates(election.geom),
			}
		: {};

// https://stackoverflow.com/a/57528471
export const wrapIconWithTooltip = (icon: JSX.Element, title: string) => (
	<Tooltip key={title} title={title} disableFocusListener enterTouchDelay={0}>
		{icon}
	</Tooltip>
);

export const getNomsIconsForPollingPlace = (
	pollingPlace: IPollingPlace,
	allowRedCrossOfShame: boolean,
	allowSoldOut: boolean,
) => {
	if (pollingPlace.stall?.noms.nothing) {
		// For PollingPlaceCards, we don't display the Red Cross of Shame in the list of noms icons, it gets displayed as part of other elements of the card
		return allowRedCrossOfShame === true
			? wrapIconWithTooltip(supportingIcons.red_cross.icon.react, supportingIcons.red_cross.description)
			: null;
	}
	const foodIcons = getAllFoodsAvailableOnStalls();

	return (
		<React.Fragment>
			{Object.keys(pollingPlace.stall?.noms || {}).map((key) => {
				const foodIcon = foodIcons.find((i) => i.value === key);

				if (foodIcon !== undefined) {
					return wrapIconWithTooltip(foodIcon.icon.react, foodIcon.label);
				}
			})}
			{/* For PollingPlaceCards, we don't display the Sold Out icon in the list of noms icons, it gets displayed as part of other elements of the card */}
			{allowSoldOut === true &&
				pollingPlace.stall?.noms.run_out === true &&
				wrapIconWithTooltip(supportingIcons.yellow_minus.icon.react, supportingIcons.yellow_minus.description)}
		</React.Fragment>
	);
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

	if (
		Object.values(bbox).includes(Number.POSITIVE_INFINITY) ||
		Object.values(bbox).includes(Number.NEGATIVE_INFINITY)
	) {
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
			return [
				Number.parseFloat(bboxArray[2]),
				Number.parseFloat(bboxArray[1]),
				Number.parseFloat(bboxArray[3]),
				Number.parseFloat(bboxArray[0]),
			];
		}
	}

	return undefined;
};
