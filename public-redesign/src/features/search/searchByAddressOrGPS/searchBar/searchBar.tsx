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
	Button,
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
import type { Coordinate } from 'ol/coordinate';
import type { EventsKey } from 'ol/events';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks/store';
import { useUnmount } from '../../../../app/hooks/useUnmount';
import { getStringParamOrEmptyString } from '../../../../app/routing/routingHelpers';
import type { Election } from '../../../../app/services/elections';
import { mapaThemePrimaryPurple } from '../../../../app/ui/theme';
import {
	selectIsMapFiltered,
	selectNumberOfMapFilterSettingsApplied,
	selectSearchBarFilterControlState,
	setSearchBarFilterControlState,
} from '../../../app/appSlice';
import { isSearchingYet } from '../../searchBarHelpers';
import SearchFilterComponent from '../../shared/searchFilterComponent';
import './searchBar.css';

interface Props {
	election: Election;
	autoFocusSearchField?: boolean;
	enableFiltering?: boolean;
	isFetching: boolean;
	onMapboxSearchTermChange: (searchTerm: string) => void;
	onGPSControlClicked: () => void;
	onGPSLocationAcquired: (currentPosition: Coordinate) => void;
	onDiscardSearch: () => void;
}

export default function SearchBar(props: Props) {
	const {
		election,
		autoFocusSearchField,
		enableFiltering,
		isFetching,
		onMapboxSearchTermChange,
		onGPSControlClicked,
		onGPSLocationAcquired,
		onDiscardSearch,
	} = {
		...{
			autoFocusSearchField: false,
			enableFiltering: true,
		},
		...props,
	};

	const dispatch = useAppDispatch();

	const params = useParams();
	const location = useLocation();

	const [localSearchTerm, setLocalSearchTerm] = useState('');
	const [isUserTyping, setIsUserTyping] = useState(false);

	const urlSearchTerm = getStringParamOrEmptyString(params, 'search_term');
	const urlLonLatFromGPS = getStringParamOrEmptyString(params, 'gps_lon_lat');

	// When the user navigates back/forward, or reloads the page, we
	// just need to handle setting the search term based on what's in
	// the URL of the page.
	if (isUserTyping === false && localSearchTerm !== urlSearchTerm) {
		setLocalSearchTerm(urlSearchTerm);
	}

	const searchBarFilterControlOpen = useAppSelector((state) => selectSearchBarFilterControlState(state));
	const isMapFiltered = useAppSelector((state) => selectIsMapFiltered(state, election.id));

	const numberOfMapFilterSettingsApplied = useAppSelector((state) =>
		selectNumberOfMapFilterSettingsApplied(state, election.id),
	);

	// ######################
	// Search Field
	// ######################
	const searchFieldRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

	const debouncedNavigateOnSearchTermChange = useMemo(
		() =>
			debounce((searchTerm: string) => {
				if (isSearchingYet(searchTerm) === false) {
					return;
				}

				setIsUserTyping(false);

				onMapboxSearchTermChange(searchTerm);
			}, 800),
		[onMapboxSearchTermChange],
	);

	const onChangeSearchField = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			debouncedNavigateOnSearchTermChange(event.target.value);
			setIsUserTyping(true);
			setLocalSearchTerm(event.target.value);
		},
		[debouncedNavigateOnSearchTermChange],
	);

	const onKeyUpSearchField = useCallback((event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (event.key === 'Enter' && event.target instanceof HTMLElement) {
			event.target.blur();
		}
	}, []);

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

	const onClearSearchBar = useCallback(() => {
		onDiscardSearch();

		if (searchFieldRef.current !== null && document.activeElement !== searchFieldRef.current) {
			searchFieldRef.current.focus();
		}
	}, [onDiscardSearch]);
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

						onGPSLocationAcquired(currentPosition);
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

				geolocation.current.on('error', (evt) => {
					setIsWaitingForGPSLocation(false);

					setIsGeolocationErrored(true);

					switch (evt.code) {
						case GeolocationPositionError.PERMISSION_DENIED:
							// The acquisition of the geolocation information failed because the page didn't have the necessary permissions, for example because it is blocked by a Permissions Policy
							setGeolocationErrorMessage(
								'We tried to request your GPS location, but the request was denied. Perhaps you denied it yourself or perhaps your device is set to always block requests for GPS location.',
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
	}, [onGPSLocationAcquired]);

	const onDiscardGPSSearch = useCallback(() => {
		geolocation.current.setTracking(false);
		setIsWaitingForGPSLocation(false);

		setIsGeolocationErrored(false);
		setGeolocationErrorMessage(undefined);

		onDiscardSearch();
	}, [onDiscardSearch]);

	const onClickGPSControl = useCallback(() => {
		// If we haven't got a GPS location, clicking the contol asks for one.
		if (urlLonLatFromGPS === '') {
			onGPSControlClicked();
		} else {
			// If we have a GPS location, clicking the control discards it.
			onDiscardGPSSearch();
		}
	}, [onDiscardGPSSearch, onGPSControlClicked, urlLonLatFromGPS]);

	// Let the user come in from the map, click the GPS control there,
	// and have it initiate a request for their location
	useEffect(() => {
		if (
			location.pathname.includes('/search/gps/') &&
			urlLonLatFromGPS === '' &&
			isWaitingForGPSLocation === false &&
			geolocation.current.getTracking() === false
		) {
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
	}, [isWaitingForGPSLocation, location.pathname, urlLonLatFromGPS]);
	// ######################
	// GPS Control (End)
	// ######################

	// ######################
	// Filter Control
	// ######################
	const onClickFilterControl = useCallback(() => {
		dispatch(setSearchBarFilterControlState(!searchBarFilterControlOpen));
	}, [dispatch, searchBarFilterControlOpen]);
	// ######################
	// Filter Control (End)
	// ######################

	// ######################
	// Search Field UI
	// ######################
	const searchFieldPlaceholder = useMemo(
		() => (urlLonLatFromGPS === '' ? 'Search here or use GPS →' : undefined),
		[urlLonLatFromGPS],
	);

	const searchFieldStartAdornment = useMemo(
		() =>
			urlLonLatFromGPS !== '' ? (
				<InputAdornment position="start">
					<Button
						size="small"
						variant="outlined"
						disableRipple
						sx={{
							cursor: 'auto',
						}}
					>
						Searching by GPS location
					</Button>
				</InputAdornment>
			) : undefined,
		[urlLonLatFromGPS],
	);
	// ######################
	// Search Field UI (End)
	// ######################

	return (
		<Box sx={{ mb: 1.5 }}>
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
					onKeyUp={onKeyUpSearchField}
					autoFocus={autoFocusSearchField}
					placeholder={searchFieldPlaceholder}
					inputProps={{
						'aria-label': 'Search for polling places',
						className: 'searchBar',
					}}
					sx={{ ml: 1, flex: 1 }}
					startAdornment={searchFieldStartAdornment}
				/>

				{localSearchTerm !== '' && (
					<IconButton type="button" onClick={onClearSearchBar} aria-label="Clear search term">
						<CloseIcon sx={{ color: mapaThemePrimaryPurple }} />
					</IconButton>
				)}

				{urlLonLatFromGPS !== '' && (
					<IconButton type="button" onClick={onDiscardGPSSearch} aria-label="Clear GPS search">
						<CloseIcon sx={{ color: mapaThemePrimaryPurple }} />
					</IconButton>
				)}

				<IconButton type="button" onClick={onClickGPSControl} aria-label="Request GPS location from device">
					{urlLonLatFromGPS === '' ? (
						<GpsNotFixedIcon sx={{ color: mapaThemePrimaryPurple }} />
					) : (
						<GpsFixedIcon sx={{ color: mapaThemePrimaryPurple }} />
					)}
				</IconButton>

				{enableFiltering === true && (
					<React.Fragment>
						<Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

						<IconButton
							onClick={onClickFilterControl}
							aria-label="Open the filter panel to control which types of polling places are shown on the map"
						>
							{isMapFiltered === true ? (
								<Badge badgeContent={numberOfMapFilterSettingsApplied} color="secondary">
									<FilterAltOutlinedIcon sx={{ color: mapaThemePrimaryPurple }} />
								</Badge>
							) : (
								<FilterAltOffOutlinedIcon sx={{ color: mapaThemePrimaryPurple }} />
							)}
						</IconButton>
					</React.Fragment>
				)}
			</Paper>

			{(isWaitingForGPSLocation === true || isFetching === true) && <LinearProgress color="secondary" />}

			{enableFiltering === true && searchBarFilterControlOpen === true && <SearchFilterComponent election={election} />}

			{isGeolocationErrored === true && (
				<Alert severity="error" sx={{ mt: 2 }}>
					<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
					{geolocationErrorMessage}
				</Alert>
			)}
		</Box>
	);
}
