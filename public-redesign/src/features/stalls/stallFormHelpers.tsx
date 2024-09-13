import { Button } from '@mui/material';
import { IStallLocationInfo, Stall } from '../../app/services/stalls';
import { IPollingPlace } from '../pollingPlaces/pollingPlacesInterfaces';

export const mobileStepperMinHeight = 46.75;

export const getPollingPlaceFormHeading = (
	stall: Stall | undefined,
	pollingPlace: IPollingPlace | null | undefined,
	stallLocationInfo: IStallLocationInfo | undefined,
) => {
	// For Adding Stalls: On elections with no polling places
	if (stallLocationInfo !== undefined) {
		return stallLocationInfo.name;
	}

	// For Adding Stalls: On elections with polling places
	if (pollingPlace !== null && pollingPlace !== undefined) {
		return pollingPlace.premises || pollingPlace.name;
	}

	// For Editing Stalls
	if (stall !== undefined) {
		if (stall.polling_place !== null) {
			// On elections with polling places
			return stall.polling_place.premises || stall.polling_place.name;
		} else if (stall.location_info !== null) {
			// On elections with no polling places
			return stall.location_info.name;
		}
	}

	return '!! Unable to determine polling place name !!';
};

export const getHiddenStepperButton = () => <Button size="small" disabled={true} style={{ color: 'white' }}></Button>;
