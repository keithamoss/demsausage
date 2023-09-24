import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import * as React from 'react';
import DSAppBar from './app_bar';
// import BottomBar from "./bottom_bar";
import { Global } from '@emotion/react';
import { drawerBleeding } from '../../App';
import SearchBar from './search_bar';
import SearchFilter from './search_filter';
import StallFocus from './stall_focus';
import StallSearchResults from './stall_search_results';

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
	toggleSideDrawerOpen: any;
	toggleMapSearchResults: any;
	onChangeFilter: any;
}

const StyledBox = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? '#fff' : grey[800],
}));

const StyledInteractableBoxMinimised = styled(Box)(({ theme }) => ({
	pointerEvents: 'all',
	// backgroundColor: "red",
	padding: theme.spacing(1),
	overflowY: 'auto',
	// height: `calc(100vh - ${drawerBleeding}px - ${fixedBarHeightWithTopPadding}px + ${fixedBarHeightWithTopPadding}px)`,
	//   height: `calc(30vh - ${bottomNav}px - ${magicNumber}px)`,
	// 175 = 112, 275 = 212
	height: `${drawerBleeding - 63}px`,
}));

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	pointerEvents: 'all',
	// backgroundColor: "red",
	padding: theme.spacing(1),
	overflowY: 'auto',
	// height: `calc(100vh - ${drawerBleeding}px - ${fixedBarHeightWithTopPadding}px + ${fixedBarHeightWithTopPadding}px)`,
	//   height: `calc(30vh - ${bottomNav}px - ${magicNumber}px)`,
	height: `calc(80dvh - 61px)`,
}));

const StyledInteractableBoxForStallFocusMinimised = styled(Box)(({ theme }) => ({
	// Disabling scrolling while minimised (seems like a better UX)
	// pointerEvents: "all",
	// overflowY: "auto",
	// height: `175px`,
}));

const StyledInteractableBoxForStallFocusFullHeight = styled(Box)(({ theme }) => ({
	pointerEvents: 'all',
	overflowY: 'auto',
	height: '80dvh',
}));

// @TODO https://stackoverflow.com/a/69740774
// const StyledInteractableBox = styled("div", {
//   shouldForwardProp: (prop) => prop.open,
// })(({ theme, open }: any) => ({
//   pointerEvents: "all",
//   // backgroundColor: "red",
//   padding: theme.spacing(1),
//   overflowY: "auto",
//   // height: `calc(100vh - ${drawerBleeding}px - ${fixedBarHeightWithTopPadding}px + ${fixedBarHeightWithTopPadding}px)`,
//   //   height: `calc(30vh - ${bottomNav}px - ${magicNumber}px)`,
//   // height: `calc(30vh - ${magicNumber}px)`,
//   height: open ? "calc(80vh - 61px)" : "112px",
// }));

const Puller = styled(Box)(({ theme }) => ({
	width: 30,
	height: 6,
	backgroundColor: theme.palette.mode === 'light' ? grey[500] : grey[900],
	borderRadius: 3,
	position: 'absolute',
	top: 8,
	left: 'calc(50% - 15px)',
}));

export default function BottomDrawer(props: Props) {
	const { window, toggleSideDrawerOpen, toggleMapSearchResults, onChangeFilter } = props;

	const [open, setOpen] = React.useState(false);
	const toggleDrawer = (newOpen: boolean) => () => {
		setOpen(newOpen);
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

	const StyledInteractableBox = open ? StyledInteractableBoxFullHeight : StyledInteractableBoxMinimised;

	const StyledInteractableBoxForStallFocus = open
		? StyledInteractableBoxForStallFocusFullHeight
		: StyledInteractableBoxForStallFocusMinimised;

	return (
		<React.Fragment>
			<Global
				styles={{
					'.MuiDrawer-root.SwipeableDrawer > .MuiPaper-root': {
						height: `calc(80dvh - ${drawerBleeding}px)`,
						overflow: 'visible',
					},
				}}
			/>

			{/* @TODO Investigate https://github.com/mui/material-ui/issues/16942 */}
			<SwipeableDrawer
				container={container}
				anchor="bottom"
				open={open}
				onClose={toggleDrawer(false)}
				onOpen={toggleDrawer(true)}
				swipeAreaWidth={drawerBleeding}
				className="SwipeableDrawer"
				disableSwipeToOpen={false}
				ModalProps={{
					keepMounted: true,
				}}
			>
				<StyledBox
					sx={{
						position: 'absolute',
						// top: -(drawerBleeding + bottomNav),
						top: -drawerBleeding,
						borderTopLeftRadius: 8,
						borderTopRightRadius: 8,
						visibility: 'visible',
						right: 0,
						left: 0,
						backgroundColor: stallFocussed === false ? grey[300] : 'white',
					}}
				>
					<Puller />

					{/* @TODO Investigate https://github.com/mui/material-ui/issues/16942 */}
					{/* @TODO See https://github.com/mui/material-ui/issues/30805 */}
					{stallFocussed === true && focussedStallId !== null && (
						<StyledInteractableBoxForStallFocus>
							<StallFocus toggleStallFocussed={toggleStallFocussed} focussedStallId={focussedStallId} />
						</StyledInteractableBoxForStallFocus>
					)}

					{stallFocussed === false && (
						<React.Fragment>
							<DSAppBar toggleSideDrawerOpen={toggleSideDrawerOpen} topPadding={true} />

							<StyledInteractableBox>
								<SearchBar
									onSearch={toggleUserHasSearched}
									filterOpen={filterOpen}
									onToggleFilter={toggleFilter}
									onClick={setOpen}
									isMapFiltered={false}
									showFilter={true}
									styleProps={{}}
								/>

								{filterOpen === true && <SearchFilter onChangeFilter={onChangeFilter} />}

								{userHasSearched === true && (
									<StallSearchResults
										toggleStallFocussed={toggleStallFocussed}
										toggleUserHasSearched={toggleUserHasSearched}
									/>
								)}
							</StyledInteractableBox>
						</React.Fragment>
					)}
				</StyledBox>
			</SwipeableDrawer>
		</React.Fragment>
	);
}
