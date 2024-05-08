import View from 'ol/View';
import { transform } from 'ol/proj';
import { Params } from 'react-router-dom';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { OLMapView } from '../app/appSlice';

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
	const match = str.match(/\/{1}(?<map_lat_lon_zoom>@[\-0-9,.z]+)\/?/);
	return match?.groups?.map_lat_lon_zoom;
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
