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
		getPollingPlaceByUniqueDetailsLookup: builder.query<
			IPollingPlace,
			// Occasionally some elections will have no premises names on polling places
			{ electionId: number; name: string; premises: string | undefined; state: string }
		>({
			query: ({ electionId, name, premises, state }) => ({
				url: 'polling_places/lookup/',
				params: { election_id: electionId, name, premises, state },
			}),
		}),
	}),
});

export const { useLazyGetPollingPlaceByLatLonLookupQuery, useGetPollingPlaceByUniqueDetailsLookupQuery } =
	pollingPlacesApi;
