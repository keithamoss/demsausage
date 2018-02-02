import * as React from "react"
// import styled from "styled-components"
import { IAppModule, ISnackbarsModule, IElections, IElection } from "./redux/modules/interfaces"
import "./App.css"

import AppBar from "material-ui/AppBar"
import Snackbar from "material-ui/Snackbar"
import LinearProgress from "material-ui/LinearProgress"

// import FloatingActionButton from "material-ui/FloatingActionButton"
import { ExpandableBottomSheet } from "material-ui-bottom-sheet"
import { DeviceAccessTime, MapsDirectionsCar, MapsPlace, MapsLocalPhone } from "material-ui/svg-icons"
import { List, ListItem } from "material-ui"
import Divider from "material-ui/Divider"

import { BottomNavigation, BottomNavigationItem } from "material-ui/BottomNavigation"
import Paper from "material-ui/Paper"
import IconLocationOn from "material-ui/svg-icons/communication/location-on"

// const logo = require("./logo.svg")

export interface IProps {
    muiThemePalette: any
    app: IAppModule
    snackbars: ISnackbarsModule
    elections: IElections
    currentElection: IElection
    handleSnackbarClose: any
    onChangeElection: any
    content: any
}

class App extends React.Component<IProps, {}> {
    render() {
        const { muiThemePalette, app, snackbars, handleSnackbarClose, content } = this.props

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
                    <AppBar title={"Democracy Sausage"} />
                </div>
                <div className="page-content" style={{ display: app.sidebarOpen ? "flex" : "block" }}>
                    <main className="page-main-content">
                        {content || this.props.children}

                        <ExpandableBottomSheet
                            style={{ backgroundColor: "none" }}
                            bodyStyle={{ marginTop: "93vh" }}
                            // action={
                            //     <FloatingActionButton zDepth={1}>
                            //         <MapsDirectionsCar />
                            //     </FloatingActionButton>
                            // }
                            // onRequestClose={() => setState({isOpen: false})}
                            onRequestClose={() => console.log("onRequestClose")}
                            onTopReached={() => console.log("onTopReached")}
                            // open={state.isOpen}
                            open={true}
                        >
                            <Paper zDepth={0}>
                                <BottomNavigation>
                                    <BottomNavigationItem
                                        label="Recents"
                                        icon={<MapsDirectionsCar />}
                                        // onClick={() => this.select(0)}
                                    />
                                    <BottomNavigationItem
                                        label="Favorites"
                                        icon={<MapsLocalPhone />}
                                        // onClick={() => this.select(1)}
                                    />
                                    <BottomNavigationItem
                                        label="Nearby"
                                        icon={<IconLocationOn />}
                                        // onClick={() => this.select(2)}
                                    />
                                </BottomNavigation>
                            </Paper>

                            <h1 style={{ marginLeft: 72, marginTop: 40 }}>Dandelion Chocolate</h1>
                            <Divider inset={true} />
                            <List>
                                <ListItem primaryText="740 Valencia St, San Francisco, CA" leftIcon={<MapsPlace />} />
                                <ListItem primaryText="(415) 349-0942" leftIcon={<MapsLocalPhone />} />
                                <ListItem primaryText="Wed, 10 AM - 9 PM" leftIcon={<DeviceAccessTime />} />
                                <ListItem primaryText="740 Valencia St, San Francisco, CA" leftIcon={<MapsPlace />} />
                                <ListItem primaryText="(415) 349-0942" leftIcon={<MapsLocalPhone />} />
                                <ListItem primaryText="Wed, 10 AM - 9 PM" leftIcon={<DeviceAccessTime />} />
                                <ListItem primaryText="740 Valencia St, San Francisco, CA" leftIcon={<MapsPlace />} />
                                <ListItem primaryText="(415) 349-0942" leftIcon={<MapsLocalPhone />} />
                                <ListItem primaryText="Wed, 10 AM - 9 PM" leftIcon={<DeviceAccessTime />} />
                                <ListItem primaryText="740 Valencia St, San Francisco, CA" leftIcon={<MapsPlace />} />
                                <ListItem primaryText="(415) 349-0942" leftIcon={<MapsLocalPhone />} />
                                <ListItem primaryText="Wed, 10 AM - 9 PM" leftIcon={<DeviceAccessTime />} />
                                <ListItem primaryText="740 Valencia St, San Francisco, CA" leftIcon={<MapsPlace />} />
                                <ListItem primaryText="(415) 349-0942" leftIcon={<MapsLocalPhone />} />
                                <ListItem primaryText="Wed, 10 AM - 9 PM" leftIcon={<DeviceAccessTime />} />
                                <ListItem primaryText="740 Valencia St, San Francisco, CA" leftIcon={<MapsPlace />} />
                                <ListItem primaryText="(415) 349-0942" leftIcon={<MapsLocalPhone />} />
                                <ListItem primaryText="Wed, 10 AM - 9 PM" leftIcon={<DeviceAccessTime />} />
                                <ListItem primaryText="740 Valencia St, San Francisco, CA" leftIcon={<MapsPlace />} />
                                <ListItem primaryText="(415) 349-0942" leftIcon={<MapsLocalPhone />} />
                                <ListItem primaryText="Wed, 10 AM - 9 PM" leftIcon={<DeviceAccessTime />} />
                                <ListItem primaryText="740 Valencia St, San Francisco, CA" leftIcon={<MapsPlace />} />
                                <ListItem primaryText="(415) 349-0942" leftIcon={<MapsLocalPhone />} />
                                <ListItem primaryText="Wed, 10 AM - 9 PM" leftIcon={<DeviceAccessTime />} />
                                <ListItem primaryText="740 Valencia St, San Francisco, CA" leftIcon={<MapsPlace />} />
                                <ListItem primaryText="(415) 349-0942" leftIcon={<MapsLocalPhone />} />
                                <ListItem primaryText="Wed, 10 AM - 9 PM" leftIcon={<DeviceAccessTime />} />
                            </List>
                        </ExpandableBottomSheet>
                    </main>
                </div>
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
