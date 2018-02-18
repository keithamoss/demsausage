import * as React from "react"
import styled from "styled-components"
import { Link } from "react-router"
import { IAppModule, ISnackbarsModule, IElections, IElection } from "./redux/modules/interfaces"
import "./App.css"

import AppBar from "material-ui/AppBar"
import Snackbar from "material-ui/Snackbar"
import LinearProgress from "material-ui/LinearProgress"

import { MapsMap, MapsAddLocation, ActionSearch } from "material-ui/svg-icons"
// import IconLocationOn from "material-ui/svg-icons/communication/location-on"

import { BottomNavigation, BottomNavigationItem } from "material-ui/BottomNavigation"
import Paper from "material-ui/Paper"
// import { List, ListItem } from "material-ui/List"

// const logo = require("./logo.svg")

const TitleContainer = styled.div`
    display: flex;
    align-items: center;
`

const TitleLogo = styled.img`
    width: 35px; /* 80% */
    height: 32px;
    margin-right: 10px;
`

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
                    <AppBar
                        title={
                            <TitleContainer>
                                <TitleLogo src="./icons/sausage+cake_big.png" /> Democracy Sausage
                            </TitleContainer>
                        }
                        onLeftIconButtonTouchTap={() => toggleSidebar()}
                    />
                </div>
                <div className="page-content" style={{ display: app.sidebarOpen ? "flex" : "block" }}>
                    <main className="page-main-content">{content || this.props.children}</main>

                    {app.sidebarOpen && (
                        <nav className="page-nav">
                            {/* <List>
                                <ListItem
                                    primaryText="Review Pending Stalls"
                                    leftIcon={<IconLocationOn />}
                                    containerElement={<Link to={`/stalls`} />}
                                />
                            </List> */}
                        </nav>
                    )}
                </div>

                <Paper zDepth={1} className="page-footer">
                    <BottomNavigation>
                        <Link to={"/"}>
                            <BottomNavigationItem label="Map" icon={<MapsMap />} />
                        </Link>
                        <Link to={"/search"}>
                            <BottomNavigationItem label="Find" icon={<ActionSearch />} />
                        </Link>
                        <Link to={"/add-stall"}>
                            <BottomNavigationItem label="Add Stall" icon={<MapsAddLocation />} />
                        </Link>
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
