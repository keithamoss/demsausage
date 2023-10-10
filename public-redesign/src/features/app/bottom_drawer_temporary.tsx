import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import * as React from 'react';
// import BottomBar from "./bottom_bar";
import { Drawer } from '@mui/material';
import SearchBar from './search_bar';
import SearchFilter from '../search/search_filter';
import StallFocus from '../search/stall_focus';
import StallSearchResults from '../search/stall_search_results';

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
	window?: () => Window;
	toggleMapSearchResults: any;
	isMapFiltered: boolean;
	onChangeFilter: any;
	open: boolean;
	onSetOpen: any;
	onSearchTextChange: any;
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
export default function BottomDrawerTemporary(props: Props) {
	const { window, toggleMapSearchResults, isMapFiltered, onChangeFilter, open, onSetOpen, onSearchTextChange } = props;

	const toggleDrawer = (newOpen: boolean) => () => {
		onSetOpen(newOpen);
	};

	const [filterOpen, setFilterOpen] = React.useState(false);
	const toggleFilter = (e: any) => {
		setFilterOpen(!filterOpen);
	};

	const [stallFocussed, setStallFocussed] = React.useState(false);
	const toggleStallFocussed = (e: any) => {
		toggleMapSearchResults(Math.random() >= 0.5 ? 0 : 1);
		toggleFocussedStallId(Math.random() >= 0.5 ? 0 : 1);
		setStallFocussed(!stallFocussed);
	};

	const [focussedStallId, setFocussedStallId] = React.useState<number | null>(null);
	const toggleFocussedStallId = (stallId: number) => {
		setFocussedStallId(stallId);
	};

	const [userHasSearched, setUserHasSearched] = React.useState(false);
	const toggleUserHasSearched = (state: boolean) => {
		setUserHasSearched(state);
	};

	// This is used only for the example
	const container = window !== undefined ? () => window().document.body : undefined;

	return (
		<React.Fragment>
			<Drawer
				container={container}
				anchor="bottom"
				open={open}
				onClose={toggleDrawer(false)}
				ModalProps={{
					keepMounted: true,
				}}
			>
				<StyledBox>
					{stallFocussed === true && focussedStallId !== null && (
						<StyledInteractableBoxForStallFocusFullHeight>
							<StallFocus toggleStallFocussed={toggleStallFocussed} focussedStallId={focussedStallId} />
						</StyledInteractableBoxForStallFocusFullHeight>
					)}

					{stallFocussed === false && (
						<StyledInteractableBoxFullHeight>
							<SearchBar
								onSearch={toggleUserHasSearched}
								onSearchTextChange={onSearchTextChange}
								filterOpen={filterOpen}
								onToggleFilter={toggleFilter}
								onClick={undefined}
								isMapFiltered={isMapFiltered}
								showFilter={true}
								styleProps={{}}
								forceFocussed={true}
								id="search-bar-bottom-drawer-temporary"
							/>

							{filterOpen === true && <SearchFilter onChangeFilter={onChangeFilter} />}

							{userHasSearched === true && (
								<StallSearchResults
									toggleStallFocussed={toggleStallFocussed}
									toggleUserHasSearched={toggleUserHasSearched}
								/>
							)}
						</StyledInteractableBoxFullHeight>
					)}
				</StyledBox>
			</Drawer>
		</React.Fragment>
	);
}
