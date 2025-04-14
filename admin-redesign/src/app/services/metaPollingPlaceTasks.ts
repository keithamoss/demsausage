import { createEntityAdapter } from '@reduxjs/toolkit';
import type {
	IMetaPollingPlaceTaskJob,
	IMetaPollingPlaceTaskJobGroup,
	IMetaPollingPlaceTaskJobModifiableProps,
} from '../../features/metaPollingPlaceTasks/interfaces/metaPollingPlaceTasksInterfaces';
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
		createJob: builder.mutation<{ job_name: string; tasks_created: number }, { electionId: number; taskCount: number }>(
			{
				query: ({ electionId, taskCount }) => ({
					url: 'meta_polling_places/tasks/create_job/',
					method: 'POST',
					body: { election_id: electionId, max_tasks: taskCount },
				}),
				invalidatesTags: ['MetaPollingPlaceTasks'],
			},
		),
		// Null response indicates no more tasks in the queue for this job
		getNextTaskFromMetaPollingPlaceTaskJobGroup: builder.query<IMetaPollingPlaceTaskJob | null, string>({
			query: (job_name) => ({ url: 'meta_polling_places/tasks/next/', params: { job_name } }),
			// @TODO Check for caching bug?
			providesTags: ['MetaPollingPlaceTasks'],
		}),
		getTask: builder.query<IMetaPollingPlaceTaskJob, number>({
			query: (id) => `meta_polling_places/tasks/${id}/`,
			providesTags: ['MetaPollingPlaceTasks'],
		}),
		addTask: builder.mutation<void, Partial<IMetaPollingPlaceTaskJobModifiableProps>>({
			query: (body) => ({
				url: 'meta_polling_places/tasks/',
				method: 'POST',
				body,
			}),
			// @TODO This is very hacky, but it works for now. We need to invalidate anything that may have a representation of a link in it, which could be quite wide - so just invalidate all tasks.
			invalidatesTags: ['MetaPollingPlaceTasks'],
		}),
		createCompletedTask: builder.mutation<void, Partial<IMetaPollingPlaceTaskJobModifiableProps>>({
			query: (body) => ({
				url: 'meta_polling_places/tasks/createCompletedTask/',
				method: 'POST',
				body,
			}),
			invalidatesTags: ['MetaPollingPlaceTasks'],
		}),
		closeTask: builder.mutation<void, { id: number; remarks: string }>({
			query: ({ id, remarks }) => ({
				url: `meta_polling_places/tasks/${id}/close/`,
				method: 'POST',
				body: { remarks },
			}),
			invalidatesTags: ['MetaPollingPlaceTasks'],
		}),
		deferTask: builder.mutation<void, { id: number; remarks: string }>({
			query: ({ id, remarks }) => ({
				url: `meta_polling_places/tasks/${id}/defer/`,
				method: 'POST',
				body: { remarks },
			}),
			invalidatesTags: ['MetaPollingPlaceTasks'],
		}),
		completeTask: builder.mutation<void, number>({
			query: (id) => ({
				url: `meta_polling_places/tasks/${id}/complete/`,
				method: 'POST',
			}),
			invalidatesTags: ['MetaPollingPlaceTasks'],
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

export const {
	useGetMetaPollingPlaceTaskJobGroupsQuery,
	useCreateJobMutation,
	useGetNextTaskFromMetaPollingPlaceTaskJobGroupQuery,
	useGetTaskQuery,
	useAddTaskMutation,
	useCreateCompletedTaskMutation,
	useCloseTaskMutation,
	useDeferTaskMutation,
	useCompleteTaskMutation,
} = metaPollingPlaceTasksApi;
