import type { IPollingPlace } from './pollingPlacesInterfaces';

export const getPollingPlaceNameForFormHeading = (pollingPlace: IPollingPlace | null | undefined) => {
	// For elections with polling places
	if (pollingPlace !== null && pollingPlace !== undefined) {
		return pollingPlace.premises || pollingPlace.name;
	}

	return '!! Unable to determine polling place name !!';
};
