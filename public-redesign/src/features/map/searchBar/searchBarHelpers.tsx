import { Tooltip } from '@mui/material';
import React from 'react';
import { Election, IGeoJSONPoylgon } from '../../../app/services/elections';
import BaconandEggsIcon from '../../icons/bacon-and-eggs';
import CakeIcon from '../../icons/cake';
import CoffeeIcon from '../../icons/coffee';
import HalalIcon from '../../icons/halal';
import { NomsOptionsAvailable } from '../../icons/noms';
import RedCrossOfShame from '../../icons/red-cross-of-shame';
import SausageIcon from '../../icons/sausage';
import VegoIcon from '../../icons/vego';
import { IPollingPlace } from '../../pollingPlaces/pollingPlacesInterfaces';
import { eAppEnv, getEnvironment } from '../map_stuff';

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
		[key: string]: string;
	};
}

// https://docs.mapbox.com/api/search/geocoding/#data-types
// Note: Only Country and Region data types are excluded from the defaults.
export const defaultMapboxSearchTypes = ['postcode', 'district', 'place', 'locality', 'neighborhood', 'address', 'poi'];

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

export const wrapIconWithTooltip = (icon: JSX.Element, title: string) => (
	<Tooltip disableFocusListener enterTouchDelay={0} title={title}>
		{icon}
	</Tooltip>
);

export const getNomsIconsForPollingPlace = (pollingPlace: IPollingPlace) => {
	if (pollingPlace.stall?.noms.nothing) {
		return wrapIconWithTooltip(<RedCrossOfShame />, 'No stalls here');
	} else {
		return (
			<React.Fragment>
				{pollingPlace.stall?.noms.bbq && wrapIconWithTooltip(<SausageIcon />, NomsOptionsAvailable.bbq.label)}
				{pollingPlace.stall?.noms.cake && wrapIconWithTooltip(<CakeIcon />, NomsOptionsAvailable.cake.label)}
				{pollingPlace.stall?.noms.vego && wrapIconWithTooltip(<VegoIcon />, NomsOptionsAvailable.vego.label)}
				{pollingPlace.stall?.noms.halal && wrapIconWithTooltip(<HalalIcon />, NomsOptionsAvailable.halal.label)}
				{pollingPlace.stall?.noms.coffee && wrapIconWithTooltip(<CoffeeIcon />, NomsOptionsAvailable.coffee.label)}
				{pollingPlace.stall?.noms.bacon_and_eggs &&
					wrapIconWithTooltip(<BaconandEggsIcon />, NomsOptionsAvailable.bacon_and_eggs.label)}
			</React.Fragment>
		);
	}
};
