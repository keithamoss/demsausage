import { setDrawerOpen, toggleDrawerOpen } from 'material-ui-responsive-drawer';
import LinearProgress from 'material-ui/LinearProgress';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {
	deepPurple100,
	deepPurple300,
	deepPurple400,
	deepPurple500,
	fullBlack,
	white,
	yellow500,
} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { fade } from 'material-ui/utils/colorManipulator';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import styled from 'styled-components';
import App from './App';
import Logo from './icons/logo';
import {
	IModule as IAppModule,
	fetchInitialAppState,
	getAPIBaseURL,
	getBaseURL,
	setEmbedMapFlag,
} from './redux/modules/app';
import {
	IElection,
	getElectionsToShowInAppBar,
	getLiveElections,
	getURLSafeElectionName,
	setCurrentElection,
} from './redux/modules/elections';
import { IStore } from './redux/modules/reducer';
import { IModule as ISnackbarsModule, iterate as iterateSnackbar } from './redux/modules/snackbars';
import { gaTrack } from './shared/analytics/GoogleAnalytics';

const muiTheme = getMuiTheme({
	palette: {
		primary1Color: '#6740b4', // AppBar and Tabs, Buttons, Active textfield et cetera
		primary2Color: deepPurple400, // Used for the selected date in DatePicker
		primary3Color: deepPurple100, // Switch background
		accent1Color: deepPurple500, // Active tab highlight colour
		accent2Color: deepPurple400, // Toolbars and switch buttons
		accent3Color: deepPurple300, // Our app LinearProgress bar and Tabs
		textColor: fullBlack,
		alternateTextColor: white, // Buttons and Tabs
		canvasColor: white,
		borderColor: deepPurple100, // Unselected textfield, Divider, et cetera fields
		disabledColor: fade(fullBlack, 0.5), // Unselected textfield et cetera label colour
		pickerHeaderColor: deepPurple300, // Used for DatePicker
		clockCircleColor: fade(yellow500, 0.07), // Unused
		shadowColor: fullBlack,
	},
	appBar: {
		height: 50,
	},
});

const FlexboxCentredContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	width: 100%;
`;

const LogoContainer = styled.div`
	text-align: center;

	& > svg {
		max-width: 70vw;
		max-height: 60vh;
	}
`;

const DemocracySausageTitle = styled.h1`
	margin-top: 0px;
	font-size: 38px;
	font-size: 6vmin;
	color: white;
