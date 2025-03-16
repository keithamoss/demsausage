import {
	type EMapboxFeatureType,
	type IMapboxGeocodingAPIV6Response,
	type IMapboxSearchboxAPIV1Response,
	getMapboxAPIKey,
	getMapboxPOICategories,
} from '../../features/search/searchBarHelpers';
import { api } from './api';

export const mapboxGeocodingApi = api.injectEndpoints({
	endpoints: (builder) => ({
		fetchMapboxGeocodingResults: builder.query<IMapboxGeocodingAPIV6Response, { url: string }>({
			query: ({ url }) => ({
				url,
			}),
		}),
		fetchMapboxSearchboxResults: builder.query<
			IMapboxSearchboxAPIV1Response,
			{ searchTerm: string; types: EMapboxFeatureType[]; country?: string; bbox?: [number, number, number, number] }
		>({
			query: ({ searchTerm, types, country, bbox }) => ({
				url: 'https://api.mapbox.com/search/searchbox/v1/forward',
				params: {
					q: searchTerm,
					limit: 10,
					proximity: 'ip',
					poi_category: getMapboxPOICategories(),
					auto_complete: 'true',
					types,
					country,
					bbox,
					access_token: getMapboxAPIKey(),
				},
			}),
		}),
	}),
});

export const { useFetchMapboxGeocodingResultsQuery, useFetchMapboxSearchboxResultsQuery } = mapboxGeocodingApi;
