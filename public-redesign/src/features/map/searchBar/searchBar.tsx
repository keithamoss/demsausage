import CloseIcon from '@mui/icons-material/Close';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import {
	Alert,
	AlertTitle,
	Badge,
	Chip,
	Divider,
	IconButton,
	InputAdornment,
	InputBase,
	LinearProgress,
	List,
	ListItem,
	ListItemText,
	Paper,
	debounce,
} from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import * as Sentry from '@sentry/browser';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Geolocation from 'ol/Geolocation';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks/store';
import { getStringParamOrEmptyString, getStringParamOrUndefined } from '../../../app/routing/routingHelpers';
import { Election } from '../../../app/services/elections';
import { useFetchMapboxGeocodingResultsQuery } from '../../../app/services/mapbox';
import { useGetPollingPlaceByLatLonLookupQuery } from '../../../app/services/pollingPlaces';
import { mapaThemeSecondaryBlue } from '../../../app/ui/theme';
import {
	ESearchDrawerSubComponent,
	selectIsMapFiltered,
	selectMapFilterOptions,
	selectNumberOfMapFilterOptionsApplied,
	selectSearchBarInitialMode,
	setSearchBarSearchLonLat,
	setSearchBarSearchText,
} from '../../app/appSlice';
import { IPollingPlace } from '../../pollingPlaces/pollingPlacesInterfaces';
import { doesPollingPlaceSatisifyFilterCriteria } from '../map_stuff';
import PollingPlaceSearchResultsCard from './pollingPlacesNearbySearchResults/pollingPlaceSearchResultsCard';
import PollingPlacesNearbySearchResultsContainer from './pollingPlacesNearbySearchResults/pollingPlacesNearbySearchResultsContainer';
import './searchBar.css';
import SearchBarFilter from './searchBarFilter/searchBarFilter';
import {
	EMapboxPlaceType,
	IMapboxGeocodingAPIResponseFeature,
	defaultMapboxSearchTypes,
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

export default function SearchBar(props: Props) {
	const { election, autoFocusSearchField, mapboxSearchTypes, enableFiltering, onChoosePollingPlace } = {
		...{
			autoFocusSearchField: false,
			enableFiltering: true,
			// We allow the types to be overridden so we can further constrain the types e.g. When we're using it to let people add stalls when there are no official polling places available yet.
			mapboxSearchTypes: defaultMapboxSearchTypes,
		},
		...props,
	};

	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	// @TODO Should all onXXXX functions here be useMemo'd or is that bad for some reason?

	const [localSearchTerm, setLocalSearchTerm] = useState('');
	const [isUserTyping, setIsUserTyping] = useState(false);

	const urlElectionName = getStringParamOrUndefined(useParams(), 'election_name');
	const urlSearchTerm = getStringParamOrEmptyString(useParams(), 'search_term');

	const urlLonLatFromSearch = getStringParamOrEmptyString(useParams(), 'lon_lat');
	const urlLonLatFromGPS = getStringParamOrEmptyString(useParams(), 'gps_lon_lat');
	const urlLonLat = urlLonLatFromGPS !== '' ? urlLonLatFromGPS : urlLonLatFromSearch;

	// When the user navigates back/forward, or reloads the page, we
	// just need to handle setting the search term based on what's in
	// the URL of the page.
	if (isUserTyping === false && localSearchTerm !== urlSearchTerm) {
		// console.log('Set localSearchTerm to', urlSearchTerm);
		setLocalSearchTerm(urlSearchTerm);
	}

	// Synch local state with the Redux store so SearchBarCosmeticNonFunctional
	// and other components can consume information about the user's search criteria.
	useEffect(() => {
		dispatch(setSearchBarSearchText(urlSearchTerm));
	}, [dispatch, urlSearchTerm]);

	useEffect(() => {
		dispatch(setSearchBarSearchLonLat(urlLonLat));
	}, [dispatch, urlLonLat]);

	// @TODO Why does this exist again and is this really the best name for it?
	const searchBarInitialMode = useAppSelector((state) => selectSearchBarInitialMode(state));

	const mapFilterOptions = useAppSelector((state) => selectMapFilterOptions(state));
	const isMapFiltered = useAppSelector(selectIsMapFiltered);
	const numberOfMapFilterOptionsApplied = useAppSelector(selectNumberOfMapFilterOptionsApplied);

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
			state: { cameFromSearchDrawer: true },
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

	const pollingPlaceNearbyResultsFiltered =
		isFetchingNearbyPollingPlaces === false &&
		isSuccessFetchingNearbyPollingPlaces === true &&
		pollingPlaceNearbyResults !== undefined &&
		pollingPlaceNearbyResults.length > 0
			? pollingPlaceNearbyResults.filter(
					(pollingPlace) => doesPollingPlaceSatisifyFilterCriteria(pollingPlace, mapFilterOptions) === true,
			  )
			: undefined;
	// ######################
	// Polling Place Search Query (End)
	// ######################

	// ######################
	// Search Field
	// ######################
	const debouncedNavigateOnSearchTermChange = useMemo(
		() =>
			debounce((searchTerm: string) => {
				if (isSearchingYet(searchTerm) === false) {
					return;
				}

				setIsUserTyping(false);
				navigate(`/${urlElectionName}/search/location/${searchTerm}/`);
			}, 400),
		[navigate, urlElectionName],
	);

	const onChangeSearchField = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
		console.log('onChangeSearchField', event.target.value);

		debouncedNavigateOnSearchTermChange(event.target.value);

		setIsUserTyping(true);

		setLocalSearchTerm(event.target.value);
	};

	const searchFieldRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

	// For some reason autoFocus={autoFocusSearchField} on InputBase
	// isn't working when the user comes from the <Map> using the 'Clear'
	// button. Oddly, it works if the user clicks on the InputBase in
	// the separate cosmetic SearchBar component.
	// So this makes auto focus work for that first case.
	window.setTimeout(() => {
		if (
			autoFocusSearchField === true &&
			searchFieldRef.current !== null &&
			document.activeElement !== searchFieldRef.current &&
			isWaitingForGPSLocation === false &&
			isGeolocationErrored === false
		) {
			// console.log('> Focus hack');
			searchFieldRef.current.focus();
		}
	}, 50);

	const onClearSearchBar = () => {
		navigate(`/${urlElectionName}/search/`);

		if (searchFieldRef.current !== null && document.activeElement !== searchFieldRef.current) {
			searchFieldRef.current.focus();
		}
	};
	// ######################
	// Search Field (End)
	// ######################

	// ######################
	// GPS Control
	// ######################
	const geolocationEventKeys = useRef<EventsKey[]>([]);
	const [isWaitingForGPSLocation, setIsWaitingForGPSLocation] = useState<boolean>(false);
	const [isGeolocationErrored, setIsGeolocationErrored] = useState<boolean>(false);
	const [geolocationErrorMessage, setGeolocationErrorMessage] = useState<string | undefined>(undefined);

	const geolocation = useRef<Geolocation>(
		new Geolocation({
			trackingOptions: {
				enableHighAccuracy: true,
				timeout: 6000, // Wait for 6s for the position to return
				maximumAge: 60000, // Use cached position for up to 1m
			},
		}),
	);

	useEffect(() => {
		// Init geolocation event listeners only once component load
		if (geolocationEventKeys.current.length === 0) {
			geolocationEventKeys.current = [
				geolocation.current.once('change:position', () => {
					const currentPosition = geolocation.current.getPosition();

					geolocation.current.setTracking(false);
					unByKey(geolocationEventKeys.current);
					setIsWaitingForGPSLocation(false);

					if (currentPosition !== undefined) {
						setIsGeolocationErrored(false);
						setGeolocationErrorMessage(undefined);

						navigate(`/${urlElectionName}/search/gps/${currentPosition.join(',')}/`, {
							state: { cameFromSearchDrawer: true },
						});
					} else {
						setIsGeolocationErrored(true);
						setGeolocationErrorMessage(
							'Something really unexpected has happened when we tried to fetch your GPS location 😢',
						);

						Sentry.captureMessage(
							"Geolocation: Got a response of 'undefined' when calling getPosition(). It's unclear when and why this happens, so logging it in Sentry to see if we ever see this in the wild.",
						);
					}
				}),

				geolocation.current.on('error', function (evt) {
					geolocation.current.setTracking(false);
					unByKey(geolocationEventKeys.current);
					setIsWaitingForGPSLocation(false);

					setIsGeolocationErrored(true);

					switch (evt.code) {
						case GeolocationPositionError.PERMISSION_DENIED:
							// The acquisition of the geolocation information failed because the page didn't have the necessary permissions, for example because it is blocked by a Permissions Policy
							setGeolocationErrorMessage(
								'We tried to request your GPS location, but the request was denied. Perhaps you denied it yourself or perhaps your device is set to always block requests for GPS locattion.',
							);
							return;
						case GeolocationPositionError.POSITION_UNAVAILABLE:
							// The acquisition of the geolocation failed because at least one internal source of position returned an internal error
							setGeolocationErrorMessage(
								"We tried to fetch your GPS location, but unfortunately something went awry with your device's GPS. Maybe try again or do a search for the location you're after.",
							);
							return;
						case GeolocationPositionError.TIMEOUT:
							// The time allowed to acquire the geolocation was reached before the information was obtained
							setGeolocationErrorMessage(
								"It was taking too long to determine your GPS position, so we gave up. Maybe try again or do a search for the location you're after.",
							);
							return;
						default:
							setGeolocationErrorMessage('Unhandled GeolocationPositionError');
					}

					Sentry.captureMessage(`Geolocation: ${evt.message}`);
				}),
			];
		}
	}, [navigate, urlElectionName]);

	const onClickGPSControl = () => {
		// If we haven't got a GPS location, clicking the contol ask for one.
		if (urlLonLatFromGPS === '') {
			if (geolocation.current.getTracking() === false) {
				// Just in case, let's clear focus from the search input since
				// the user doesn't need to type anything if we're using GPS location.
				if (searchFieldRef.current !== null) {
					searchFieldRef.current.blur();
				}

				geolocation.current.setTracking(true);
				setIsWaitingForGPSLocation(true);

				geolocationEventKeys.current = [];

				setIsGeolocationErrored(false);
				setGeolocationErrorMessage(undefined);
			}
		} else {
			// If we have a GPS location, clicking the control discards it.
			onDiscardGPSSearch();
		}
	};

	const onDiscardGPSSearch = () => {
		geolocation.current.setTracking(false);
		setIsWaitingForGPSLocation(false);

		setIsGeolocationErrored(false);
		setGeolocationErrorMessage(undefined);

		navigate(`/${urlElectionName}/search/`);
	};
	// ######################
	// GPS Control (End)
	// ######################

	// ######################
	// Filter Control
	// ######################
	const [filterOpen, setFilterOpen] = useState(searchBarInitialMode === ESearchDrawerSubComponent.FILTER_CONTROL);

	const onClickFilterControl = () => {
		setFilterOpen(!filterOpen);
	};
	// ######################
	// Filter Control (End)
	// ######################

	return (
		<React.Fragment>
			<Paper
				sx={{
					...{
						p: '2px 4px',
						display: 'flex',
						alignItems: 'center',
					},
				}}
			>
				<InputBase
					inputRef={searchFieldRef}
					value={localSearchTerm}
					onChange={onChangeSearchField}
					autoFocus={autoFocusSearchField}
					placeholder={urlLonLatFromGPS === '' ? 'Search here or use GPS →' : undefined}
					inputProps={{
						'aria-label': 'Search for polling places',
						className: 'searchBar',
					}}
					sx={{ ml: 1, flex: 1 }}
					startAdornment={
						urlLonLatFromGPS !== '' ? (
							<InputAdornment position="start">
								<Chip
									label="Searching by GPS location"
									onDelete={onDiscardGPSSearch}
									color="primary"
									sx={{ cursor: 'auto' }}
								/>
							</InputAdornment>
						) : undefined
					}
				/>

				{localSearchTerm !== '' && (
					<IconButton type="button" onClick={onClearSearchBar} sx={{ p: '10px' }} aria-label="Clear search term">
						<CloseIcon />
					</IconButton>
				)}

				<IconButton
					type="button"
					onClick={onClickGPSControl}
					sx={{ p: '10px' }}
					aria-label="Request GPS location from device"
				>
					{urlLonLatFromGPS === '' ? <GpsNotFixedIcon /> : <GpsFixedIcon sx={{ color: mapaThemeSecondaryBlue }} />}
				</IconButton>

				{enableFiltering === true && (
					<React.Fragment>
						<Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

						<IconButton
							onClick={onClickFilterControl}
							color={isMapFiltered === true ? 'secondary' : 'default'}
							aria-label="Open the filter panel to control which types of polling places are shown on the map"
							sx={{ pr: 1 }}
						>
							{isMapFiltered === true ? (
								<Badge badgeContent={numberOfMapFilterOptionsApplied} color="secondary">
									<FilterAltOutlinedIcon sx={{ color: filterOpen === true ? mapaThemeSecondaryBlue : undefined }} />
								</Badge>
							) : (
								<FilterAltOffOutlinedIcon sx={{ color: filterOpen === true ? mapaThemeSecondaryBlue : undefined }} />
							)}
						</IconButton>
					</React.Fragment>
				)}
			</Paper>

			{(isWaitingForGPSLocation === true ||
				isFetchingNearbyPollingPlaces === true ||
				isFetchingMapboxResults === true) && <LinearProgress color="secondary" />}

			{enableFiltering === true && filterOpen === true && <SearchBarFilter />}

			{isGeolocationErrored === true && (
				<Alert severity="error" sx={{ mt: 2 }}>
					<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
					{geolocationErrorMessage}
				</Alert>
			)}

			{/* Handles not found and all other types of error */}
			{errorFetchingNearbyPollingPlaces !== undefined && (
				<Alert severity="error">
					<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
					Something went awry when we tried to load this polling place.
				</Alert>
			)}

			{/* Handles not found and all other types of error */}
			{errorFetchingMapboxResults !== undefined && (
				<Alert severity="error">
					<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
					Something went awry when we tried to search for that place.
				</Alert>
			)}

			{pollingPlaceNearbyResultsFiltered !== undefined && (
				<PollingPlacesNearbySearchResultsContainer numberOfResults={pollingPlaceNearbyResultsFiltered.length}>
					{pollingPlaceNearbyResultsFiltered.map((pollingPlace) => (
						<PollingPlaceSearchResultsCard
							key={pollingPlace.id}
							pollingPlace={pollingPlace}
							onChoosePollingPlace={onChoosePollingPlace || undefined}
						/>
					))}
				</PollingPlacesNearbySearchResultsContainer>
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

						{isSearchingYet(localSearchTerm) === true &&
							typeof mapboxSearchResults === 'object' &&
							mapboxSearchResults !== null &&
							mapboxSearchResults.features.length > 0 &&
							mapboxSearchResults.features.map((feature) => {
								const [place_name_first_part, ...place_name_rest] = feature.place_name.split(', ');
								const matches = match(place_name_first_part, localSearchTerm, {
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
		</React.Fragment>
	);
}
