import CloseIcon from '@mui/icons-material/Close';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import {
	Alert,
	AlertTitle,
	Badge,
	Box,
	Chip,
	Divider,
	IconButton,
	InputAdornment,
	InputBase,
	LinearProgress,
	Paper,
	debounce,
} from '@mui/material';
import * as Sentry from '@sentry/react';
import Geolocation from 'ol/Geolocation';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks/store';
import { useUnmount } from '../../../app/hooks/useUnmount';
import {
	navigateToSearchDrawerRoot,
	navigateToSearchListOfPollingPlacesFromGPSSearch,
	navigateToSearchListOfPollingPlacesFromSearchTerm,
} from '../../../app/routing/navigationHelpers';
import { getStringParamOrEmptyString, getStringParamOrUndefined } from '../../../app/routing/routingHelpers';
import { mapaThemeSecondaryBlue } from '../../../app/ui/theme';
import {
	ESearchDrawerSubComponent,
	selectIsMapFiltered,
	selectNumberOfMapFilterOptionsApplied,
	selectSearchBarInitialMode,
	setSearchBarInitialMode,
} from '../../app/appSlice';
import './searchBar.css';
import SearchBarFilter from './searchBarFilter/searchBarFilter';
import { isSearchingYet } from './searchBarHelpers';

interface Props {
	autoFocusSearchField?: boolean;
	enableFiltering?: boolean;
	isFetching: boolean;
}

export default function SearchBar(props: Props) {
	const { autoFocusSearchField, enableFiltering, isFetching } = {
		...{
			autoFocusSearchField: false,
			enableFiltering: true,
		},
		...props,
	};

	const dispatch = useAppDispatch();

	const params = useParams();
	const navigate = useNavigate();

	// @TODO Should all onXXXX functions here be useMemo'd or is that bad for some reason?

	const [localSearchTerm, setLocalSearchTerm] = useState('');
	const [isUserTyping, setIsUserTyping] = useState(false);

	const urlElectionName = getStringParamOrUndefined(useParams(), 'election_name');
	const urlSearchTerm = getStringParamOrEmptyString(useParams(), 'search_term');

	const urlLonLatFromGPS = getStringParamOrEmptyString(useParams(), 'gps_lon_lat');

	// When the user navigates back/forward, or reloads the page, we
	// just need to handle setting the search term based on what's in
	// the URL of the page.
	if (isUserTyping === false && localSearchTerm !== urlSearchTerm) {
		setLocalSearchTerm(urlSearchTerm);
	}

	// Synch local state with the Redux store so SearchBarCosmeticNonFunctional
	// and other components can consume information about the user's search criteria.
	// useEffect(() => {
	// 	dispatch(setSearchBarSearchText(urlSearchTerm));
	// }, [dispatch, urlSearchTerm]);

	// useEffect(() => {
	// 	dispatch(setSearchBarSearchLonLat(urlLonLat));
	// }, [dispatch, urlLonLat]);

	// @TODO Why does this exist again and is this really the best name for it?
	// Increasingly, more places have to overwite this and set things back to SEARCH_FIELD
	const searchBarInitialMode = useAppSelector((state) => selectSearchBarInitialMode(state));

	const isMapFiltered = useAppSelector(selectIsMapFiltered);
	const numberOfMapFilterOptionsApplied = useAppSelector(selectNumberOfMapFilterOptionsApplied);

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
				navigateToSearchListOfPollingPlacesFromSearchTerm(params, navigate, searchTerm);
			}, 400),
		[navigate, params],
	);

	const onChangeSearchField = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
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
			searchFieldRef.current.focus();
		}
	}, 50);

	// Handles unfocussing the search field if the user
	// is going back and forward between a GPS location
	// search and the naked search bar.
	window.setTimeout(() => {
		if (
			autoFocusSearchField === false &&
			searchFieldRef.current !== null &&
			document.activeElement === searchFieldRef.current
		) {
			searchFieldRef.current.blur();
		}
	}, 50);

	const onClearSearchBar = () => {
		navigateToSearchDrawerRoot(params, navigate);

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

	useUnmount(() => {
		if (geolocationEventKeys.current.length >= 1) {
			unByKey(geolocationEventKeys.current);
			geolocationEventKeys.current = [];
		}
	});

	useEffect(() => {
		// Init geolocation event listeners only once on component load
		if (geolocationEventKeys.current.length === 0) {
			geolocationEventKeys.current = [
				geolocation.current.on('change:position', () => {
					const currentPosition = geolocation.current.getPosition();

					geolocation.current.setTracking(false);
					setIsWaitingForGPSLocation(false);

					if (currentPosition !== undefined) {
						setIsGeolocationErrored(false);
						setGeolocationErrorMessage(undefined);

						navigateToSearchListOfPollingPlacesFromGPSSearch(params, navigate, currentPosition.join(','));
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
	}, [navigate, params, urlElectionName]);

	const onDiscardGPSSearch = useCallback(() => {
		geolocation.current.setTracking(false);
		setIsWaitingForGPSLocation(false);

		setIsGeolocationErrored(false);
		setGeolocationErrorMessage(undefined);

		navigateToSearchDrawerRoot(params, navigate);
	}, [navigate, params]);

	const onClickGPSControl = useCallback(() => {
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

				setIsGeolocationErrored(false);
				setGeolocationErrorMessage(undefined);
			}
		} else {
			// If we have a GPS location, clicking the control discards it.
			onDiscardGPSSearch();
		}
	}, [onDiscardGPSSearch, urlLonLatFromGPS]);

	// Let the user come in from the map, click the GPS control there,
	// and have it initiate a request for their location
	useEffect(() => {
		if (
			searchBarInitialMode === ESearchDrawerSubComponent.REQUEST_LOCATION &&
			urlLonLatFromGPS === '' &&
			isWaitingForGPSLocation === false &&
			geolocation.current.getTracking() === false
		) {
			onClickGPSControl();

			// Once we've init'd once, set it back to the default of the search field.
			// If we don't, when the user clicks the GPS control from the map, we get
			// a result, and then if we discard the GPS result or go back, then this
			// code here would all run again and re-trigger a GPS location request.
			dispatch(setSearchBarInitialMode(ESearchDrawerSubComponent.SEARCH_FIELD));
		}
	}, [dispatch, isWaitingForGPSLocation, onClickGPSControl, searchBarInitialMode, urlLonLatFromGPS]);
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
		<Box sx={{ mb: 2 }}>
			{/* NOTE: Any changes to the <Paper> SearchBar component here need to be refleced in <SearchBarCosmeticNonFunctional > as well. We keep these separate to avoid over-complicating an already pretty complex component. */}
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

			{(isWaitingForGPSLocation === true || isFetching === true) && <LinearProgress color="secondary" />}

			{enableFiltering === true && filterOpen === true && <SearchBarFilter />}

			{isGeolocationErrored === true && (
				<Alert severity="error" sx={{ mt: 2 }}>
					<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
					{geolocationErrorMessage}
				</Alert>
			)}
		</Box>
	);
}
