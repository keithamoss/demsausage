import CloseIcon from '@mui/icons-material/Close';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed';
import { Badge, Divider, IconButton, InputBase, Paper } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks/store';
import { navigateToSearchDrawer, navigateToSearchDrawerRoot } from '../../../app/routing/navigationHelpers';
import { getStringParamOrEmptyString } from '../../../app/routing/routingHelpers';
import {
	ESearchDrawerSubComponent,
	selectIsMapFiltered,
	selectNumberOfMapFilterOptionsApplied,
	setSearchBarInitialMode,
} from '../../app/appSlice';
import './searchBar.css';

export default function SearchBarCosmeticNonFunctional() {
	const dispatch = useAppDispatch();
	const params = useParams();
	const navigate = useNavigate();

	const searchBarSearchText = getStringParamOrEmptyString(useParams(), 'search_term');

	const isMapFiltered = useAppSelector(selectIsMapFiltered);
	const numberOfMapFilterOptionsApplied = useAppSelector(selectNumberOfMapFilterOptionsApplied);

	// ######################
	// Search Field
	// ######################
	const onClickSearchField = () => {
		dispatch(setSearchBarInitialMode(ESearchDrawerSubComponent.SEARCH_FIELD));
		navigateToSearchDrawer(params, navigate);
	};

	const onClearSearchBar = () => {
		dispatch(setSearchBarInitialMode(ESearchDrawerSubComponent.SEARCH_FIELD));
		navigateToSearchDrawerRoot(params, navigate);
	};
	// ######################
	// Search Field (End)
	// ######################

	// ######################
	// GPS Control
	// ######################
	const onClickGPSControl = () => {
		dispatch(setSearchBarInitialMode(ESearchDrawerSubComponent.REQUEST_LOCATION));
		navigateToSearchDrawer(params, navigate);
	};
	// ######################
	// GPS Control (End)
	// ######################

	// ######################
	// Filter Control
	// ######################
	const onClickFilterControl = () => {
		dispatch(setSearchBarInitialMode(ESearchDrawerSubComponent.FILTER_CONTROL));
		navigateToSearchDrawer(params, navigate);
	};
	// ######################
	// Filter Control (End)
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
				placeholder="Search here or use GPS →"
				inputProps={{
					'aria-label': 'Search for polling places',
					disabled: true,
					className: 'searchBar',
				}}
				sx={{ ml: 1, flex: 1 }}
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
					<Badge badgeContent={numberOfMapFilterOptionsApplied} color="secondary">
						<FilterAltOutlinedIcon />
					</Badge>
				) : (
					<FilterAltOffOutlinedIcon />
				)}
			</IconButton>
		</Paper>
	);
}
