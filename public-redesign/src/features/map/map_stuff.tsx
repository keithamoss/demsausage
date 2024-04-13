import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { IMapFilterOptions, IMapPollingGeoJSONNoms, spriteIconConfig } from '../icons/noms';
import sprite from '../icons/sprite.json';
import { IPollingPlace } from '../pollingPlaces/pollingPlacesInterfaces';
import { NomsReader } from './noms';

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum eAppEnv {
	DEVELOPMENT = 1,
	TEST = 2,
	PRODUCTION = 3,
}

export function getEnvironment(): eAppEnv {
	switch (import.meta.env.VITE_ENVIRONMENT) {
		case 'DEVELOPMENT':
			return eAppEnv.DEVELOPMENT;
		case 'TEST':
			return eAppEnv.TEST;
		case 'PRODUCTION':
			return eAppEnv.PRODUCTION;
	}
}

export function isDevelopment(): boolean {
	return getEnvironment() === eAppEnv.DEVELOPMENT;
}

export function getAPIBaseURL(): string {
	return import.meta.env.VITE_API_BASE_URL;
}

export function getBaseURL(): string {
	return import.meta.env.VITE_SITE_BASE_URL;
}

export interface IGeoJSONFeatureCollection {
	type: string;
	features: IGeoJSON[];
}

export interface IGeoJSON {
	type: string;
	coordinates: [number, number];
}

export interface IMapSearchResults {
	lon: number;
	lat: number;
	extent: [number, number, number, number] | null;
	formattedAddress: string;
	padding?: boolean;
	animation?: boolean;
}

const spriteIcons = {};
const spriteIconsDetailed = {};
Object.entries(spriteIconConfig).forEach(([iconName, iconConfig]: any) => {
	const spriteConfig = sprite.frames.find((config: any) => config.filename === `${iconName}.png`);

	if (spriteConfig !== undefined) {
		const iconAttributes = {
			src: `/icons/sprite_${sprite.meta.hash}.png`,
			offset: [Math.abs(spriteConfig.frame.x), Math.abs(spriteConfig.frame.y)],
			size: [spriteConfig.spriteSourceSize.w, spriteConfig.spriteSourceSize.h],
			scale: iconConfig.scale,
			opacity: 'opacity' in iconConfig ? iconConfig.opacity : undefined,
		} as any; /* IconOptions */

		// An initial attempt to give icons background colour
		// It doesn't look great (like Apple Maps), I think in part because our
		// icons have such different colours (and dimensions?).
		// Needs some design love.
		// https://blog.mercury.io/revisiting-the-iconography-of-apple-maps/
		if (
			iconName === 'disabled'
			// iconName === "cake" ||
			// iconName === "bbq" ||
			// iconName === "bbq_and_cake"
		) {
			const width = spriteConfig.spriteSourceSize.w / 2.75;

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore-next-line
			spriteIcons[iconName] = [
				new Style({
					zIndex: iconConfig.zIndex,
					image: new Icon(iconAttributes),
				}),
				new Style({
					zIndex: iconConfig.zIndex - 1,
					image: new Circle({
						radius: width,
						fill: new Fill({
							// Purple
							// color: [103, 64, 180, 1],
							// White
							color: [250, 250, 248, 1],
						}),
						stroke: new Stroke({
							// Grey
							color: [151, 164, 175, 0.6],
							width: 2,
						}),
					}),
				}),
			];
		} else {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore-next-line
			spriteIcons[iconName] = [
				new Style({
					image: new Icon(iconAttributes),
					zIndex: iconConfig.zIndex,
				}),
			];
		}

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore-next-line
		spriteIconsDetailed[iconName] = new Style({
			image: new Icon({
				...iconAttributes,
				anchorXUnits: 'pixels',
				anchorYUnits: 'pixels',
			}),
			zIndex: 1,
		});
	}
});

export const hasFilterOptions = (mapFilterOptions: IMapFilterOptions) =>
	Object.values(mapFilterOptions).filter((enabled: boolean) => enabled === true).length > 0;

export const satisfiesMapFilter = (noms: NomsReader, mapFilterOptions: IMapFilterOptions) => {
	if (hasFilterOptions(mapFilterOptions) && noms.hasAnyNoms() === true) {
		for (const [option, enabled] of Object.entries(mapFilterOptions)) {
			if (enabled === true && noms.hasNomsOption(option) === false) {
				return false;
			}
		}
		return true;
	}

	return true;
};

export const doesPollingPlaceSatisifyFilterCriteria = (
	pollingPlace: IPollingPlace,
	mapFilterOptions: IMapFilterOptions,
) => {
	if (hasFilterOptions(mapFilterOptions) === false) {
		return true;
	}

	if (pollingPlace.stall === null) {
		return false;
	}

	const nomsReader = new NomsReader(pollingPlace.stall.noms);
	if (nomsReader.hasAnyNoms() === false) {
		return false;
	}

	if (satisfiesMapFilter(nomsReader, mapFilterOptions) === false) {
		return false;
	}

	return true;
};

export const olStyleFunction = (
	feature: IMapPollingPlaceFeature,
	resolution: number,
	mapFilterOptions: IMapFilterOptions,
) => {
	const nomsReader = new NomsReader(feature.get('noms'));

	if (nomsReader.hasAnyNoms() === true) {
		if (hasFilterOptions(mapFilterOptions) === true && satisfiesMapFilter(nomsReader, mapFilterOptions) === false) {
			return null;
		}

		return resolution >= 7
			? nomsReader.getIconForNoms(spriteIcons)
			: nomsReader.getDetailedIconsForNoms(spriteIcons, spriteIconsDetailed, feature, resolution);
	}

	return hasFilterOptions(mapFilterOptions) === false
		? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
		  // @ts-ignore-next-line
		  spriteIcons.unknown
		: null;
};

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
	getId: Function;
	getProperties: Function;
	get: Function;
}
