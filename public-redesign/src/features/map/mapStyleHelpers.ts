import Circle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import { IMapFilterSettings, IMapPollingGeoJSONNoms } from '../pollingPlaces/pollingPlacesInterfaces';
import { hasFilterOptions, satisfiesMapFilter } from './mapFilterHelpers';
import { IMapPollingPlaceFeature, getObjectOrUndefinedFromFeature } from './mapHelpers';
import { NomsReader } from './nomsReader';
import { supportingIcons } from '../icons/iconHelpers';
import { prepareRawSVG } from '../icons/svgHelpers';

export const createOLIcon = (rawSVG: string, zIndex: number, width: number, height: number, style?: string) =>
	new Style({
		image: new Icon({
			src: `data:image/svg+xml;utf8,${prepareRawSVG(rawSVG, width, height, style)}`,
			// According to https://github.com/openlayers/openlayers/issues/11133#issuecomment-638987210, this forces the icon to be rendered to a canvas internally (whilst not changing the colour).
			// This should result in a performance improvement.
			// Untested, but it doesnt't appear to do any harm.
			color: 'white',
			scale: 0.5,
		}),
		zIndex,
	});

export const createOLDetailedIcon = (rawSVG: string) =>
	new Style({
		image: new Icon({
			src: `data:image/svg+xml;utf8,${prepareRawSVG(rawSVG, 40, 40)}`,
			// According to https://github.com/openlayers/openlayers/issues/11133#issuecomment-638987210, this forces the icon to be rendered to a canvas internally (whilst not changing the colour).
			// This should result in a performance improvement.
			// Untested, but it doesnt't appear to do any harm.
			color: 'white',
			scale: 0.5,
			anchorXUnits: 'pixels',
			anchorYUnits: 'pixels',
		}),
		zIndex: 1,
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

		return resolution >= 7 ? nomsReader.getIconForNoms() : nomsReader.getDetailedIconsForNoms(feature /*, resolution*/);
	}

	return hasFilterOptions(mapFilterSettings) === false ? supportingIcons.grey_question.icon.ol : null;
};
