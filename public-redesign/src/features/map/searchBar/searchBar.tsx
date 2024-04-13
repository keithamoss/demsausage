import CloseIcon from '@mui/icons-material/Close';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import {
	Alert,
	AlertTitle,
	Badge,
	Divider,
	IconButton,
	InputBase,
	LinearProgress,
	List,
	ListItem,
	ListItemText,
	Paper,
	debounce,
} from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import React, { useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks/store';
import { Election } from '../../../app/services/elections';
import { useLazyGetPollingPlaceByLatLonLookupQuery } from '../../../app/services/pollingPlaces';
import {
	ESearchDrawerSubComponent,
	selectIsMapFiltered,
	selectMapFilterOptions,
	selectNumberOfMapFilterOptionsApplied,
	selectSearchDrawerState,
	setSearchDrawerMapboxResults,
	setSearchDrawerSearchText,
} from '../../app/appSlice';
import { IPollingPlace } from '../../pollingPlaces/pollingPlacesInterfaces';
import { doesPollingPlaceSatisifyFilterCriteria } from '../map_stuff';
import PollingPlaceSearchResultsCard from './pollingPlacesNearbySearchResults/pollingPlaceSearchResultsCard';
import PollingPlacesNearbySearchResults from './pollingPlacesNearbySearchResults/pollingPlacesNearbySearchResults';
import './searchBar.css';
import SearchBarFilter from './searchBarFilter/searchBarFilter';
import {
	EMapboxPlaceType,
	IMapboxGeocodingAPIResponse,
	IMapboxGeocodingAPIResponseFeature,
	defaultMapboxSearchTypes,
	getMapboxAPIKey,
	getMapboxSearchParamsForElection,
	isSearchingYet,
} from './searchBarHelpers';

interface Props {
	election: Election;
	autoFocusSearchField?: boolean;
	enableSearchField?: boolean;
	mapboxSearchTypes?: EMapboxPlaceType[];
	enableFiltering?: boolean;
	onClick?: (subcomponentClicked: ESearchDrawerSubComponent) => void;
	onToggleFilter: () => void;
	onChooseResult?: (feature: IMapboxGeocodingAPIResponseFeature) => void;
	onChoosePollingPlace?: (pollingPlace: IPollingPlace) => void;
}

export default function SearchBar(props: Props) {
	const {
		election,
		autoFocusSearchField,
		enableSearchField,
		mapboxSearchTypes,
		enableFiltering,
		onClick,
		onToggleFilter,
		onChooseResult,
		onChoosePollingPlace,
	} = {
		...{
			autoFocusSearchField: false,
			enableSearchField: true,
			enableFiltering: true,
			// We allow the types to be overridden so we can further constrain the types e.g. When we're using it to let people add stalls when there are no official polling places available yet.
			mapboxSearchTypes: defaultMapboxSearchTypes,
		},
		...props,
	};

	const dispatch = useAppDispatch();

	const searchDrawerState = useAppSelector((state) => selectSearchDrawerState(state));
	const mapFilterOptions = useAppSelector((state) => selectMapFilterOptions(state));

	const [
		trigger,
		{
			data: pollingPlaceNearbyResults,
			error: errorFetchingNearbyPollingPlaces,
			isFetching: isFetchingNearbyPollingPlaces,
			isSuccess: isSuccessFetchingNearbyPollingPlaces,
		},
	] = useLazyGetPollingPlaceByLatLonLookupQuery();

	const pollingPlaceNearbyResultsFiltered =
		enableSearchField === true &&
		isFetchingNearbyPollingPlaces === false &&
		isSuccessFetchingNearbyPollingPlaces === true &&
		pollingPlaceNearbyResults !== undefined &&
		pollingPlaceNearbyResults.length > 0
			? // typeof searchDrawerState.pollingPlaceNearbyResults === 'object' &&
			  // searchDrawerState.pollingPlaceNearbyResults !== null &&
			  // searchDrawerState.pollingPlaceNearbyResults.length > 0
			  pollingPlaceNearbyResults.filter(
					(pollingPlace) => doesPollingPlaceSatisifyFilterCriteria(pollingPlace, mapFilterOptions) === true,
			  )
			: undefined;

	const isMapFiltered = useAppSelector(selectIsMapFiltered);
	const numberOfMapFilterOptionsApplied = useAppSelector(selectNumberOfMapFilterOptionsApplied);

	// ######################
	// Search Field
	// ######################
	const fetchMapboxResults = useMemo(
		() =>
			debounce((searchTerm: string) => {
				if (isSearchingYet(searchTerm) === false) {
					return;
				}

				(async () => {
					try {
						const response = await fetch(
							`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchTerm}.json?limit=10&proximity=ip&types=${mapboxSearchTypes.join(
								'%2C',
							)}&access_token=${getMapboxAPIKey()}&${getMapboxSearchParamsForElection(election)}`,
						);

						if (response.ok === true) {
							const results = (await response.json()) as IMapboxGeocodingAPIResponse;
							dispatch(setSearchDrawerMapboxResults(results));
						} else {
							dispatch(setSearchDrawerMapboxResults(null));
						}
					} catch (error) {
						dispatch(setSearchDrawerMapboxResults(null));
					}
				})();
			}, 400),
		[dispatch, election, mapboxSearchTypes],
	);

	const onClickSearchField = () => {
		if (onClick !== undefined) {
			onClick(ESearchDrawerSubComponent.SEARCH_FIELD);
		}
	};

	const onChangeSearchField = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
		dispatch(setSearchDrawerSearchText(event.currentTarget.value));
		// dispatch(setSearchDrawerPollingPlaceNearbyResults(undefined));
		setShowPollingPlacesNearByResults(false);
		fetchMapboxResults(event.currentTarget.value);
	};

	const searchFieldRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

	const onClearSearch = () => {
		dispatch(setSearchDrawerSearchText(''));
		// dispatch(setSearchDrawerPollingPlaceNearbyResults(undefined));
		setShowPollingPlacesNearByResults(false);
		dispatch(setSearchDrawerMapboxResults(undefined));

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
	const onClickGPSControl = () => {
		if (onClick !== undefined) {
			onClick(ESearchDrawerSubComponent.REQUEST_LOCATION);
		}
	};
	// ######################
	// GPS Control (End)
	// ######################

	// ######################
	// Filter Control
	// ######################
	const [filterOpen, setFilterOpen] = useState(
		searchDrawerState.initialMode === ESearchDrawerSubComponent.FILTER_CONTROL,
	);

	const onClickFilterControl = () => {
		if (onClick !== undefined) {
			onClick(ESearchDrawerSubComponent.FILTER_CONTROL);
		}

		setFilterOpen(!filterOpen);
		onToggleFilter();
	};
	// ######################
	// Filter Control (End)
	// ######################

	// ######################
	// Mapbox Search Results
	// ######################
	const onChoose = (feature: IMapboxGeocodingAPIResponseFeature) => () => {
		if (onChooseResult !== undefined) {
			onChooseResult(feature);
		}

		dispatch(setSearchDrawerSearchText(feature.place_name));
		dispatch(setSearchDrawerMapboxResults(undefined));

		// fetchPollingPlacesNearbyResults(feature.geometry.coordinates);
		trigger({ electionId: election.id, lonlat: feature.geometry.coordinates });
		setShowPollingPlacesNearByResults(true);
	};
	// ######################
	// Mapbox Search Results (End)
	// ######################

	// ######################
	// Polling Place Nearby Results
	// ######################
	const [showPollingPlacesNearByResults, setShowPollingPlacesNearByResults] = useState(true);

	// const fetchPollingPlacesNearbyResults = useMemo(
	// 	() => (lonlat: [number, number]) => {
	// 		(async () => {
	// 			try {
	// 				const response = await fetch(
	// 					`${getAPIBaseURL()}/0.1/polling_places/nearby/?election_id=${election.id}&lonlat=${lonlat.join('%2C')}`,
	// 				);

	// 				if (response.ok === true) {
	// 					const results = (await response.json()) as IPollingPlace[];
	// 					dispatch(setSearchDrawerPollingPlaceNearbyResults(results));
	// 				} else {
	// 					dispatch(setSearchDrawerPollingPlaceNearbyResults(null));
	// 				}
	// 			} catch (error) {
	// 				dispatch(setSearchDrawerPollingPlaceNearbyResults(null));
	// 			}
	// 		})();
	// 	},
	// 	[dispatch, election.id],
	// );
	// ######################
	// Polling Place Nearby Results (End)
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
					value={searchDrawerState.searchText}
					onClick={onClickSearchField}
					onChange={onChangeSearchField}
					autoFocus={autoFocusSearchField}
					placeholder="Search here or use GPS →"
					inputProps={{
						'aria-label': 'Search for polling places',
						disabled: enableSearchField === false,
						className: 'searchBar',
					}}
					sx={{ ml: 1, flex: 1 }}
				/>

				{enableSearchField === true && searchDrawerState.searchText !== '' && (
					<IconButton type="button" onClick={onClearSearch} sx={{ p: '10px' }} aria-label="Clear search term">
						<CloseIcon />
					</IconButton>
				)}

				<IconButton
					type="button"
					onClick={onClickGPSControl}
					sx={{ p: '10px' }}
					aria-label="Request GPS location from device"
				>
					<GpsNotFixedIcon />
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
									<FilterAltOutlinedIcon />
								</Badge>
							) : (
								<FilterAltOffOutlinedIcon />
							)}
						</IconButton>
					</React.Fragment>
				)}
			</Paper>

			{enableFiltering === true && filterOpen === true && <SearchBarFilter />}

			{enableSearchField === true && isFetchingNearbyPollingPlaces === true && <LinearProgress color="secondary" />}

			{/* Handles not found and all other types of error */}
			{enableSearchField === true && errorFetchingNearbyPollingPlaces !== undefined && (
				<Alert severity="error">
					<AlertTitle>Sorry, we&lsquo;ve hit a snag.</AlertTitle>
					Something went awry when we tried to load this polling place.
				</Alert>
			)}

			{enableSearchField === true &&
				showPollingPlacesNearByResults === true &&
				pollingPlaceNearbyResultsFiltered !== undefined && (
					<PollingPlacesNearbySearchResults numberOfResults={pollingPlaceNearbyResultsFiltered.length}>
						{pollingPlaceNearbyResultsFiltered.map((pollingPlace) => (
							<PollingPlaceSearchResultsCard
								key={pollingPlace.id}
								pollingPlace={pollingPlace}
								onChoosePollingPlace={onChoosePollingPlace || undefined}
							/>
						))}
					</PollingPlacesNearbySearchResults>
				)}

			{enableSearchField === true && searchDrawerState.mapboxResults !== undefined && (
				<List>
					{searchDrawerState.mapboxResults === null && (
						<ListItem>
							<ListItemText primary="An error occurred"></ListItemText>
						</ListItem>
					)}

					{typeof searchDrawerState.mapboxResults === 'object' &&
						searchDrawerState.mapboxResults !== null &&
						searchDrawerState.mapboxResults.features.length === 0 && (
							<ListItem>
								<ListItemText primary="No results found"></ListItemText>
							</ListItem>
						)}

					{typeof searchDrawerState.mapboxResults === 'object' &&
						searchDrawerState.mapboxResults !== null &&
						searchDrawerState.mapboxResults.features.length > 0 &&
						searchDrawerState.mapboxResults.features.map((feature) => {
							const [place_name_first_part, ...place_name_rest] = feature.place_name.split(', ');
							const matches = match(place_name_first_part, searchDrawerState.searchText, {
								insideWords: true,
							});
							const parts = parse(place_name_first_part, matches);

							return (
								<ListItem key={feature.id} onClick={onChoose(feature)}>
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
