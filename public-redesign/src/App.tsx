import * as React from 'react';

import './App.css';

import { grey } from '@mui/material/colors';
import Fab from '@mui/material/Fab';
import { styled } from '@mui/material/styles';
// import BottomBar from "./swipe/bottom_bar";
import Map from './features/map/map';

import AddLocationIcon from '@mui/icons-material/AddLocation';
import { useParams } from 'react-router-dom';
import { useAppSelector } from './app/hooks/store';
import { getStringParamOrUndefined } from './app/routing/routingHelpers';
import { getDefaultElection } from './features/elections/electionHelpers';
import { selectAllElections } from './features/elections/electionsSlice';
import { IMapFilterOptions } from './features/icons/noms';
import DSAppBar from './features/app/app_bar';
import BottomDrawerTemporary from './features/app/bottom_drawer_temporary';
import LayersSelector from './features/map/layers_selector';
import SearchBar from './features/app/search_bar';
import SideMenuDrawer from './features/app/side_menu_drawer';

// const bottomNav = 56;
// const drawerBleeding = 175 + bottomNav;
export const drawerBleeding = 245;
// const fixedBarHeightWithTopPadding = 56;
// const magicNumber = 30;

interface Props {
	electionId: number;
}

const Root = styled('div')(({ theme }) => ({
	height: '100%',
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : theme.palette.background.default,
}));

const AddStallFab = styled(Fab)(({ theme }) => ({
	position: 'absolute',
	//   bottom: `${drawerBleeding + bottomNav + 16}px`,
	/* Use this if we're using the SwipeableDrawer... */
	// bottom: `${drawerBleeding + 16}px`,
	/* ...or use this if we're using the current layout */
	bottom: `${16 + 48 + 36}px`, // 16 for standard bottom padding, 48 for the height of <SearchBar />, and then 36 more on top
	right: '16px',
	backgroundColor: theme.palette.secondary.main,
}));

function AppEntrypoint() {
	// Handle setting the currentElection in Redux based on route changes

	// Fallback to our default election if the route hasn't specified an election
	const elections = useAppSelector(selectAllElections);
	const defaultElection = getDefaultElection(elections);
	let electionId = defaultElection?.id;

	// Otherwise, set the election the route wants to use
	const urlElectionName = getStringParamOrUndefined(useParams(), 'election_name');
	if (urlElectionName !== undefined && urlElectionName !== '' && urlElectionName !== defaultElection?.name_url_safe) {
		electionId = elections.find((e) => e.name_url_safe === urlElectionName)?.id;
	}

	if (electionId === undefined) {
		return null;
	}

	return <App electionId={electionId} />;
}

function App(props: Props) {
	const { electionId } = props;

	const [sideDrawerOpen, setSideDrawerOpen] = React.useState(false);
	const toggleSideDrawerOpen = (e: any) => {
		setSideDrawerOpen(!sideDrawerOpen);
	};

	const [mapSearchResults, setMapSearchResults] = React.useState<number | null>(null);
	const toggleMapSearchResults = (resultSet: number) => {
		setMapSearchResults(resultSet);
	};

	const [open, setOpen] = React.useState(false);
	const toggleDrawer = (newOpen: boolean) => () => {
		setOpen(newOpen);
	};

	const [bottomDrawerOpen, setBottomDrawerOpen] = React.useState(false);
	const onToggleBottomDrawerOpen = (e: any) => {
		setBottomDrawerOpen(!bottomDrawerOpen);
	};
	const onClickMapFilterButton = () => {
		setFilterOpen(true);
		setBottomDrawerOpen(true);
		toggleFilter('foobar');
	};

	const [filterOpen, setFilterOpen] = React.useState(false);
	const toggleFilter = (e: any) => {
		setFilterOpen(!filterOpen);
	};

	const [userHasSearched, setUserHasSearched] = React.useState(false);
	const toggleUserHasSearched = (state: boolean) => {
		setUserHasSearched(state);
	};

	const [mapFilterOptions, setMapFilterOptions] = React.useState<IMapFilterOptions>({});
	const isMapFiltered = Object.values(mapFilterOptions).find((option) => option === true) || false;

	const [userSearchText, setUserSearchText] = React.useState('');
	const onSearchTextChange = (value: string) => setUserSearchText(value);

	return (
		<Root>
			<SideMenuDrawer open={sideDrawerOpen} onToggle={toggleSideDrawerOpen} />

			<DSAppBar toggleSideDrawerOpen={toggleSideDrawerOpen} topPadding={false} />

			{/* <div id="header">Header</div> */}

			{/* <div style={{ width: "100%", height: "100%" }}>
        <div className="openlayers-map-container"> */}
			{/* {electionId !== undefined && (
				<Map electionId={electionId} mapSearchResults={mapSearchResults} mapFilterOptions={mapFilterOptions} />
			)} */}
			<Map electionId={electionId} mapSearchResults={mapSearchResults} mapFilterOptions={mapFilterOptions} />
			{/* </div>
      </div> */}

			<LayersSelector electionId={electionId} />

			<SearchBar
				onSearch={toggleUserHasSearched}
				filterOpen={filterOpen}
				onToggleFilter={onClickMapFilterButton}
				onClick={onToggleBottomDrawerOpen}
				isMapFiltered={isMapFiltered}
				showFilter={true}
				styleProps={{
					position: 'absolute',
					bottom: '24px',
					width: '96%',
					zIndex: 1050,
					margin: '8px',
				}}
				id="search-bar"
				valueToShow={userSearchText}
			/>

			<AddStallFab color="primary" aria-label="add" onClick={() => (document.location.href = '/add-stall')}>
				<AddLocationIcon />
			</AddStallFab>

			<BottomDrawerTemporary
				toggleMapSearchResults={toggleMapSearchResults}
				isMapFiltered={isMapFiltered}
				onChangeFilter={setMapFilterOptions}
				open={bottomDrawerOpen}
				onSetOpen={setBottomDrawerOpen}
				onSearchTextChange={onSearchTextChange}
			/>

			{/* <BottomBar /> */}
		</Root>
	);
}

export default AppEntrypoint;
