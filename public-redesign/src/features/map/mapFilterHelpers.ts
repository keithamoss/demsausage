import type { IMapFilterSettings, IPollingPlace } from '../pollingPlaces/pollingPlacesInterfaces';
import { NomsReader } from './nomsReader';

export const hasFilterOptions = (mapFilterSettings: IMapFilterSettings, electionId: number) =>
	Object.values(mapFilterSettings).filter((enabled) => enabled === true).length > 0;

export const satisfiesMapFilter = (noms: NomsReader, mapFilterSettings: IMapFilterSettings, electionId: number) => {
	if (hasFilterOptions(mapFilterSettings, electionId) && noms.hasAnyNoms() === true) {
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
	electionId: number,
) => {
	if (hasFilterOptions(mapFilterSettings, electionId) === false) {
		return true;
	}

	if (pollingPlace.stall === null) {
		return false;
	}

	const nomsReader = new NomsReader(pollingPlace.stall.noms);
	if (nomsReader.hasAnyNoms() === false) {
		return false;
	}

	if (satisfiesMapFilter(nomsReader, mapFilterSettings, electionId) === false) {
		return false;
	}

	return true;
};
