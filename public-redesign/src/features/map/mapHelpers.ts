import View from 'ol/View';
import { transform } from 'ol/proj';
import { Params } from 'react-router-dom';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { OLMapView } from '../app/appSlice';

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
	const match = str.match(/\/{1}(?<map_lat_lon_zoom>@[\-0-9,.z]+)\/?/);
	return match?.groups?.map_lat_lon_zoom;
};

export const createMapViewURLPathComponent = (view: View) => {
	const centre = view.getCenter();
	if (centre === undefined) {
		return undefined;
	}

	return `@${transform(centre, 'EPSG:3857', 'EPSG:4326').reverse().join(',')},z${view.getZoom()}`;
};

export const createMapViewFromURL = (params: Params<string>): Partial<OLMapView> | undefined => {
	const mapViewFromURL = getStringParamOrUndefined(params, 'map_lat_lon_zoom');

	if (mapViewFromURL === undefined) {
		return undefined;
	}

	// @-31.9439783,115.8640059,15z
	const [lat, lon, zoom] = mapViewFromURL.substring(1).split(',');

	const latNumber = parseFloat(lat);
	const lonNumber = parseFloat(lon);
	const zoomNumber = parseFloat(zoom.substring(1));

	if (Number.isNaN(latNumber) === true || Number.isNaN(lonNumber) === true || Number.isNaN(zoomNumber) === true) {
		return undefined;
	}

	return {
		center: transform([lonNumber, latNumber], 'EPSG:4326', 'EPSG:3857'),
		zoom: zoomNumber,
	};
};
