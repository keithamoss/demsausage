import { createEntityAdapter } from '@reduxjs/toolkit';
import type { IMetaPollingPlaceLinkType } from '../../features/metaPollingPlaceTasks/interfaces/metaPollingPlaceLinksInterfaces';
import type { IPollingPlace } from '../../features/pollingPlaces/pollingPlacesInterfaces';
import { api } from './api';

export const metaPollingPlaceLinkAdapter = createEntityAdapter<IPollingPlace>();

const initialState = metaPollingPlaceLinkAdapter.getInitialState();
export { initialState as initialMetaPollingPlaceLinksState };

export const metaPollingPlaceLinksApi = api.injectEndpoints({
	endpoints: (builder) => ({
		addLink: builder.mutation<void, { type: IMetaPollingPlaceLinkType; url: string; meta_polling_place_id: number }>({
			query: ({ type, url, meta_polling_place_id }) => ({
				url: 'meta_polling_places/links/',
				method: 'POST',
				body: {
					type,
					url,
					meta_polling_place: meta_polling_place_id,
				},
			}),
			// @TODO This is very hacky, but it works for now. We need to invalidate anything that may have a representation of a link in it, which could be quite wide - so just invalidate all tasks.
			invalidatesTags: ['MetaPollingPlaceTasks'],
		}),
	}),
});

export const { useAddLinkMutation } = metaPollingPlaceLinksApi;
