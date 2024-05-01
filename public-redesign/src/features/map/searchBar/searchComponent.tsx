import { Alert, AlertTitle, List, ListItem, ListItemText } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import View from 'ol/View';
import { transformExtent } from 'ol/proj';
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks/store';
import { getStringParamOrEmptyString, getStringParamOrUndefined } from '../../../app/routing/routingHelpers';
import { Election } from '../../../app/services/elections';
import { useFetchMapboxGeocodingResultsQuery } from '../../../app/services/mapbox';
import {
	useGetPollingPlaceByIdsLookupQuery,
	useGetPollingPlaceByLatLonLookupQuery,
} from '../../../app/services/pollingPlaces';
import { getCSVStringsAsFloats } from '../../../app/utils';
import { selectMapFilterOptions } from '../../app/appSlice';
import { IPollingPlace } from '../../pollingPlaces/pollingPlacesInterfaces';
import { createURLHashFromView } from '../mapHelpers';
import { doesPollingPlaceSatisifyFilterCriteria } from '../map_stuff';
import PollingPlaceSearchResultsCard from './pollingPlacesNearbySearchResults/pollingPlaceSearchResultsCard';
import PollingPlacesNearbySearchResultsContainer from './pollingPlacesNearbySearchResults/pollingPlacesNearbySearchResultsContainer';
import SearchBar from './searchBar';
import {
	EMapboxPlaceType,
	IMapboxGeocodingAPIResponseFeature,
	defaultMapboxSearchTypes,
	getBBoxExtentFromString,
	getBBoxFromPollingPlaces,
	getLonLatFromString,
	getMapboxAPIKey,
	getMapboxSearchParamsForElection,
	isSearchingYet,
} from './searchBarHelpers';

interface Props {
	election: Election;
	autoFocusSearchField?: boolean;
	mapboxSearchTypes?: EMapboxPlaceType[];
	enableFiltering?: boolean;
	onChoosePollingPlace?: (pollingPlace: IPollingPlace) => void;
}

