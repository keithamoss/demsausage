import { IMapFilterSettings } from '../pollingPlaces/pollingPlacesInterfaces';
import { IPollingPlace } from '../pollingPlaces/pollingPlacesInterfaces';
import { NomsReader } from './nomsReader';

export const hasFilterOptions = (mapFilterSettings: IMapFilterSettings) =>
	Object.values(mapFilterSettings).filter((enabled) => enabled === true).length > 0;

export const satisfiesMapFilter = (noms: NomsReader, mapFilterSettings: IMapFilterSettings) => {
	if (hasFilterOptions(mapFilterSettings) && noms.hasAnyNoms() === true) {
		for (const [option, enabled] of Object.entries(mapFilterSettings)) {
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
	mapFilterSettings: IMapFilterSettings,
) => {
	if (hasFilterOptions(mapFilterSettings) === false) {
		return true;
	}

	if (pollingPlace.stall === null) {
		return false;
	}

	const nomsReader = new NomsReader(pollingPlace.stall.noms);
	if (nomsReader.hasAnyNoms() === false) {
		return false;
	}

	if (satisfiesMapFilter(nomsReader, mapFilterSettings) === false) {
		return false;
	}

	return true;
};
