// const Config: IConfig = require("Config") as any
import { setDrawerOpen, toggleDrawerOpen } from "material-ui-responsive-drawer"
import LinearProgress from "material-ui/LinearProgress"
import {
    // deepPurple200,
    deepPurple100,
    deepPurple300,
    deepPurple400,
    // deepPurple900,
    // deepPurple800,
    // deepPurple700,
    // deepPurple600,
    deepPurple500,
    fullBlack,
    white,
    yellow500,
} from "material-ui/styles/colors"
import getMuiTheme from "material-ui/styles/getMuiTheme"
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import { fade } from "material-ui/utils/colorManipulator"
import * as React from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import App from "./App"
import { ReactComponent as Logo } from "./demsausage_logo.svg"
import { fetchInitialAppState, IModule as IAppModule } from "./redux/modules/app"
import { getURLSafeElectionName, IElection, setCurrentElection } from "./redux/modules/elections"
import { IStore } from "./redux/modules/reducer"
import { IModule as ISnackbarsModule, iterate as iterateSnackbar } from "./redux/modules/snackbars"
import { gaTrack } from "./shared/analytics/GoogleAnalytics"

const muiTheme = getMuiTheme({
    palette: {
        primary1Color: "#6740b4", // AppBar and Tabs, Buttons, Active textfield et cetera
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
})

const FlexboxCentredContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    height: 100%;
`

const FlexboxCentredBox = styled.div`
    width: 60%;
    max-width: 300px;
    text-align: center;
    align-items: start;

    & > div:last-child {
        margin-top: -30px;
    }

    & img {
        width: 100%;
        height: 100%;
        max-width: 200px;
    }

    & h1 {
        font-size: 38px;
        color: white;
    }
`

export interface IStoreProps {
    // From Props
    app: IAppModule
    snackbars: ISnackbarsModule
    elections: Array<IElection>
    currentElection: IElection
    defaultElection: IElection
    browser: any
    responsiveDrawer: any
}

export interface IDispatchProps {
    fetchInitialAppState: Function
    setElectionFromRoute: Function
    handleSnackbarClose: Function
    onOpenDrawer: Function
    onClickDrawerLink: Function
    onClickOutboundDrawerLink: Function
}

export interface IStateProps {}

export interface IRouterProps {
    content: any
    location: any
}

export interface IRouteProps {
    electionName: string
}

interface IOwnProps {
    params: IRouteProps
}

const DEFAULT_BREAK_POINT = "small"
function isResponsiveAndOverBreakPoint(browser: any, responsiveDrawer: any, breakPoint: any = DEFAULT_BREAK_POINT) {
    return browser.greaterThan[breakPoint] && responsiveDrawer.responsive
}

export class AppContainer extends React.Component<IStoreProps & IDispatchProps & IRouterProps & IOwnProps, IStateProps> {
    async componentDidMount() {
        const { fetchInitialAppState, params } = this.props
        await fetchInitialAppState(params.electionName)

        document.title = "Democracy Sausage"
    }

    componentWillReceiveProps(nextProps: IStoreProps & IDispatchProps & IRouterProps & IOwnProps) {
        // Handle setting the currentElection in Redux based on route changes
        if ("params" in nextProps && "electionName" in nextProps.params && nextProps.elections.length > 0) {
            // Fallback to our default election if the route hasn't specified an election
            if (nextProps.params.electionName === undefined) {
                if (nextProps.defaultElection !== undefined) {
                    nextProps.setElectionFromRoute(nextProps.defaultElection.id)
                }
            } else {
                // Otherwise, set the election the route wants to use
                const election = nextProps.elections.find(
                    (election: IElection) => getURLSafeElectionName(election) === nextProps.params.electionName
                )
                if (election !== undefined) {
                    nextProps.setElectionFromRoute(election.id)
                }
            }
        }
    }

    render() {
        const {
            app,
            snackbars,
            elections,
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
        } = this.props

        if (app.loading === true || elections.length === 0) {
            return (
                <MuiThemeProvider muiTheme={muiTheme}>
                    <div style={{ backgroundColor: muiTheme.palette!.primary1Color, width: "100%", height: "100%" }}>
                        <LinearProgress mode="indeterminate" color={muiTheme.palette!.accent3Color} />
                        <FlexboxCentredContainer>
                            <FlexboxCentredBox>
                                <div>
                                    <Logo />
                                </div>
                                <div>
                                    <h1>Democracy Sausage</h1>
                                </div>
                            </FlexboxCentredBox>
                        </FlexboxCentredContainer>
                    </div>
                </MuiThemeProvider>
            )
        }

        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <App
                    muiThemePalette={muiTheme.palette}
                    app={app}
                    snackbars={snackbars}
                    elections={elections}
                    currentElection={currentElection}
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
            </MuiThemeProvider>
        )
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { app, snackbars, elections, browser, responsiveDrawer } = state

    return {
        app: app,
        snackbars: snackbars,
        elections: elections.elections,
        currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
        defaultElection: elections.elections.find((election: IElection) => election.id === elections.default_election_id)!,
        browser: browser,
        responsiveDrawer: responsiveDrawer,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        fetchInitialAppState: (initialElectionName: string) => {
            dispatch(fetchInitialAppState(initialElectionName))
        },
        setElectionFromRoute: (electionId: number) => {
            dispatch(setCurrentElection(electionId))
        },
        handleSnackbarClose: (reason: string) => {
            if (reason === "timeout") {
                dispatch(iterateSnackbar())
            }
        },
        onOpenDrawer: () => {
            gaTrack.event({
                category: "AppContainer",
                action: "onOpenDrawer",
            })
            dispatch(toggleDrawerOpen())
        },
        onClickDrawerLink: (e: React.MouseEvent<HTMLElement>) => {
            dispatch(setDrawerOpen(false))
        },
        onClickOutboundDrawerLink: (e: React.MouseEvent<HTMLElement>, linkName: string) => {
            gaTrack.event({
                category: "AppContainer",
                action: "onOutboundLinkClick",
                label: linkName,
            })
        },
    }
}

const AppContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(AppContainer)

export default AppContainerWrapped
