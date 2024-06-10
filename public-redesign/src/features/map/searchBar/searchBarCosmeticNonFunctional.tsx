import CloseIcon from '@mui/icons-material/Close';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import { Badge, Button, Divider, IconButton, InputAdornment, InputBase, Paper } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks/store';
import {
	navigateToSearchDrawer,
	navigateToSearchDrawerAndInitiateGPSSearch,
	navigateToSearchDrawerRoot,
} from '../../../app/routing/navigationHelpers';
import { getStringParamOrEmptyString } from '../../../app/routing/routingHelpers';
import { mapaThemePrimaryPurple } from '../../../app/ui/theme';
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
					<CloseIcon sx={{ color: mapaThemePrimaryPurple }} />
				</IconButton>
			)}

			{urlLonLatFromGPS !== '' && (
				<IconButton type="button" onClick={onDiscardGPSSearch} sx={{ p: '10px' }} aria-label="Clear GPS search">
					<CloseIcon sx={{ color: mapaThemePrimaryPurple }} />
				</IconButton>
			)}

			<IconButton
				type="button"
				onClick={onClickGPSControl}
				sx={{ p: '10px' }}
				aria-label="Request GPS location from device"
			>
				<GpsNotFixedIcon sx={{ color: mapaThemePrimaryPurple }} />
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
						<FilterAltOutlinedIcon sx={{ color: mapaThemePrimaryPurple }} />
					</Badge>
				) : (
					<FilterAltOffOutlinedIcon sx={{ color: mapaThemePrimaryPurple }} />
				)}
			</IconButton>
		</Paper>
	);
}
