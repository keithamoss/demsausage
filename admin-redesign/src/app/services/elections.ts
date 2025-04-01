import { type EntityState, createEntityAdapter } from '@reduxjs/toolkit';
import type { eJurisdiction } from '../../features/icons/jurisdictionHelpers';
import { api } from './api';
import type { ElectionPendingStallsGamifiedUserStats } from './stalls';

export interface IGeoJSONPoylgon {
	type: string;
	coordinates: number[][][];
}

export interface ElectionModifiableProps {
	name: string;
	short_name: string;
	election_day: string; // Datetime
	jurisdiction: eJurisdiction;
	geom: IGeoJSONPoylgon;
	is_federal: boolean;
	is_state: boolean;
	is_hidden: boolean;
	is_test: boolean;
}

export type NewElection = ElectionModifiableProps;

export interface Election extends ElectionModifiableProps {
	id: number;
	is_primary: boolean;
	name_url_safe: string;
	polling_places_loaded: boolean;
	analytics_stats_saved: boolean | null;
	stats: {
		with_data: number;
		total: number;
		by_source: {
			source: string;
			count: number;
		}[];
		subs_by_type_and_day: {
			day: string; // Datetime
			[key: string]: number | null | string; // Only string because of 'day'
		}[];
		triage_actions_by_day: {
			day: string; // Datetime
			[key: string]: number | null | string; // Only string because of 'day'
		}[];
		top_submitters: {
			email: string;
			count: 2;
		}[];
		pending_subs: ElectionPendingStallsGamifiedUserStats[];
	};
}

type ElectionsResponse = Election[];

export const electionsAdapter = createEntityAdapter<Election>();

const initialState = electionsAdapter.getInitialState();
export { initialState as initialElectionsState };

export const electionsApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getElections: builder.query<EntityState<Election, number>, void>({
			query: () => 'elections/',
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
		addElection: builder.mutation<Election, NewElection>({
			query: (initialElection) => ({
				url: 'elections/',
				method: 'POST',
				body: initialElection,
			}),
			// Invalidates all Election-type queries providing the `LIST` id - after all, depending of the sort order,
			// that newly created election could show up in any lists.
			invalidatesTags: [{ type: 'Election', id: 'LIST' }],
		}),
		updateElection: builder.mutation<Election, { id: number; election: ElectionModifiableProps }>({
			query: ({ id, election }) => ({
				url: `elections/${id}/`,
				method: 'PATCH',
				body: election,
			}),
			// Invalidates all queries that subscribe to this Election `id` only.
			// In this case, `getElections` *might*  rerun, if this id was under its results.
			invalidatesTags: (result, error, { id }) => [{ type: 'Election', id }],
		}),
		// patchElection: builder.mutation<Election, Partial<Election>>({
		// 	query: (election) => ({
		// 		url: `elections/${election.id}/`,
		// 		method: 'PATCH',
		// 		body: election,
		// 	}),
		// 	// Invalidates all queries that subscribe to this Election `id` only.
		// 	// In this case, `getElections` *might*  rerun, if this id was under its results.
		// 	invalidatesTags: (result, error, { id }) => [{ type: 'Election', id }],
		// }),
		loadPollingPlaceFile: builder.mutation<
			{ job_id: string },
			{ electionId: number; jsonConfig: string | undefined; isDryRun: boolean; file: File }
		>({
			query: ({ electionId, jsonConfig, isDryRun, file }) => ({
				url: `elections/${electionId}/polling_places/`,
				method: 'PUT',
				headers: { 'Content-Disposition': 'attachment; filename=polling_places.csv' },
				formData: true,
				body: (() => {
					const data = new FormData();
					data.append('file', file);
					data.append('dry_run', isDryRun === true ? '1' : '0');
					if (jsonConfig !== undefined) {
						data.append('config', jsonConfig);
					}

					return data;
				})(),
			}),
		}),
		getPollingPlaceLoaderJobInfo: builder.query<
			{
				status: 'queued' | 'started' | 'finished' | 'failed' | 'stopped' | 'canceled' | 'cancelled';
				stages_log: string[] | null;
				response: {
					message: string;
					logs: {
						errors: string[];
						warnings: string[];
						info: string[];
					};
				} | null;
			},
			{ electionId: number; jobId: string }
		>({
			query: ({ electionId, jobId }) => ({
				url: `elections/${electionId}/polling_place_loader_job/`,
				params: { job_id: jobId },
			}),
		}),
		setPrimaryElection: builder.mutation<void, number>({
			query: (electionId) => ({
				url: `elections/${electionId}/set_primary/`,
				method: 'POST',
			}),
			invalidatesTags: [{ type: 'Election', id: 'LIST' }],
		}),
		clearElectionMapDataCache: builder.mutation<void, number>({
			query: (electionId) => ({
				url: 'map/clear_cache/',
				method: 'DELETE',
				body: { election_id: electionId },
			}),
		}),
		getImpossibilitiesReport: builder.query<
			{ type: string; name: string; passed: boolean; message: string; ids: number[] }[],
			void
		>({
			query: () => ({
				url: 'impossibilities/report/',
			}),
		}),
	}),
});

export const {
	useGetElectionsQuery,
	useAddElectionMutation,
	useUpdateElectionMutation /*, usePatchElectionMutation*/,
	useLoadPollingPlaceFileMutation,
	useGetPollingPlaceLoaderJobInfoQuery,
	useSetPrimaryElectionMutation,
	useClearElectionMapDataCacheMutation,
	useGetImpossibilitiesReportQuery,
} = electionsApi;
