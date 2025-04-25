import { createEntityAdapter } from '@reduxjs/toolkit';
import type { IPollingPlace } from '../../features/pollingPlaces/pollingPlacesInterfaces';
import { api } from './api';

export const metaPollingPlacesAdapter = createEntityAdapter<IPollingPlace>();

const initialState = metaPollingPlacesAdapter.getInitialState();
export { initialState as initialMetaPollingPlacesState };

export const metaPollingPlacesApi = api.injectEndpoints({
	endpoints: (builder) => ({
		rearrangePollingPlaces: builder.mutation<
			void,
			{ moves: { pollingPlaceId: number; metaPollingPlaceId: number }[]; splits: number[] }
		>({
			query: ({ moves, splits }) => ({
				url: 'meta_polling_places/rearrange_from_mpp_review/',
				method: 'POST',
				body: { moves, splits },
			}),
			invalidatesTags: ['MetaPollingPlaceTasks', 'MetaPollingPlaces'],
		}),
	}),
});

export const { useRearrangePollingPlacesMutation } = metaPollingPlacesApi;
