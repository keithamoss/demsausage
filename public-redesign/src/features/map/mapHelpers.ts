import type View from 'ol/View';
import { transform } from 'ol/proj';
import type { Params } from 'react-router-dom';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import type { OLMapView } from '../app/appSlice';
import type { IMapPollingGeoJSONNoms } from '../pollingPlaces/pollingPlacesInterfaces';

export interface IMapPollingPlaceGeoJSONFeatureCollection {
	type: 'FeatureCollection';
	features: IMapPollingPlaceGeoJSONFeature[];
}

export interface IMapPollingPlaceGeoJSONFeature {
	type: 'Feature';
	id: number;
	geometry: {
		type: 'Point';
		coordinates: [number, number];
	};
	properties: {
		name: string;
		premises: string;
		state: string;
		noms: IMapPollingGeoJSONNoms | null;
		ec_id: number | null;
	};
}

// @FIXME Use the inbuilt OLFeature type when we upgrade
export interface IMapPollingPlaceFeature {
	getId: () => number | string | undefined;
	getProperties: () => {
		[key: string]: string;
	};
	get: (key: string) => unknown;
}

export const getStringOrEmptyStringFromFeature = (feature: IMapPollingPlaceFeature, propName: string) => {
	const value = feature.get(propName);
	return typeof value === 'string' ? value : '';
};

export const getStringOrUndefinedFromFeature = (feature: IMapPollingPlaceFeature, propName: string) => {
	const value = feature.get(propName);
	return typeof value === 'string' ? value : undefined;
};

export const getObjectOrUndefinedFromFeature = (feature: IMapPollingPlaceFeature, propName: string) => {
	const value = feature.get(propName);
	return typeof value === 'object' ? value : undefined;
};

export const getStandardViewPadding = () => {
	// top, right, bottom, left
	// header bar is 48px and 80px is about the space taken up by the on-top-of-the-map search bar
	return [48, 10, 80, 10];
};

export const doesTheMapViewMatchThisView = (mapView: View, anotherView: Partial<OLMapView> | undefined) => {
	const mapViewCentre = mapView.getCenter();
	const anotherViewCentre = anotherView?.center;

	const mapViewZoom = mapView.getZoom();
	const anotherViewZoom = anotherView?.zoom;

	if (mapViewCentre === undefined || anotherViewCentre === undefined) {
		return false;
	}

	return (
		mapViewCentre[0] === anotherViewCentre[0] &&
		mapViewCentre[1] === anotherViewCentre[1] &&
		mapViewZoom === anotherViewZoom
	);
};

export const extractMapViewFromString = (str: string) => {
	const match = str.match(/\/{1}(?<map_lat_lon_zoom>@[-0-9,.z]+)\/?/);
	return match?.groups?.map_lat_lon_zoom;
};

export const isMapViewParamValid = (map_lat_lon_zoom: string) => {
	return map_lat_lon_zoom.match(/^@[0-9.-]+,[0-9.-]+,z[0-9.]+$/) !== null;
};

export const createMapViewURLPathComponent = (view: View) => {
	const centre = view.getCenter();
	const zoom = view.getZoom();

	if (centre === undefined || zoom === undefined) {
		return undefined;
	}

	// Round to 7 decimal places to avoid occasional issues where there'd be a tiny tiny micro movement of the view when scrolling
	const [lat, lon] = transform(centre, 'EPSG:3857', 'EPSG:4326').reverse();
	return `@${lat.toPrecision(7)},${lon.toPrecision(7)},z${zoom.toPrecision(7)}`;
};

export const createMapViewFromURL = (params: Params<string>): Partial<OLMapView> | undefined => {
	const mapViewFromURL = getStringParamOrUndefined(params, 'map_lat_lon_zoom');

	if (mapViewFromURL === undefined) {
		return undefined;
	}

	// @-33.83689,151.1098,z12.38029
	const [lat, lon, zoom] = mapViewFromURL.substring(1).split(',');

	const latNumber = Number.parseFloat(lat);
	const lonNumber = Number.parseFloat(lon);
	const zoomNumber = Number.parseFloat(zoom.substring(1));

	if (Number.isNaN(latNumber) === true || Number.isNaN(lonNumber) === true || Number.isNaN(zoomNumber) === true) {
		return undefined;
	}

	return {
		center: transform([lonNumber, latNumber], 'EPSG:4326', 'EPSG:3857'),
		zoom: zoomNumber,
	};
};
