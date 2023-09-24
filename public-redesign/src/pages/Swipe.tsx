import { Global } from '@emotion/react';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import * as React from 'react';

import AppBar from '@mui/material/AppBar';
import { grey } from '@mui/material/colors';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Fab from '@mui/material/Fab';
import { styled, useTheme } from '@mui/material/styles';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Toolbar from '@mui/material/Toolbar';
import BottomBar from './swipe/bottom_bar';
import Map from './swipe/map';
import SearchBar from './swipe/search_bar';
import SearchFilter from './swipe/search_filter';
// import StallSearchResults from "./swipe/stall_search_results";

const bottomNav = 56;
const drawerBleeding = 175 + bottomNav;
// const fixedBarHeightWithTopPadding = 56;
const magicNumber = 30;

interface Props {
	/**
	 * Injected by the documentation to work in an iframe.
	 * You won't need it on your project.
	 */
	window?: () => Window;
}

const Root = styled('div')(({ theme }) => ({
	height: '100%',
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : theme.palette.background.default,
}));

const StyledBox = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? '#fff' : grey[800],
}));

const StyledInteractableBox = styled(Box)(({ theme }) => ({
	pointerEvents: 'all',
	// backgroundColor: "red",
	padding: theme.spacing(1),
	overflowY: 'auto',
	// height: `calc(100vh - ${drawerBleeding}px - ${fixedBarHeightWithTopPadding}px + ${fixedBarHeightWithTopPadding}px)`,
	height: `calc(30vh - ${bottomNav}px - ${magicNumber}px)`,
}));

const Puller = styled(Box)(({ theme }) => ({
	width: 30,
	height: 6,
	backgroundColor: theme.palette.mode === 'light' ? grey[600] : grey[900],
	borderRadius: 3,
	position: 'absolute',
	top: 8,
	left: 'calc(50% - 15px)',
}));

const TitleLogo = styled('img')(({ theme }) => ({
	height: '32px',
	marginRight: '10px',
}));

const AddStallFab = styled(Fab)(() => ({
	position: 'absolute',
	bottom: `${drawerBleeding + bottomNav + 16}px`,
	right: '16px',
}));

export default function SwipeableEdgeDrawer(props: Props) {
	const { window } = props;

	const theme = useTheme();

	const [open, setOpen] = React.useState(false);
	const toggleDrawer = (newOpen: boolean) => () => {
		setOpen(newOpen);
	};

	const [filterOpen, setFilterOpen] = React.useState(false);
	const toggleFilter = (e: any) => {
		setFilterOpen(!filterOpen);
	};

	// This is used only for the example
	const container = window !== undefined ? () => window().document.body : undefined;

	return (
		<Root>
			<CssBaseline />
			<Global
				styles={{
					'.MuiDrawer-root > .MuiPaper-root': {
						height: `calc(80% - ${drawerBleeding}px)`,
						overflow: 'visible',
					},
				}}
			/>

			<Map mapSearchResults={null} mapFilterOptions={{ bbq: true, cake: true }} />

			<AddStallFab color="primary" aria-label="add">
				<AddIcon />
			</AddStallFab>

			<SwipeableDrawer
				container={container}
				anchor="bottom"
				open={open}
				onClose={toggleDrawer(false)}
				onOpen={toggleDrawer(true)}
				swipeAreaWidth={drawerBleeding}
				disableSwipeToOpen={false}
				ModalProps={{
					keepMounted: true,
				}}
			>
				<StyledBox
					sx={{
						position: 'absolute',
						top: -(drawerBleeding + bottomNav),
						borderTopLeftRadius: 8,
						borderTopRightRadius: 8,
						visibility: 'visible',
						right: 0,
						left: 0,
						backgroundColor: grey[300],
					}}
				>
					<Puller />

					<AppBar
						position="static"
						sx={{
							paddingTop: 1,
							backgroundColor: theme.palette.secondary.main,
						}}
					>
						<Container maxWidth="xl">
							<Toolbar disableGutters>
								<TitleLogo src="https://democracysausage.org/icons/sausage+cake_big.png" />

								<Typography
									variant="h5"
									noWrap
									component="a"
									href=""
									sx={{
										mr: 2,
										display: { xs: 'flex', md: 'none' },
										flexGrow: 1,
										fontWeight: 600,
										color: 'inherit',
										textDecoration: 'none',
									}}
								>
									Democracy Sausage
								</Typography>
							</Toolbar>
						</Container>
					</AppBar>

					<StyledInteractableBox>
						<SearchBar
							onSearch={() => {}}
							filterOpen={filterOpen}
							onToggleFilter={toggleFilter}
							onClick={() => {}}
							isMapFiltered={false}
							showFilter={true}
							styleProps={{}}
						/>

						{filterOpen === true && <SearchFilter onChangeFilter={() => {}} />}

						{/* <StallSearchResults /> */}
					</StyledInteractableBox>
				</StyledBox>
			</SwipeableDrawer>

			<BottomBar />
		</Root>
	);
}
