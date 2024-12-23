import { Alert, AlertTitle, List, ListItem, ListItemText } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { Coordinate } from 'ol/coordinate';
import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks/store';
import { getStringParamOrEmptyString } from '../../../app/routing/routingHelpers';
import { Election } from '../../../app/services/elections';
import { useFetchMapboxGeocodingResultsQuery } from '../../../app/services/mapbox';
import { useGetPollingPlaceByLatLonLookupQuery } from '../../../app/services/pollingPlaces';
import { selectMapFilterSettings } from '../../app/appSlice';
import { doesPollingPlaceSatisifyFilterCriteria, hasFilterOptions } from '../../map/mapFilterHelpers';
import { IPollingPlace } from '../../pollingPlaces/pollingPlacesInterfaces';
import {
	EMapboxPlaceType,
	IMapboxGeocodingAPIResponseFeature,
	defaultMapboxSearchTypes,
	getLonLatFromString,
	getMapboxAPIKey,
	getMapboxSearchParamsForElection,
	isSearchingYet,
	onViewOnMap,
} from '../searchBarHelpers';
import SearchResultsPollingPlaceCard from '../shared/searchResultsPollingPlaceCard';
import SearchBar from './searchBar/searchBar';
import SearchByAddressOrGPSResultsContainer from './searchResultsContainer/searchByAddressOrGPSResultsContainer';

interface Props {
	election: Election;
	autoFocusSearchField?: boolean;
	mapboxSearchTypes?: EMapboxPlaceType[];
	enableFiltering?: boolean;
	enableViewOnMap?: boolean;
	onMapboxSearchTermChange: (searchTerm: string) => void;
	onChooseMapboxSearchResult: (feature: IMapboxGeocodingAPIResponseFeature) => void;
	onGPSControlClicked: () => void;
	onGPSLocationAcquired: (currentPosition: Coordinate) => void;
	onChoosePollingPlaceLabel: string;
	onChoosePollingPlace: (pollingPlace: IPollingPlace) => void;
	onGoBackFromSearch: () => void;
	onDiscardSearch: () => void;
}

export default function SearchComponent(props: Props) {
	const {
		election,
		autoFocusSearchField,
		mapboxSearchTypes,
		enableFiltering,
		enableViewOnMap,
		onMapboxSearchTermChange,
		onChooseMapboxSearchResult,
		onGPSControlClicked,
		onGPSLocationAcquired,
		onChoosePollingPlaceLabel,
		onChoosePollingPlace,
		onGoBackFromSearch,
		onDiscardSearch,
	} = {
		...{
			autoFocusSearchField: false,
			enableFiltering: true,
			enableViewOnMap: true,
			// We allow the types to be overridden so we can further constrain the types e.g. When we're using it to let people add stalls when there are no official polling places available yet.
			mapboxSearchTypes: defaultMapboxSearchTypes,
		},
		...props,
	};

	const params = useParams();
	const navigate = useNavigate();

	const urlSearchTerm = getStringParamOrEmptyString(params, 'search_term');

	const urlLonLatFromSearch = getStringParamOrEmptyString(params, 'place_lon_lat');
	const urlLonLatFromGPS = getStringParamOrEmptyString(params, 'gps_lon_lat');
	const urlLonLat = urlLonLatFromGPS !== '' ? urlLonLatFromGPS : urlLonLatFromSearch;

	const mapFilterSettings = useAppSelector((state) => selectMapFilterSettings(state, election.id));

	// ######################
	// Mapbox Search Query
	// ######################
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

	const onChoose = useCallback(
		(feature: IMapboxGeocodingAPIResponseFeature) => () => {
			onChooseMapboxSearchResult(feature);
		},
		[onChooseMapboxSearchResult],
	);
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

	const pollingPlaceNearbyResultsFiltered =
		isFetchingNearbyPollingPlaces === false &&
		isSuccessFetchingNearbyPollingPlaces === true &&
		pollingPlaceNearbyResults !== undefined
			? pollingPlaceNearbyResults.filter(
					(pollingPlace) =>
						doesPollingPlaceSatisifyFilterCriteria(pollingPlace, mapFilterSettings, election.id) === true,
				)
			: undefined;

	const onClickViewOnMap = useCallback(
		() => onViewOnMap(params, navigate, pollingPlaceNearbyResultsFiltered),
		[params, navigate, pollingPlaceNearbyResultsFiltered],
	);
	// ######################
	// Polling Place Search Query (End)
	// ######################

	return (
		<React.Fragment>
			<SearchBar
				election={election}
				autoFocusSearchField={autoFocusSearchField}
				enableFiltering={enableFiltering}
				isFetching={isFetchingNearbyPollingPlaces === true || isFetchingMapboxResults === true}
				onMapboxSearchTermChange={onMapboxSearchTermChange}
				onGPSControlClicked={onGPSControlClicked}
				onGPSLocationAcquired={onGPSLocationAcquired}
				onDiscardSearch={onDiscardSearch}
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
					<List sx={{ pt: 0 }}>
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
			{errorFetchingNearbyPollingPlaces !== undefined && (
				<Alert severity="error">
					<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
					Something went awry when we tried to load your list of polling places.
				</Alert>
			)}

			{pollingPlaceNearbyResultsFiltered !== undefined && (
				<SearchByAddressOrGPSResultsContainer
					numberOfResults={pollingPlaceNearbyResultsFiltered.length}
					isFiltered={hasFilterOptions(mapFilterSettings, election.id) === true}
					isSearchingByGPS={urlLonLatFromGPS !== ''}
					pollingPlacesLoaded={election.polling_places_loaded}
					enableViewOnMap={enableViewOnMap}
					onViewOnMap={onClickViewOnMap}
					onGoBackFromSearch={onGoBackFromSearch}
				>
					{pollingPlaceNearbyResultsFiltered.map((pollingPlace) => (
						<SearchResultsPollingPlaceCard
							key={pollingPlace.id}
							pollingPlace={pollingPlace}
							onChoosePollingPlaceLabel={onChoosePollingPlaceLabel}
							onChoosePollingPlace={onChoosePollingPlace}
						/>
					))}
				</SearchByAddressOrGPSResultsContainer>
			)}
		</React.Fragment>
	);
}
