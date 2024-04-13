import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import * as React from 'react';
// import BottomBar from "./bottom_bar";
import { Drawer } from '@mui/material';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { ESearchDrawerSubComponent, selectSearchDrawerState } from '../app/appSlice';
import { getDefaultElection } from '../elections/electionHelpers';
import { selectAllElections, selectElectionById } from '../elections/electionsSlice';
import SearchBar from '../map/searchBar/searchBar';
import SearchBarFilter from '../map/searchBar/searchBarFilter/searchBarFilter';
import { IMapboxGeocodingAPIResponseFeature } from '../map/searchBar/searchBarHelpers';
import { getPollingPlacePermalink } from '../pollingPlaces/pollingPlaceHelpers';
import { IPollingPlace } from '../pollingPlaces/pollingPlacesInterfaces';

// The entrypoint handles determining the election that should be displayed based on route changes.
function SearchDrawerEntrypoint() {
	// Fallback to our default election if the route hasn't specified an election
	const elections = useAppSelector(selectAllElections);
	const defaultElection = getDefaultElection(elections);
	let electionId = defaultElection?.id;

	// Otherwise, set the election the route wants to use
	const urlElectionName = getStringParamOrUndefined(useParams(), 'election_name');
	if (urlElectionName !== undefined && urlElectionName !== '' && urlElectionName !== defaultElection?.name_url_safe) {
		electionId = elections.find((e) => e.name_url_safe === urlElectionName)?.id;
	}

	// const { pathname } = useLocation();
	// const isSearchRouteShown = isSearchRoute(pathname);

	if (electionId === undefined) {
		return null;
	}

	return <SearchDrawer electionId={electionId} /* isSearchRouteShown={true} */ />;
}

// const bottomNav = 56;
// const drawerBleeding = 175 + bottomNav;
// const drawerBleeding = 275;
// const fixedBarHeightWithTopPadding = 56;
// const magicNumber = 30;

interface Props {
	/**
	 * Injected by the documentation to work in an iframe.
	 * You won't need it on your project.
	 */
	electionId: number;
	// // window?: () => Window;
	// toggleMapSearchResults: any;
	// autoFocusSearchBar: boolean;
	// initiateLocationRequest: boolean;
	// isFilterOpen: boolean;
	// // isMapFiltered: boolean;
	// // onChangeFilter: any;
	// // open: boolean;
	// onSetOpen: any;
	// onSearchTextChange: any;
}

const StyledBox = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
}));

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	padding: theme.spacing(1),
	overflowY: 'auto',
	height: `90dvh`,
}));

const StyledInteractableBoxForStallFocusFullHeight = styled(Box)(({ theme }) => ({
	overflowY: 'auto',
	height: '90dvh',
}));

function SearchDrawer(props: Props) {
	const {
		electionId,
		// // window,
		// toggleMapSearchResults,
		// autoFocusSearchBar,
		// initiateLocationRequest,
		// isFilterOpen,
		// // isMapFiltered,
		// // onChangeFilter,
		// // open,
		// onSetOpen,
		// onSearchTextChange,
	} = props;

	const election = useAppSelector((state) => selectElectionById(state, electionId));
	// console.log('🚀 ~ file: searchDrawer.tsx:96 ~ SearchDrawer ~ election:', election);

	// console.log('autoFocusSearchBar', autoFocusSearchBar);

	// const location = useLocation();
	const params = useParams();
	const navigate = useNavigate();

	const searchDrawerState = useAppSelector((state) => selectSearchDrawerState(state));

	const toggleDrawer = () => () => {
		// onSetOpen(newOpen);

		// console.log('useLocation()', location);
		// console.log('useParams()', params);

		// if (isSearchRoute(location.pathname) === true) {
		navigate(params.election_name !== undefined ? `/${params.election_name}` : '/');
		// }

		// if (newOpen === false) {
		// 	window.setTimeout(() => {
		// 		// document.getElementById('search-bar')?.blur();
		// 	}, 50);
		// }
	};

	const [filterOpen, setFilterOpen] = useState(
		searchDrawerState.initialMode === ESearchDrawerSubComponent.FILTER_CONTROL,
	);
	const toggleFilter = () => {
		// console.log('toggleFilter', !filterOpen);
		// setFilterOpen(!filterOpen);
	};

	const [stallFocussed, setStallFocussed] = useState(false);
	const toggleStallFocussed = (e: any) => {
		// toggleMapSearchResults(Math.random() >= 0.5 ? 0 : 1);
		toggleFocussedStallId(Math.random() >= 0.5 ? 0 : 1);
		setStallFocussed(!stallFocussed);
	};

	const [focussedStallId, setFocussedStallId] = useState<number | null>(null);
	const toggleFocussedStallId = (stallId: number) => {
		setFocussedStallId(stallId);
	};

	const [userHasSearched, setUserHasSearched] = useState(false);
	const toggleUserHasSearched = (state: boolean) => {
		setUserHasSearched(state);
	};

	const onChooseFromSearchBar = (feature: IMapboxGeocodingAPIResponseFeature) => {
		console.log('feature', feature);
	};

	// This is used only for the example
	// const container = window !== undefined ? () => window().document.body : undefined;

	if (election === undefined) {
		return null;
	}

	const onChoosePollingPlace = (pollingPlace: IPollingPlace) => {
		navigate(getPollingPlacePermalink(election, pollingPlace), { state: { cameFromSearchDrawer: true } });
	};

	return (
		<React.Fragment>
			<Drawer
				// container={container}
				anchor="bottom"
				open={true}
				// open={open}
				onClose={toggleDrawer()}
				ModalProps={{
					keepMounted: true,
				}}
			>
				<StyledBox>
					{/* {stallFocussed === true && focussedStallId !== null && (
						<StyledInteractableBoxForStallFocusFullHeight>
							<StallFocus toggleStallFocussed={toggleStallFocussed} focussedStallId={focussedStallId} />
						</StyledInteractableBoxForStallFocusFullHeight>
					)} */}

					{stallFocussed === false && (
						<StyledInteractableBoxFullHeight>
							<SearchBar
								election={election}
								autoFocusSearchField={searchDrawerState.initialMode === ESearchDrawerSubComponent.SEARCH_FIELD}
								onToggleFilter={toggleFilter}
								// onChooseResult={onChooseFromSearchBar}
								onChoosePollingPlace={onChoosePollingPlace}
							/>

							{filterOpen === true && <SearchBarFilter />}
						</StyledInteractableBoxFullHeight>
					)}
				</StyledBox>
			</Drawer>
		</React.Fragment>
	);
}

export default SearchDrawerEntrypoint;
