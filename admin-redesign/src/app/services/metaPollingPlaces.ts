import { createEntityAdapter } from '@reduxjs/toolkit';
import type {
	IGeoJSONPoint,
	IMetaPollingPlace,
} from '../../features/metaPollingPlaceTasks/interfaces/metaPollingPlaceInterfaces';
import type { IPollingPlace, PollingPlaceWheelchairAccess } from '../../features/pollingPlaces/pollingPlacesInterfaces';
import { api } from './api';

export interface IPollingPlaceFacilityType {
	id: number;
	name: string;
}

export const metaPollingPlacesAdapter = createEntityAdapter<IPollingPlace>();

const initialState = metaPollingPlacesAdapter.getInitialState();
export { initialState as initialMetaPollingPlacesState };

export const metaPollingPlacesApi = api.injectEndpoints({
	endpoints: (builder) => ({
		// Fetch the DB-backed facility type list
		getPollingPlaceFacilityTypes: builder.query<IPollingPlaceFacilityType[], void>({
			query: () => 'polling_places_facility_types/',
			providesTags: ['PollingPlaceFacilityTypes'],
		}),

		// PATCH core MPP fields
		updateMetaPollingPlace: builder.mutation<
			IMetaPollingPlace,
			{
				id: number;
				name: string;
				premises: string;
				facilityTypeId: number | null;
				wheelchairAccess: PollingPlaceWheelchairAccess;
				wheelchairAccessDescription: string;
				geomLocation: IGeoJSONPoint;
			}
		>({
			query: ({ id, ...body }) => ({
				url: `meta_polling_places/${id}/`,
				method: 'PATCH',
				body: {
					name: body.name,
					premises: body.premises,
					facility_type: body.facilityTypeId,
					wheelchair_access: body.wheelchairAccess,
					wheelchair_access_description: body.wheelchairAccessDescription,
					geom_location: body.geomLocation,
				},
			}),
			invalidatesTags: ['MetaPollingPlaceTasks', 'MetaPollingPlaces'],
		}),

		rearrangePollingPlaces: builder.mutation<
			void,
			{
				moves: { pollingPlaceId: number; metaPollingPlaceId: number }[];
				splits: number[];
				splitJobName?: string;
			}
		>({
			query: ({ moves, splits, splitJobName }) => ({
				url: 'meta_polling_places/rearrange_from_mpp_review/',
				method: 'POST',
				body: { moves, splits, split_job_name: splitJobName },
			}),
			invalidatesTags: ['MetaPollingPlaceTasks', 'MetaPollingPlaces'],
		}),
	}),
});

export const {
	useGetPollingPlaceFacilityTypesQuery,
	useUpdateMetaPollingPlaceMutation,
	useRearrangePollingPlacesMutation,
} = metaPollingPlacesApi;
