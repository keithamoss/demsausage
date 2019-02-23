// const Config: IConfig = require("Config") as any
import { setDrawerOpen } from "material-ui-responsive-drawer"
// import CircularProgress from "material-ui/CircularProgress"
import LinearProgress from "material-ui/LinearProgress"
// import styled from "styled-components"
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
import App from "./App"
import { LoginDialog } from "./authentication/login-dialog/LoginDialog"
import { fetchInitialAppState, IModule as IAppModule } from "./redux/modules/app"
import { IElection, setCurrentElection } from "./redux/modules/elections"
import { IStore } from "./redux/modules/reducer"
import { IModule as ISnackbarsModule, iterate as iterateSnackbar } from "./redux/modules/snackbars"
import { IUser } from "./redux/modules/user"

const muiTheme = getMuiTheme({
    palette: {
        primary1Color: deepPurple500, // AppBar and Tabs, Buttons, Active textfield et cetera
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

export interface IStoreProps {
    // From Props
    app: IAppModule
    user: IUser
    snackbars: ISnackbarsModule
    currentElection: IElection
    pendingStallCount: number
    browser: any
    responsiveDrawer: any
}

export interface IDispatchProps {
    setElectionFromRoute: Function
    fetchInitialAppState: Function
    handleSnackbarClose: Function
    onClickDrawerLink: Function
}

export interface IStateProps {}

export interface IRouteProps {
    content: any
    location: any
    params?: {
        electionIdentifier?: string
    }
}

const DEFAULT_BREAK_POINT = "small"
function isResponsiveAndOverBreakPoint(browser: any, responsiveDrawer: any, breakPoint: any = DEFAULT_BREAK_POINT) {
    return browser.greaterThan[breakPoint] && responsiveDrawer.responsive
}

export class AppContainer extends React.Component<IStoreProps & IDispatchProps & IRouteProps, IStateProps> {
    constructor(props: IStoreProps & IDispatchProps & IRouteProps) {
        super(props)
    }

    componentWillMount() {
        const { setElectionFromRoute, fetchInitialAppState } = this.props

        // If our route dictates that we're looking at a particular election then
        // this becomes our default election
        if ("params" in this.props && "electionIdentifier" in this.props.params!) {
            setElectionFromRoute(parseInt(this.props.params!.electionIdentifier!, 10))
        }
        fetchInitialAppState()
    }

    render() {
        const {
            app,
            user,
            snackbars,
            currentElection,
            pendingStallCount,
            browser,
            responsiveDrawer,
            handleSnackbarClose,
            onClickDrawerLink,
            children,
            content,
        } = this.props

        if (app.loading === true) {
            return (
                <MuiThemeProvider muiTheme={muiTheme}>
                    <div style={{ backgroundColor: muiTheme.palette!.primary1Color, width: "100%", height: "100%" }}>
                        <LinearProgress mode="indeterminate" color={muiTheme.palette!.accent3Color} />
                    </div>
                </MuiThemeProvider>
            )
        }

        if (user === null) {
            return (
                <MuiThemeProvider muiTheme={muiTheme}>
                    <LoginDialog open={true} />
                </MuiThemeProvider>
            )
        }

        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <App
                    muiThemePalette={muiTheme.palette}
                    app={app}
                    user={user}
                    snackbars={snackbars}
                    currentElection={currentElection}
                    pendingStallCount={pendingStallCount}
                    defaultBreakPoint={DEFAULT_BREAK_POINT}
                    isResponsiveAndOverBreakPoint={isResponsiveAndOverBreakPoint(browser, responsiveDrawer)}
                    handleSnackbarClose={handleSnackbarClose}
                    children={children}
                    content={content}
                    onClickDrawerLink={onClickDrawerLink}
                    locationPathName={location.pathname}
                />
            </MuiThemeProvider>
        )
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { app, user, snackbars, elections, stalls, browser, responsiveDrawer } = state

    return {
        app: app,
        user: user.user,
        snackbars: snackbars,
        currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
        pendingStallCount: stalls.pending.length,
        browser: browser,
        responsiveDrawer: responsiveDrawer,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        setElectionFromRoute: (electionId: number) => {
            dispatch(setCurrentElection(electionId))
        },
        fetchInitialAppState: () => {
            dispatch(fetchInitialAppState())
        },
        handleSnackbarClose: (reason: string) => {
            if (reason === "timeout") {
                dispatch(iterateSnackbar())
            }
        },
        onClickDrawerLink: () => {
            dispatch(setDrawerOpen(false))
        },
    }
}

const AppContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(AppContainer)

export default AppContainerWrapped
