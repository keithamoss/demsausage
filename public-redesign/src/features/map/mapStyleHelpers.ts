import { supportingIcons } from '../icons/iconHelpers';
import type { IMapFilterSettings, IMapPollingGeoJSONNoms } from '../pollingPlaces/pollingPlacesInterfaces';
import { hasFilterOptions, satisfiesMapFilter } from './mapFilterHelpers';
import { type IMapPollingPlaceFeature, getObjectOrUndefinedFromFeature } from './mapHelpers';
import { NomsReader } from './nomsReader';

export const olStyleFunction = (
	feature: IMapPollingPlaceFeature,
	resolution: number,
	mapFilterSettings: IMapFilterSettings,
	electionId: number,
) => {
	const noms = getObjectOrUndefinedFromFeature(feature, 'noms');

	if (noms === undefined) {
		return null;
	}

	const nomsReader = new NomsReader(noms as IMapPollingGeoJSONNoms);

	if (nomsReader.hasAnyNoms() === true) {
		if (
			hasFilterOptions(mapFilterSettings, electionId) === true &&
			satisfiesMapFilter(nomsReader, mapFilterSettings, electionId) === false
		) {
			return null;
		}

		return resolution >= 7 ? nomsReader.getIconForNoms() : nomsReader.getDetailedIconsForNoms(feature /*, resolution*/);
	}

	return hasFilterOptions(mapFilterSettings, electionId) === false ? supportingIcons.grey_question.icon.ol : null;
};
