import { createEntityAdapter } from '@reduxjs/toolkit';
import type { IPollingPlace } from '../../features/pollingPlaces/pollingPlacesInterfaces';
import { api } from './api';

export const pollingPlacesAdapter = createEntityAdapter<IPollingPlace>();

const initialState = pollingPlacesAdapter.getInitialState();
export { initialState as initialPollingPlacesState };

export const pollingPlacesApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getPollingPlaceByLatLonLookup: builder.query<IPollingPlace[], { electionId: number; lon: number; lat: number }>({
			query: ({ electionId, lon, lat }) => ({
				url: 'polling_places/nearby/',
				params: { election_id: electionId, lonlat: `${lon},${lat}` },
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
		getPollingPlaceByIdsLookup: builder.query<IPollingPlace[], { electionId: number; pollingPlaceIds: number[] }>({
			query: ({ electionId, pollingPlaceIds }) => ({
				url: 'polling_places/search/',
				params: { election_id: electionId, ids: pollingPlaceIds },
			}),
		}),
		getPollingPlaceByStallIdLookup: builder.query<IPollingPlace, number>({
			query: (stallId) => ({
				url: 'polling_places/stall_lookup/',
				params: { stall_id: stallId },
			}),
		}),
	}),
});

export const {
	useGetPollingPlaceByLatLonLookupQuery,
	useGetPollingPlaceByUniqueDetailsLookupQuery,
	useGetPollingPlaceByIdsLookupQuery,
	useGetPollingPlaceByStallIdLookupQuery,
} = pollingPlacesApi;
