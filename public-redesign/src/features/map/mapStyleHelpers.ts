import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { IMapFilterSettings, IMapPollingGeoJSONNoms, spriteIconConfig } from '../icons/noms';
import sprite from '../icons/sprite.json';
import { hasFilterOptions, satisfiesMapFilter } from './mapFilterHelpers';
import { IMapPollingPlaceFeature, getObjectOrUndefinedFromFeature } from './mapHelpers';
import { NomsReader } from './noms';

export interface SpriteIcons {
	[key: string]: Style[];
}

export interface SpriteIconsDetailed {
	[key: string]: Style;
}

// @TODO FIXME This is a shitshow
const spriteIcons: SpriteIcons = {};
const spriteIconsDetailed: SpriteIconsDetailed = {};

Object.entries(spriteIconConfig).forEach(([iconName, iconConfig]) => {
	const spriteConfig = sprite.frames.find((config) => config.filename === `${iconName}.png`);

	if (spriteConfig !== undefined) {
		const iconAttributes = {
			src: `/icons/sprite_${sprite.meta.hash}.png`,
			offset: [Math.abs(spriteConfig.frame.x), Math.abs(spriteConfig.frame.y)],
			size: [spriteConfig.spriteSourceSize.w, spriteConfig.spriteSourceSize.h],
			scale: iconConfig.scale,
			opacity: 'opacity' in iconConfig ? iconConfig.opacity : undefined,
		}; /* IconOptions */

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
			spriteIcons[iconName] = [
				new Style({
					image: new Icon(iconAttributes),
					zIndex: iconConfig.zIndex,
				}),
			];
		}

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

export const olStyleFunction = (
	feature: IMapPollingPlaceFeature,
	resolution: number,
	mapFilterSettings: IMapFilterSettings,
) => {
	const noms = getObjectOrUndefinedFromFeature(feature, 'noms');

	if (noms === undefined) {
		return null;
	}

	// @TODO No 'as' casting
	const nomsReader = new NomsReader(noms as IMapPollingGeoJSONNoms);

	if (nomsReader.hasAnyNoms() === true) {
		if (hasFilterOptions(mapFilterSettings) === true && satisfiesMapFilter(nomsReader, mapFilterSettings) === false) {
			return null;
		}

		return resolution >= 7
			? nomsReader.getIconForNoms(spriteIcons)
			: nomsReader.getDetailedIconsForNoms(spriteIcons, spriteIconsDetailed, feature /*, resolution*/);
	}

	return hasFilterOptions(mapFilterSettings) === false ? spriteIcons.unknown : null;
};