`;

interface IRouterProps {
	content: any;
	location: any;
}

interface IRouteProps {
	electionName: string;
	embed: string | undefined;
}

interface IOwnProps {
	params: IRouteProps;
}

interface IProps extends IOwnProps {}

interface IStoreProps {
	// From Props
	app: IAppModule;
	snackbars: ISnackbarsModule;
	elections: Array<IElection>;
	liveElections: Array<IElection>;
	currentElection: IElection;
	defaultElection: IElection;
	browser: any;
	responsiveDrawer: any;
}

interface IDispatchProps {
	getInitialAppState: Function;
	setElectionFromRoute: Function;
	setEmbedMapFromRoute: Function;
	handleSnackbarClose: Function;
	onOpenDrawer: Function;
	onClickDrawerLink: Function;
	onClickOutboundDrawerLink: Function;
}

interface IStateProps {}

const DEFAULT_BREAK_POINT = 'small';
function isResponsiveAndOverBreakPoint(browser: any, responsiveDrawer: any, breakPoint: any = DEFAULT_BREAK_POINT) {
	return browser.greaterThan[breakPoint] && responsiveDrawer.responsive;
}

const isFooterNavBarVisible = (content: any) => {
	if (window.location.pathname.startsWith('/search/')) {
		return false;
	}

	return !('muiName' in content.type) || content.type.muiName !== 'SausageMapContainer';
};

type TComponentProps = IStoreProps & IDispatchProps & IRouterProps & IOwnProps & { children: React.ReactNode };
class AppContainer extends React.Component<TComponentProps, IStateProps> {
	async componentDidMount() {
		const { getInitialAppState, params, setEmbedMapFromRoute, location } = this.props;
		await getInitialAppState(params.electionName);

		if (new URLSearchParams(location.search).has('embed') === true) {
			setEmbedMapFromRoute(true);
		}
	}

	UNSAFE_componentWillReceiveProps(nextProps: TComponentProps) {
		// Handle setting the currentElection in Redux based on route changes
		if ('params' in nextProps && 'electionName' in nextProps.params && nextProps.elections.length > 0) {
			// Fallback to our default election if the route hasn't specified an election
			if (nextProps.params.electionName === undefined) {
				if (nextProps.defaultElection !== undefined) {
					nextProps.setElectionFromRoute(nextProps.defaultElection.id);
				}
			} else {
				// Otherwise, set the election the route wants to use
				const election = nextProps.elections.find(
					(e: IElection) => getURLSafeElectionName(e) === nextProps.params.electionName,
				);
				if (election !== undefined) {
					nextProps.setElectionFromRoute(election.id);
				}
			}
		}
	}

	render() {
		const {
			app,
			snackbars,
			elections,
			liveElections,
			currentElection,
			browser,
			responsiveDrawer,
			handleSnackbarClose,
			onOpenDrawer,
			onClickDrawerLink,
			onClickOutboundDrawerLink,
			location,
			children,
			content,
		} = this.props;

		if (app.loading === true || elections.length === 0) {
			return (
				<MuiThemeProvider muiTheme={muiTheme}>
					<div style={{ backgroundColor: muiTheme.palette!.primary1Color, width: '100%', height: '100%' }}>
						<LinearProgress mode="indeterminate" color={muiTheme.palette!.accent3Color} />
						<FlexboxCentredContainer>
							<LogoContainer>
								<Logo />
								<DemocracySausageTitle>Democracy Sausage</DemocracySausageTitle>
							</LogoContainer>
						</FlexboxCentredContainer>
					</div>
				</MuiThemeProvider>
			);
		}

		const { electionsToShow, isHistoricalElectionShown } = getElectionsToShowInAppBar(
			elections,
			liveElections,
			currentElection,
		);
		const showElectionAppBar =
			'pageTitle' in content.type &&
			(!('muiName' in content.type) || content.type.muiName !== 'ElectionChooserContainer') &&
			(isHistoricalElectionShown === true || (isHistoricalElectionShown === false && electionsToShow.length > 1));

		const showFooterNavBar = isFooterNavBarVisible(content);

		return (
			<MuiThemeProvider muiTheme={muiTheme}>
				<React.Fragment>
					<Helmet>
						<title>Democracy Sausage</title>

						{/* Open Graph / Facebook */}
						<meta property="og:type" content="website" />
						<meta property="og:url" content={getBaseURL()} />
						<meta property="og:title" content="Democracy Sausage" />
						<meta property="og:image" content={`${getAPIBaseURL()}/0.1/current_map_image/`} />
						<meta
							property="og:description"
							content="A real-time crowd-sourced map of sausage and cake availability at Australian elections. It's practically part of the Australian Constitution. Or something. #demsausage"
						/>

						{/* Twitter */}
						<meta name="twitter:card" content="summary_large_image" />
						<meta name="twitter:site" content="@DemSausage" />
						<meta name="twitter:creator" content="@DemSausage" />
					</Helmet>

					<App
						muiThemePalette={muiTheme.palette}
						app={app}
						snackbars={snackbars}
						elections={elections}
						currentElection={currentElection}
						showElectionAppBar={showElectionAppBar}
						showFooterNavBar={showFooterNavBar}
						defaultBreakPoint={DEFAULT_BREAK_POINT}
						isResponsiveAndOverBreakPoint={isResponsiveAndOverBreakPoint(browser, responsiveDrawer)}
						handleSnackbarClose={handleSnackbarClose}
						onOpenDrawer={onOpenDrawer}
						onClickDrawerLink={onClickDrawerLink}
						onClickOutboundDrawerLink={onClickOutboundDrawerLink}
						locationPathName={location.pathname}
						children={children}
						content={content}
					/>
				</React.Fragment>
			</MuiThemeProvider>
		);
	}
}

const mapStateToProps = (state: IStore): IStoreProps => {
	const { app, snackbars, elections, browser, responsiveDrawer } = state;

	return {
		app,
		snackbars,
		elections: elections.elections,
		liveElections: getLiveElections(state),
		currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
		defaultElection: elections.elections.find((election: IElection) => election.id === elections.default_election_id)!,
		browser,
		responsiveDrawer,
	};
};

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
	return {
		getInitialAppState: (initialElectionName: string) => {
			dispatch(fetchInitialAppState(initialElectionName));
		},
		setElectionFromRoute: (electionId: number) => {
			dispatch(setCurrentElection(electionId));
		},
		setEmbedMapFromRoute: (embed: boolean) => {
			dispatch(setEmbedMapFlag(embed));
		},
		handleSnackbarClose: (reason: string) => {
			if (reason === 'timeout') {
				dispatch(iterateSnackbar());
			}
		},
		onOpenDrawer: () => {
			gaTrack.event({
				category: 'AppContainer',
				action: 'onOpenDrawer',
			});
			dispatch(toggleDrawerOpen());
		},
		onClickDrawerLink: (_e: React.MouseEvent<HTMLElement>) => {
			dispatch(setDrawerOpen(false));
		},
		onClickOutboundDrawerLink: (_e: React.MouseEvent<HTMLElement>, linkName: string) => {
			gaTrack.event({
				category: 'AppContainer',
				action: 'onOutboundLinkClick',
				label: linkName,
			});
		},
	};
};

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(mapStateToProps, mapDispatchToProps)(AppContainer);
