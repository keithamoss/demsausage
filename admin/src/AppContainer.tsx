import * as React from "react"
// import styled from "styled-components"
import {
    // deepPurple900,
    // deepPurple800,
    // deepPurple700,
    // deepPurple600,
    deepPurple500,
    deepPurple400,
    deepPurple300,
    // deepPurple200,
    deepPurple100,
    white,
    fullBlack,
    yellow500,
} from "material-ui/styles/colors"
import { fade } from "material-ui/utils/colorManipulator"
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider"
import getMuiTheme from "material-ui/styles/getMuiTheme"
import App from "./App"
import { connect } from "react-redux"
import { fetchInitialAppState } from "./redux/modules/app"
import { logoutUser } from "./redux/modules/user"
import { iterate as iterateSnackbar } from "./redux/modules/snackbars"
// import CircularProgress from "material-ui/CircularProgress"
import LinearProgress from "material-ui/LinearProgress"
import { IStore, IAppModule, ISnackbarsModule, IUser } from "./redux/modules/interfaces"
// const Config: IConfig = require("Config") as any

const muiTheme = getMuiTheme({
    palette: {
        primary1Color: deepPurple500, // AppBar and Tabs, Buttons, Active textfield et cetera
        primary2Color: yellow500, // Whatever this is used for, we don't use that element
        primary3Color: deepPurple100, // Switch background
        accent1Color: deepPurple500, // Active tab highlight colour
        accent2Color: deepPurple400, // Toolbars and switch buttons
        accent3Color: deepPurple300, // Our app LinearProgress bar and Tabs
        textColor: fullBlack,
        alternateTextColor: white, // Buttons and Tabs
        canvasColor: white,
        borderColor: deepPurple100, // Unselected textfield, Divider, et cetera fields
        disabledColor: fade(fullBlack, 0.5), // Unselected textfield et cetera label colour
        pickerHeaderColor: yellow500, // Unused
        clockCircleColor: fade(yellow500, 0.07), // Unused
        shadowColor: fullBlack,
    },
    appBar: {
        height: 50,
    },
})

export interface IStateProps {
    // From Props
    app: IAppModule
    user: IUser
    snackbars: ISnackbarsModule
}

export interface IDispatchProps {
    fetchInitialAppState: Function
    handleSnackbarClose: Function
    doLogout: Function
}

export interface IRouteProps {
    content: any
    sidebar: any
    location: any
}

export class AppContainer extends React.Component<IStateProps & IDispatchProps & IRouteProps, {}> {
    componentDidMount() {
        const { fetchInitialAppState } = this.props
        fetchInitialAppState()
    }

    render() {
        const { app, user, snackbars, handleSnackbarClose, doLogout, children, content, sidebar } = this.props

        if (app.loading === true) {
            return (
                <MuiThemeProvider muiTheme={muiTheme}>
                    <div style={{ backgroundColor: muiTheme.palette!.primary1Color, width: "100%", height: "100%" }}>
                        <LinearProgress mode="indeterminate" color={muiTheme.palette!.accent3Color} />
                    </div>
                </MuiThemeProvider>
            )
        }

        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <App
                    muiThemePalette={!muiTheme.palette}
                    app={app}
                    user={user}
                    snackbars={snackbars}
                    handleSnackbarClose={handleSnackbarClose}
                    doLogout={doLogout}
                    children={children}
                    content={content}
                    sidebar={sidebar}
                />
            </MuiThemeProvider>
        )
    }
}

const mapStateToProps = (state: IStore): IStateProps => {
    const { app, user, snackbars } = state

    return {
        app: app,
        user: user.user,
        snackbars: snackbars,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        fetchInitialAppState: () => {
            dispatch(fetchInitialAppState())
        },
        handleSnackbarClose: (reason: string) => {
            if (reason === "timeout") {
                dispatch(iterateSnackbar())
            }
        },
        doLogout: () => {
            dispatch(logoutUser())
        },
    }
}

const AppContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(AppContainer)

export default AppContainerWrapped
