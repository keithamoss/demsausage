import { createEntityAdapter } from '@reduxjs/toolkit';
import { IPollingPlace } from '../../features/pollingPlaces/pollingPlacesInterfaces';
import { api } from './api';

export const pollingPlacesAdapter = createEntityAdapter<IPollingPlace>();

const initialState = pollingPlacesAdapter.getInitialState();
export { initialState as initialPollingPlacesState };

export const pollingPlacesApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getPollingPlaceByLatLonLookup: builder.query<IPollingPlace[], { electionId: number; lonlat: [number, number] }>({
			query: ({ electionId, lonlat }) => ({
				url: 'polling_places/nearby/',
				params: { election_id: electionId, lonlat },
			}),
		}),
	}),
});

export const { useLazyGetPollingPlaceByLatLonLookupQuery } = pollingPlacesApi;

// const response = await fetch(
//   `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchTerm}.json?limit=10&proximity=ip&types=${mapboxSearchTypes.join(
//     '%2C',
//   )}&access_token=${getMapboxAPIKey()}&${getMapboxSearchParamsForElection(election)}`,
// );
