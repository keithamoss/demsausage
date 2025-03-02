import type {
	IMapboxGeocodingAPIV6Response,
	IMapboxSearchboxAPIV1Response,
} from '../../features/search/searchBarHelpers';
import { api } from './api';

export const mapboxGeocodingApi = api.injectEndpoints({
	endpoints: (builder) => ({
		fetchMapboxGeocodingResults: builder.query<IMapboxGeocodingAPIV6Response, { url: string }>({
			query: ({ url }) => ({
				url,
			}),
		}),
		fetchMapboxSearchboxResults: builder.query<IMapboxSearchboxAPIV1Response, { url: string }>({
			query: ({ url }) => ({
				url,
			}),
		}),
	}),
});

export const { useFetchMapboxGeocodingResultsQuery, useFetchMapboxSearchboxResultsQuery } = mapboxGeocodingApi;
