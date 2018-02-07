import * as React from "react"
// import styled from "styled-components"
import { Link } from "react-router"
import { IAppModule, ISnackbarsModule, IElections, IElection } from "./redux/modules/interfaces"
import "./App.css"

import AppBar from "material-ui/AppBar"
import Snackbar from "material-ui/Snackbar"
import LinearProgress from "material-ui/LinearProgress"

import { MapsDirectionsCar, MapsPlace } from "material-ui/svg-icons"
import IconLocationOn from "material-ui/svg-icons/communication/location-on"

import { BottomNavigation, BottomNavigationItem } from "material-ui/BottomNavigation"
import Paper from "material-ui/Paper"
import { List, ListItem } from "material-ui/List"

// const logo = require("./logo.svg")

export interface IProps {
    muiThemePalette: any
    app: IAppModule
    snackbars: ISnackbarsModule
    elections: IElections
    currentElection: IElection
    handleSnackbarClose: any
    toggleSidebar: any
    onChangeElection: any
    content: any
}

class App extends React.Component<IProps, {}> {
    render() {
        const { muiThemePalette, app, snackbars, handleSnackbarClose, toggleSidebar, content } = this.props

        const styles: React.CSSProperties = {
            linearProgressStyle: {
                position: "fixed",
                top: "0px",
                zIndex: 1200,
                display: app.requestsInProgress > 0 ? "block" : "none",
            },
        }

        return (
            <div className="page">
                <div className="page-header">
                    <LinearProgress mode="indeterminate" color={muiThemePalette.accent3Color} style={styles.linearProgressStyle} />
                    <AppBar title={"Democracy Sausage"} onLeftIconButtonTouchTap={() => toggleSidebar()} />
                </div>
                <div className="page-content" style={{ display: app.sidebarOpen ? "flex" : "block" }}>
                    <main className="page-main-content">{content || this.props.children}</main>

                    {app.sidebarOpen && (
                        <nav className="page-nav">
                            <List>
                                <ListItem
                                    primaryText="Review Pending Stalls"
                                    leftIcon={<IconLocationOn />}
                                    containerElement={<Link to={`/stalls`} />}
                                />
                            </List>
                        </nav>
                    )}
                </div>

                <Paper zDepth={1} className="page-footer">
                    <BottomNavigation>
                        <BottomNavigationItem
                            label="Map"
                            icon={<IconLocationOn />}
                            // onClick={() => this.select(1)}
                        />
                        <BottomNavigationItem
                            label="Find"
                            icon={<IconLocationOn />}
                            // onClick={() => this.select(1)}
                        />
                        <BottomNavigationItem
                            label="Report"
                            icon={<MapsDirectionsCar />}
                            // onClick={() => this.select(2)}
                        />
                        <BottomNavigationItem
                            label="Sausagelytics"
                            icon={<MapsPlace />}
                            // onClick={() => this.select(2)}
                        />
                    </BottomNavigation>
                </Paper>

                <Snackbar
                    open={snackbars.open}
                    message={snackbars.active.message}
                    action={snackbars.active.action}
                    autoHideDuration={snackbars.active.autoHideDuration}
                    onActionTouchTap={() => {
                        if ("onActionTouchTap" in snackbars.active) {
                            snackbars.active.onActionTouchTap!()
                        }
                    }}
                    onRequestClose={handleSnackbarClose}
                />
            </div>
        )
    }
}

export default App
