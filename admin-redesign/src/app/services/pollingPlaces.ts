import { createEntityAdapter } from '@reduxjs/toolkit';
import type {
	IPollingPlace,
	IPollingPlaceNomsHistory,
	IPollingPlaceStallModifiableProps,
} from '../../features/pollingPlaces/pollingPlacesInterfaces';
import { api } from './api';
import type { Stall } from './stalls';

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
		getPollingPlaceBySearchTerm: builder.query<IPollingPlace[], { electionId: number; searchTerm: string }>({
			query: ({ electionId, searchTerm }) => ({
				url: 'polling_places/search/',
				params: { election_id: electionId, search_term: searchTerm },
			}),
		}),
		getPollingPlaceByStallIdLookup: builder.query<IPollingPlace, number>({
			query: (stallId) => ({
				url: 'polling_places/stall_lookup/',
				params: { stall_id: stallId },
			}),
		}),
		getPollingPlaceNomsHistoryById: builder.query<IPollingPlaceNomsHistory[], number>({
			query: (pollingPlaceId) => ({
				url: `polling_places/${pollingPlaceId}/noms_history/`,
			}),
		}),
		getPollingPlaceStallsById: builder.query<Stall[], number>({
			query: (pollingPlaceId) => ({
				url: `polling_places/${pollingPlaceId}/related_stalls/`,
			}),
		}),
		addOrEditPollingBoothNoms: builder.mutation<
			void,
			{ pollingPlaceId: number; stall: Partial<IPollingPlaceStallModifiableProps> }
		>({
			query: ({ pollingPlaceId, stall }) => ({
				url: `polling_places/${pollingPlaceId}/`,
				method: 'PATCH',
				body: {
					id: pollingPlaceId,
					stall,
				},
			}),
		}),
		deletePollingBoothNoms: builder.mutation<void, number>({
			query: (pollingPlaceId) => ({
				url: `polling_places/${pollingPlaceId}/delete_polling_place_noms/`,
				method: 'DELETE',
			}),
		}),
	}),
});

export const {
	useGetPollingPlaceByLatLonLookupQuery,
	useGetPollingPlaceByUniqueDetailsLookupQuery,
	useGetPollingPlaceByIdsLookupQuery,
	useGetPollingPlaceBySearchTermQuery,
	useLazyGetPollingPlaceBySearchTermQuery,
	useGetPollingPlaceByStallIdLookupQuery,
	useGetPollingPlaceNomsHistoryByIdQuery,
	useGetPollingPlaceStallsByIdQuery,
	useAddOrEditPollingBoothNomsMutation,
	useDeletePollingBoothNomsMutation,
} = pollingPlacesApi;
