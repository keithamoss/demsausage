import { createEntityAdapter } from '@reduxjs/toolkit';
import type { IMetaPollingPlaceTaskJobGroup } from '../../features/metaPollingPlaceTasks/metaPollingPlaceTasksInterfaces';
import type { IPollingPlace } from '../../features/pollingPlaces/pollingPlacesInterfaces';
import { api } from './api';

export const metaPollingPlaceTaskAdapter = createEntityAdapter<IPollingPlace>();

const initialState = metaPollingPlaceTaskAdapter.getInitialState();
export { initialState as initialMetaPollingPlaceTasksState };

export const metaPollingPlaceTasksApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getMetaPollingPlaceTaskJobGroups: builder.query<IMetaPollingPlaceTaskJobGroup[], void>({
			query: () => 'meta_polling_places/tasks/',
			// This is a very inelegant approach to tag-based cache invalidation, but it'll do.
			// We could make it far more nuanced and only validate specific things, but sod it.
			providesTags: ['MetaPollingPlaceTasks'],
		}),
		// getPollingPlaceByIdsLookup: builder.query<IPollingPlace[], { electionId: number; pollingPlaceIds: number[] }>({
		//   query: ({ electionId, pollingPlaceIds }) => ({
		//     url: 'polling_places/search/',
		//     params: { election_id: electionId, ids: pollingPlaceIds },
		//   }),
		//   providesTags: ['MetaPollingPlaceTasks'],
		// }),
		// addOrEditPollingBoothNoms: builder.mutation<
		//   void,
		//   { pollingPlaceId: number; stall: Partial<IPollingPlaceStallModifiableProps> }
		// >({
		//   query: ({ pollingPlaceId, stall }) => ({
		//     url: `polling_places/${pollingPlaceId}/`,
		//     method: 'PATCH',
		//     body: {
		//       id: pollingPlaceId,
		//       stall: { ...stall, deleted: false },
		//     },
		//   }),
		//   invalidatesTags: ['MetaPollingPlaceTasks'],
		// }),
		// updateInternalNotes: builder.mutation<void, { pollingPlaceId: number; internal_notes: string }>({
		//   query: ({ pollingPlaceId, internal_notes }) => ({
		//     url: `polling_places/${pollingPlaceId}/update_internal_notes/`,
		//     method: 'PATCH',
		//     body: {
		//       id: pollingPlaceId,
		//       internal_notes,
		//     },
		//   }),
		//   invalidatesTags: ['MetaPollingPlaceTasks'],
		// }),
		// deletePollingBoothNoms: builder.mutation<void, number>({
		//   query: (pollingPlaceId) => ({
		//     url: `polling_places/${pollingPlaceId}/delete_polling_place_noms/`,
		//     method: 'DELETE',
		//   }),
		//   invalidatesTags: ['MetaPollingPlaceTasks'],
		// }),
	}),
});

export const { useGetMetaPollingPlaceTaskJobGroupsQuery } = metaPollingPlaceTasksApi;