export default function SearchComponent(props: Props) {
	const { election, autoFocusSearchField, mapboxSearchTypes, enableFiltering, onChoosePollingPlace } = {
		...{
			autoFocusSearchField: false,
			enableFiltering: true,
			// We allow the types to be overridden so we can further constrain the types e.g. When we're using it to let people add stalls when there are no official polling places available yet.
			mapboxSearchTypes: defaultMapboxSearchTypes,
		},
		...props,
	};

	// const dispatch = useAppDispatch();
	const navigate = useNavigate();

	// @TODO Should all onXXXX functions here be useMemo'd or is that bad for some reason?

	const urlElectionName = getStringParamOrUndefined(useParams(), 'election_name');
	const urlSearchTerm = getStringParamOrEmptyString(useParams(), 'search_term');

	const urlLonLatFromSearch = getStringParamOrEmptyString(useParams(), 'lon_lat');
	const urlLonLatFromGPS = getStringParamOrEmptyString(useParams(), 'gps_lon_lat');
	const urlLonLat = urlLonLatFromGPS !== '' ? urlLonLatFromGPS : urlLonLatFromSearch;

	const urlPollingPlaceIds = getCSVStringsAsFloats(getStringParamOrEmptyString(useParams(), 'polling_place_ids'));

	const mapFilterOptions = useAppSelector((state) => selectMapFilterOptions(state));

	// ######################
	// Mapbox Search Query
	// ######################
	// Move or doco some of this to mapbox.ts or a Mapbox utils file?
	const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${urlSearchTerm}.json?limit=10&proximity=ip&types=${mapboxSearchTypes.join(
		'%2C',
	)}&access_token=${getMapboxAPIKey()}&${getMapboxSearchParamsForElection(election)}`;
	const {
		data: mapboxSearchResults,
		error: errorFetchingMapboxResults,
		isFetching: isFetchingMapboxResults,
		isSuccess: isSuccessFetchingMapboxResults,
	} = useFetchMapboxGeocodingResultsQuery(
		isSearchingYet(urlSearchTerm) === true && urlLonLat === '' ? { url } : skipToken,
	);

	const onChoose = (feature: IMapboxGeocodingAPIResponseFeature) => () => {
		console.log('onChoose', feature);

		navigate(`/${urlElectionName}/search/location/${feature.place_name}/${feature.geometry.coordinates.join(',')}/`, {
			state: { cameFromSearchDrawerOrMap: true },
		});
	};
	// ######################
	// Mapbox Search Query (End)
	// ######################

	// ######################
	// Polling Place Search Query
	// ######################
	const {
		data: pollingPlaceNearbyResults,
		error: errorFetchingNearbyPollingPlaces,
		isFetching: isFetchingNearbyPollingPlaces,
		isSuccess: isSuccessFetchingNearbyPollingPlaces,
	} = useGetPollingPlaceByLatLonLookupQuery(
		urlLonLat !== '' ? { electionId: election.id, ...getLonLatFromString(urlLonLat) } : skipToken,
	);
	// ######################
	// Polling Place Search Query (End)
	// ######################

	// ######################
	// Polling Place By Ids Query
	// ######################
	const {
		data: pollingPlaceByIdsResult,
		error: errorFetchingPollingPlacesByIds,
		isFetching: isFetchingPollingPlacesByIds,
		isSuccess: isSuccessFetchingPollingPlacesByIds,
	} = useGetPollingPlaceByIdsLookupQuery(
		urlPollingPlaceIds.length >= 1 ? { electionId: election.id, pollingPlaceIds: urlPollingPlaceIds } : skipToken,
	);
	// ######################
	// Polling Place By Ids Query (End)
	// ######################

	// ######################
	// Polling Place Search Results Combiner
	// ######################
	const pollingPlaceNearbyResultsCombined =
		isFetchingNearbyPollingPlaces === false &&
		isSuccessFetchingNearbyPollingPlaces === true &&
		pollingPlaceNearbyResults !== undefined
			? pollingPlaceNearbyResults
			: isFetchingPollingPlacesByIds === false &&
			  isSuccessFetchingPollingPlacesByIds === true &&
			  pollingPlaceByIdsResult !== undefined
			? pollingPlaceByIdsResult
			: undefined;

	const pollingPlaceNearbyResultsFiltered =
		pollingPlaceNearbyResultsCombined !== undefined
			? pollingPlaceNearbyResultsCombined.filter(
					(pollingPlace) => doesPollingPlaceSatisifyFilterCriteria(pollingPlace, mapFilterOptions) === true,
			  )
			: undefined;
	// ######################
	// Polling Place Search Results Combiner (End)
	// ######################

	// ######################
	// Polling Place Search Results
	// ######################
	const onViewOnMap = () => {
		if (pollingPlaceNearbyResultsFiltered !== undefined) {
			const bbox = getBBoxFromPollingPlaces(pollingPlaceNearbyResultsFiltered);
			const bboxNumbers = getBBoxExtentFromString(Object.values(bbox).join(','));

			if (bboxNumbers !== undefined) {
				const bboxNumbersTransformed = transformExtent(bboxNumbers, 'EPSG:4326', 'EPSG:3857');

				const view = new View();

				view.fit(bboxNumbersTransformed, {
					// top, right, bottom, left
					// @TODO Make this work for embedded mode
					// if not undefined, assume embedded mode and only set padding of 50 bottom
					// padding: mapSearchResults.padding !== undefined ? [0, 0, 50, 0] : [85, 0, 20, 0],
					padding: [48, 20, 98, 20],
				});

				const url = createURLHashFromView(view);

				if (url !== undefined) {
					navigate(`/${urlElectionName}#${url}`, {
						state: { cameFromSearchDrawerOrMap: true },
					});
				}
			}
		}
	};
	// ######################
	// Polling Place Search Results (End)
	// ######################

	return (
		<React.Fragment>
			<SearchBar
				autoFocusSearchField={autoFocusSearchField}
				enableFiltering={enableFiltering}
				isFetching={isFetchingNearbyPollingPlaces === true || isFetchingMapboxResults === true}
			/>

			{/* Handles not found and all other types of error */}
			{errorFetchingMapboxResults !== undefined && (
				<Alert severity="error">
					<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
					Something went awry when we tried to search for that place.
				</Alert>
			)}

			{isFetchingMapboxResults === false &&
				isSuccessFetchingMapboxResults === true &&
				mapboxSearchResults !== undefined &&
				urlLonLat === '' && (
					<List>
						{mapboxSearchResults === null && (
							<ListItem>
								<ListItemText primary="An error occurred"></ListItemText>
							</ListItem>
						)}

						{typeof mapboxSearchResults === 'object' &&
							mapboxSearchResults !== null &&
							mapboxSearchResults.features.length === 0 && (
								<ListItem>
									<ListItemText primary="No results found"></ListItemText>
								</ListItem>
							)}

						{isSearchingYet(urlSearchTerm) === true &&
							typeof mapboxSearchResults === 'object' &&
							mapboxSearchResults !== null &&
							mapboxSearchResults.features.length > 0 &&
							mapboxSearchResults.features.map((feature) => {
								const [place_name_first_part, ...place_name_rest] = feature.place_name.split(', ');
								const matches = match(place_name_first_part, urlSearchTerm, {
									insideWords: true,
								});
								const parts = parse(place_name_first_part, matches);

								return (
									<ListItem key={feature.id} onClick={onChoose(feature)} sx={{ cursor: 'pointer' }}>
										<ListItemText
											primary={
												<span>
													{parts.map((part, index) => (
														<span
															key={index}
															style={{
																fontWeight: part.highlight ? 700 : 400,
															}}
														>
															{part.text}
														</span>
													))}
												</span>
											}
											secondary={place_name_rest.join(', ')}
										></ListItemText>
									</ListItem>
								);
							})}
					</List>
				)}

			{/* Handles not found and all other types of error */}
			{(errorFetchingNearbyPollingPlaces !== undefined || errorFetchingPollingPlacesByIds !== undefined) && (
				<Alert severity="error">
					<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
					Something went awry when we tried to load your list of polling places.
				</Alert>
			)}

			{pollingPlaceNearbyResultsFiltered !== undefined && (
				<PollingPlacesNearbySearchResultsContainer
					numberOfResults={pollingPlaceNearbyResultsFiltered.length}
					onViewOnMap={onViewOnMap}
				>
					{pollingPlaceNearbyResultsFiltered.map((pollingPlace) => (
						<PollingPlaceSearchResultsCard
							key={pollingPlace.id}
							pollingPlace={pollingPlace}
							onChoosePollingPlace={onChoosePollingPlace || undefined}
						/>
					))}
				</PollingPlacesNearbySearchResultsContainer>
			)}
		</React.Fragment>
	);
}
