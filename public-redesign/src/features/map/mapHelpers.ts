import View from 'ol/View';
import { transform } from 'ol/proj';
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

export const doTwoViewsMatch = (view1: Partial<OLMapView>, view2: Partial<OLMapView>) => {
	if (
		view1.center !== undefined &&
		view2.center !== undefined &&
		(view1.center[0] !== view2.center[0] || view1.center[1] !== view2.center[1])
	) {
		return true;
	}

	if (view1.zoom !== undefined && view2.zoom !== undefined && view1.zoom !== view2.zoom) {
		return true;
	}

	return false;
};

export const createURLHashFromView = (view: View) => {
	const centre = view.getCenter();
	if (centre === undefined) {
		return undefined;
	}

	return `${transform(centre, 'EPSG:3857', 'EPSG:4326').join(',')},z${view.getZoom()}`;
};

export const getViewFromURLHash = (hash: string): Partial<OLMapView> | undefined => {
	if (hash === '') {
		return undefined;
	}

	// #139.5009092677685,-20.728621082178364,z14.373097035426929
	const [lon, lat, zoom] = hash.substring(1).split(',');

	const lonNumber = parseFloat(lon);
	const latNumber = parseFloat(lat);
	const zoomNumber = parseFloat(zoom.substring(1));

	if (Number.isNaN(lonNumber) === true || Number.isNaN(latNumber) === true || Number.isNaN(zoomNumber) === true) {
		return undefined;
	}

	return {
		center: transform([lonNumber, latNumber], 'EPSG:4326', 'EPSG:3857'),
		zoom: zoomNumber,
	};
};
