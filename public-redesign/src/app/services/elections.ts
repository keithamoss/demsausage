import { type EntityState, createEntityAdapter } from '@reduxjs/toolkit';
import type { jurisdictionCrests } from '../../features/icons/jurisdictionHelpers';
import { api } from './api';
import type { ISausagelyticsFederalStats, ISausagelyticsStateStats } from './electionsStats';

export interface IGeoJSONPoylgon {
	type: string;
	coordinates: number[][][];
}

export interface Election {
	id: number;
	name: string;
	name_url_safe: string;
	short_name: string;
	geom: IGeoJSONPoylgon;
	is_hidden: boolean;
	is_primary: boolean;
	is_federal: boolean;
	election_day: string; // Datetime
	polling_places_loaded: boolean;
	jurisdiction: keyof typeof jurisdictionCrests;
}

type ElectionsResponse = Election[];

export const electionsAdapter = createEntityAdapter<Election>();

const initialState = electionsAdapter.getInitialState();
export { initialState as initialElectionsState };

export const electionsApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getElections: builder.query<EntityState<Election, number>, void>({
			query: () => 'elections/public/',
			transformResponse: (res: ElectionsResponse) => {
				return electionsAdapter.setAll(initialState, res);
			},
			// Provides a list of `Elections` by `id`.
			// If any mutation is executed that `invalidate`s any of these tags, this query will re-run to be always up-to-date.
			// The `LIST` id is a "virtual id" we just made up to be able to invalidate this query specifically if a new `Elections` element was added.
			providesTags: (result) => [
				// Always invalidate the election list, so when errors occur we still force a refresh on the LIST
				{ type: 'Election', id: 'LIST' },
				...(result !== undefined ? result.ids.map((id) => ({ type: 'Election' as const, id })) : []),
			],
			// async onQueryStarted(arg, { dispatch, queryFulfilled }) {
			// 	const result = await queryFulfilled;
			// 	const defaultElection = getDefaultElection((Object.values(result.data.entities) as Election[]) || []);
			// 	dispatch(setActiveElectionId(defaultElection?.id));
			// },
		}),
		getElectionStats: builder.query<ISausagelyticsFederalStats | ISausagelyticsStateStats, number>({
			query: (electionId) => `elections/${electionId}/stats/`,
		}),
		// addMap: builder.mutation<Map, Partial<Map>>({
		// 	query: (initialMap) => ({
		// 		url: 'maps/',
		// 		method: 'POST',
		// 		body: initialMap,
		// 	}),
		// 	// Invalidates all Map-type queries providing the `LIST` id - after all, depending of the sort order,
		// 	// that newly created map could show up in any lists.
		// 	invalidatesTags: [{ type: 'Map', id: 'LIST' }],
		// }),
		// updateMap: builder.mutation<Map, Partial<Map>>({
		// 	query: (map) => ({
		// 		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		// 		url: `maps/${map.id}/`,
		// 		method: 'PUT',
		// 		body: map,
		// 	}),
		// 	// Invalidates all queries that subscribe to this Map `id` only.
		// 	// In this case, `getMap` will be re-run. `getMaps` *might*  rerun, if this id was under its results.
		// 	invalidatesTags: (result, error, { id }) => [{ type: 'Map', id }],
		// }),
		// patchMap: builder.mutation<Map, Partial<Map>>({
		// 	query: (map) => ({
		// 		// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
		// 		url: `maps/${map.id}/`,
		// 		method: 'PATCH',
		// 		body: map,
		// 	}),
		// 	// Invalidates all queries that subscribe to this Map `id` only.
		// 	// In this case, `getMap` will be re-run. `getMaps` *might*  rerun, if this id was under its results.
		// 	invalidatesTags: (result, error, { id }) => [{ type: 'Map', id }],
		// }),
	}),
});

export const {
	useGetElectionsQuery,
	useGetElectionStatsQuery /*, useAddMapMutation, useUpdateMapMutation, usePatchMapMutation*/,
} = electionsApi;
