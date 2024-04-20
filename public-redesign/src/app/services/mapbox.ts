import { IMapboxGeocodingAPIResponse } from '../../features/map/searchBar/searchBarHelpers';
import { api } from './api';

export const mapboxGeocodingApi = api.injectEndpoints({
	endpoints: (builder) => ({
		fetchMapboxGeocodingResults: builder.query<IMapboxGeocodingAPIResponse, { url: string }>({
			query: ({ url }) => ({
				url,
			}),
		}),
	}),
});

export const { useFetchMapboxGeocodingResultsQuery } = mapboxGeocodingApi;
