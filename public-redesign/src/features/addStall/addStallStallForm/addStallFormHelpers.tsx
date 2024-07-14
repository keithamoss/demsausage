import { Button } from '@mui/material';
import { IStallLocationInfo } from '../../../app/services/stalls';
import { IPollingPlace } from '../../pollingPlaces/pollingPlacesInterfaces';

export const getHiddenStepperButton = () => <Button size="small" disabled={true} style={{ color: 'white' }}></Button>;

export const createStallLocationInfoObjectFromPollingPlace = (pollingPlace: IPollingPlace): IStallLocationInfo => {
	return {
		name: pollingPlace.name,
		address: pollingPlace.address,
		state: pollingPlace.state,
		geom: pollingPlace.geom,
	};
};

export const createStallLocationInfoObjectFromLocationLookup = (
	location_name: string,
	location_address: string,
	location_state: string,
	location_lon_lat: string,
): IStallLocationInfo => {
	return {
		name: location_name,
		address: location_address,
		state: location_state,
		geom: {
			type: 'Point',
			coordinates: [parseFloat(location_lon_lat.split(',')[0]), parseFloat(location_lon_lat.split(',')[1])],
		},
	};
};
