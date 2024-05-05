import CloseIcon from '@mui/icons-material/Close';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import { Badge, Chip, Divider, IconButton, InputAdornment, InputBase, Paper } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks/store';
import {
	navigateToSearchDrawer,
	navigateToSearchDrawerAndInitiateGPSSearch,
	navigateToSearchDrawerRoot,
} from '../../../app/routing/navigationHelpers';
import { getStringParamOrEmptyString } from '../../../app/routing/routingHelpers';
import {
	selectIsMapFiltered,
	selectNumberOfMapFilterSettingsApplied,
	setSearchBarFilterControlState,
} from '../../app/appSlice';
import './searchBar.css';

export default function SearchBarCosmeticNonFunctional() {
	const dispatch = useAppDispatch();

	const params = useParams();
	const navigate = useNavigate();

	const urlLonLatFromGPS = getStringParamOrEmptyString(params, 'gps_lon_lat');
	const urlPollingPlaceIds = getStringParamOrEmptyString(params, 'polling_place_ids');

	const searchBarSearchText = getStringParamOrEmptyString(params, 'search_term');

	const isMapFiltered = useAppSelector(selectIsMapFiltered);
	const numberOfMapFilterSettingsApplied = useAppSelector(selectNumberOfMapFilterSettingsApplied);

	// ######################
	// Search Field
	// ######################
	const onClickSearchField = useCallback(() => {
		navigateToSearchDrawer(params, navigate);
	}, [navigate, params]);

	const onClearSearchBar = useCallback(() => {
		navigateToSearchDrawerRoot(params, navigate);
	}, [navigate, params]);

	const onDiscardGPSSearch = useCallback(() => {
		navigateToSearchDrawerRoot(params, navigate);
	}, [navigate, params]);

	const onDiscardPollingPlaceByIdsSearch = useCallback(() => {
		navigateToSearchDrawerRoot(params, navigate);
	}, [navigate, params]);
	// ######################
	// Search Field (End)
	// ######################

	// ######################
	// GPS Control
	// ######################
	const onClickGPSControl = useCallback(() => {
		navigateToSearchDrawerAndInitiateGPSSearch(params, navigate);
	}, [navigate, params]);
	// ######################
	// GPS Control (End)
	// ######################

	// ######################
	// Filter Control
	// ######################
	const onClickFilterControl = useCallback(() => {
		dispatch(setSearchBarFilterControlState(true));
		navigateToSearchDrawer(params, navigate);
	}, [dispatch, navigate, params]);
	// ######################
	// Filter Control (End)
	// ######################

	// ######################
	// Search Field UI
	// ######################
	const searchFieldPlaceholder = useMemo(
		() => (urlLonLatFromGPS === '' && urlPollingPlaceIds === '' ? 'Search here or use GPS →' : undefined),
		[urlLonLatFromGPS, urlPollingPlaceIds],
	);

	const searchFieldStartAdornment = useMemo(
		() =>
			urlLonLatFromGPS !== '' ? (
				<InputAdornment position="start">
					<Chip
						label="Searching by GPS location"
						onDelete={onDiscardGPSSearch}
						color="primary"
						sx={{ cursor: 'auto' }}
					/>
				</InputAdornment>
			) : urlPollingPlaceIds !== '' ? (
				<InputAdornment position="start">
					<Chip
						label="Searching from map"
						onDelete={onDiscardPollingPlaceByIdsSearch}
						color="primary"
						sx={{ cursor: 'auto' }}
					/>
				</InputAdornment>
			) : undefined,
		[onDiscardGPSSearch, onDiscardPollingPlaceByIdsSearch, urlLonLatFromGPS, urlPollingPlaceIds],
	);
	// ######################
	// Search Field UI (End)
	// ######################

	return (
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
				value={searchBarSearchText}
				onClick={onClickSearchField}
				placeholder={searchFieldPlaceholder}
				inputProps={{
					'aria-label': 'Search for polling places',
					disabled: true,
					className: 'searchBar',
				}}
				sx={{ ml: 1, flex: 1 }}
				startAdornment={searchFieldStartAdornment}
			/>

			{searchBarSearchText !== '' && (
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
				<GpsNotFixedIcon />
			</IconButton>

			<Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

			<IconButton
				onClick={onClickFilterControl}
				color={isMapFiltered === true ? 'secondary' : 'default'}
				aria-label="Open the filter panel to control which types of polling places are shown on the map"
				sx={{ pr: 1 }}
			>
				{isMapFiltered === true ? (
					<Badge badgeContent={numberOfMapFilterSettingsApplied} color="secondary">
						<FilterAltOutlinedIcon />
					</Badge>
				) : (
					<FilterAltOffOutlinedIcon />
				)}
			</IconButton>
		</Paper>
	);
}
