import { createEntityAdapter } from '@reduxjs/toolkit';
import type {
	IPollingPlace,
	IPollingPlaceNomsHistory,
	IPollingPlaceStallModifiableProps,
	PollingPlaceHistoryEventType,
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
			// This is a very inelegant approach to tag-based cache invalidation, but it'll do.
			// We could make it far more nuanced and only validate specific things, but sod it.
			providesTags: ['PollingPlaces'],
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
			providesTags: ['PollingPlaces'],
		}),
		getPollingPlaceByIdLookup: builder.query<IPollingPlace, number>({
			query: (pollingPlaceId) => ({
				url: `polling_places/${pollingPlaceId}/`,
			}),
			providesTags: ['PollingPlaces'],
		}),
		getPollingPlaceByIdsLookup: builder.query<IPollingPlace[], { electionId: number; pollingPlaceIds: number[] }>({
			query: ({ electionId, pollingPlaceIds }) => ({
				url: 'polling_places/search/',
				params: { election_id: electionId, ids: pollingPlaceIds },
			}),
			providesTags: ['PollingPlaces'],
		}),
		getPollingPlaceBySearchTerm: builder.query<IPollingPlace[], { electionId: number; searchTerm: string }>({
			query: ({ electionId, searchTerm }) => ({
				url: 'polling_places/search/',
				params: { election_id: electionId, search_term: searchTerm },
			}),
			providesTags: ['PollingPlaces'],
		}),
		getPollingPlaceByStallIdLookup: builder.query<IPollingPlace, number>({
			query: (stallId) => ({
				url: 'polling_places/stall_lookup/',
				params: { stall_id: stallId },
			}),
			providesTags: ['PollingPlaces'],
		}),
		getPollingPlaceNomsHistoryById: builder.query<IPollingPlaceNomsHistory[], number>({
			query: (pollingPlaceId) => ({
				url: `polling_places/${pollingPlaceId}/noms_history/`,
			}),
			providesTags: ['PollingPlaces'],
		}),
		getPollingPlaceStallsById: builder.query<Stall[], number>({
			query: (pollingPlaceId) => ({
				url: `polling_places/${pollingPlaceId}/related_stalls/`,
			}),
			providesTags: ['PollingPlaces'],
		}),
		getPollingPlaceHistoryById: builder.query<
			{ id: number; type: PollingPlaceHistoryEventType; timestamp: string; message: string }[],
			number
		>({
			query: (pollingPlaceId) => ({
				url: `polling_places/${pollingPlaceId}/history/`,
			}),
			providesTags: ['PollingPlaces'],
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
					stall: { ...stall, deleted: false },
				},
			}),
			invalidatesTags: ['PollingPlaces'],
		}),
		updateInternalNotes: builder.mutation<void, { pollingPlaceId: number; internal_notes: string }>({
			query: ({ pollingPlaceId, internal_notes }) => ({
				url: `polling_places/${pollingPlaceId}/update_internal_notes/`,
				method: 'PATCH',
				body: {
					id: pollingPlaceId,
					internal_notes,
				},
			}),
			invalidatesTags: ['PollingPlaces'],
		}),
		deletePollingBoothNoms: builder.mutation<void, number>({
			query: (pollingPlaceId) => ({
				url: `polling_places/${pollingPlaceId}/delete_polling_place_noms/`,
				method: 'DELETE',
			}),
			invalidatesTags: ['PollingPlaces'],
		}),
	}),
});

export const {
	useGetPollingPlaceByLatLonLookupQuery,
	useGetPollingPlaceByUniqueDetailsLookupQuery,
	useGetPollingPlaceByIdLookupQuery,
	useGetPollingPlaceByIdsLookupQuery,
	useGetPollingPlaceBySearchTermQuery,
	useLazyGetPollingPlaceBySearchTermQuery,
	useGetPollingPlaceByStallIdLookupQuery,
	useGetPollingPlaceNomsHistoryByIdQuery,
	useGetPollingPlaceStallsByIdQuery,
	useGetPollingPlaceHistoryByIdQuery,
	useAddOrEditPollingBoothNomsMutation,
	useUpdateInternalNotesMutation,
	useDeletePollingBoothNomsMutation,
} = pollingPlacesApi;
