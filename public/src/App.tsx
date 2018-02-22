import * as React from "react"
import styled from "styled-components"
import { browserHistory, Link } from "react-router"
import { IAppModule, ISnackbarsModule, IElections, IElection } from "./redux/modules/interfaces"
import "./App.css"

import { ResponsiveDrawer, BodyContainer, ResponsiveAppBar } from "material-ui-responsive-drawer"

// import AppBar from "material-ui/AppBar"
import Snackbar from "material-ui/Snackbar"
import LinearProgress from "material-ui/LinearProgress"

import { MapsMap, MapsAddLocation, ActionSearch, ActionStore, ActionInfo, HardwareTv, CommunicationEmail } from "material-ui/svg-icons"

// import Drawer from "material-ui/Drawer"
import { BottomNavigation, BottomNavigationItem } from "material-ui/BottomNavigation"
import Paper from "material-ui/Paper"
import { List, ListItem } from "material-ui/List"
import Subheader from "material-ui/Subheader"
import Divider from "material-ui/Divider"

import TwitterIcon from "./icons/fontawesome/twitter"
import FacebookIcon from "./icons/fontawesome/facebook"

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

class MenuListItem extends React.Component<any, any> {
    render(): any {
        const { muiThemePalette, locationPathName, locationPathNameMatch, ...rest } = this.props

        if (locationPathNameMatch === locationPathName) {
            rest.style = { color: muiThemePalette.accent1Color }
            rest.leftIcon = React.cloneElement(rest.leftIcon, { color: muiThemePalette.accent1Color })
        }
        return <ListItem {...rest} />
    }
}

export interface IProps {
    muiThemePalette: any
    app: IAppModule
    snackbars: ISnackbarsModule
    elections: IElections
    currentElection: IElection
    isResponsiveAndOverBreakPoint: boolean
    handleSnackbarClose: any
    toggleSidebar: any
    onChangeElection: any
    locationPathName: string
    content: any
}

class App extends React.Component<IProps, {}> {
    render() {
        const {
            muiThemePalette,
            app,
            snackbars,
            isResponsiveAndOverBreakPoint,
            handleSnackbarClose,
            locationPathName,
            content,
        } = this.props

        let bottomNavSelectedIndex: number = -1
        if (locationPathName === "/") {
            bottomNavSelectedIndex = 0
        } else if (locationPathName === "/search") {
            bottomNavSelectedIndex = 1
        } else if (locationPathName === "/add-stall") {
            bottomNavSelectedIndex = 2
        }

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
                <ResponsiveDrawer>
                    {isResponsiveAndOverBreakPoint === true && (
                        <List>
                            <MenuListItem
                                primaryText="Map"
                                leftIcon={<MapsMap />}
                                containerElement={<Link to={`/`} />}
                                locationPathName={locationPathName}
                                locationPathNameMatch={"/"}
                                muiThemePalette={muiThemePalette}
                            />
                            <MenuListItem
                                primaryText="Find"
                                leftIcon={<ActionSearch />}
                                containerElement={<Link to={`/search`} />}
                                locationPathName={locationPathName}
                                locationPathNameMatch={"/search"}
                                muiThemePalette={muiThemePalette}
                            />
                            <MenuListItem
                                primaryText="Add Stall"
                                leftIcon={<MapsAddLocation />}
                                containerElement={<Link to={`/add-stall`} />}
                                locationPathName={locationPathName}
                                locationPathNameMatch={"/add-stall"}
                                muiThemePalette={muiThemePalette}
                            />
                        </List>
                    )}
                    {isResponsiveAndOverBreakPoint === true && <Divider />}
                    <List>
                        <MenuListItem
                            primaryText="About Us"
                            leftIcon={<ActionInfo />}
                            containerElement={<Link to={`/about`} />}
                            locationPathName={locationPathName}
                            locationPathNameMatch={"/about"}
                            muiThemePalette={muiThemePalette}
                        />
                        <MenuListItem
                            primaryText="Media"
                            leftIcon={<HardwareTv />}
                            containerElement={<Link to={`/media`} />}
                            locationPathName={locationPathName}
                            locationPathNameMatch={"/media"}
                            muiThemePalette={muiThemePalette}
                        />
                        <ListItem
                            primaryText="Redbubble Store"
                            leftIcon={<ActionStore />}
                            containerElement={<a href={"http://www.redbubble.com/people/demsausage/"} />}
                        />
                    </List>
                    <Divider />
                    <List>
                        <Subheader>Contact Us</Subheader>
                        <ListItem
                            primaryText="Email"
                            leftIcon={<CommunicationEmail />}
                            containerElement={<a href={"mailto:ausdemocracysausage@gmail.com"} />}
                        />
                        <ListItem
                            primaryText="Twitter"
                            leftIcon={<TwitterIcon />}
                            containerElement={<a href={"https://twitter.com/DemSausage"} />}
                        />
                        <ListItem
                            primaryText="Facebook"
                            leftIcon={<FacebookIcon />}
                            containerElement={<a href={"https://www.facebook.com/AusDemocracySausage"} />}
                        />
                    </List>
                </ResponsiveDrawer>

                <BodyContainer>
                    <LinearProgress mode="indeterminate" color={muiThemePalette.accent3Color} style={styles.linearProgressStyle} />

                    <ResponsiveAppBar
                        title={
                            <TitleContainer>
                                <TitleLogo src="/icons/sausage+cake_big.png" /> Democracy Sausage
                            </TitleContainer>
                        }
                        zDepth={0}
                    />

                    <div className="page-content">{content || this.props.children}</div>

                    {isResponsiveAndOverBreakPoint === false && (
                        <Paper zDepth={1} className="page-footer">
                            <BottomNavigation selectedIndex={bottomNavSelectedIndex}>
                                <BottomNavigationItem label="Map" icon={<MapsMap />} onClick={() => browserHistory.push("/")} />
                                <BottomNavigationItem label="Find" icon={<ActionSearch />} onClick={() => browserHistory.push("/search")} />
                                <BottomNavigationItem
                                    label="Add Stall"
                                    icon={<MapsAddLocation />}
                                    onClick={() => browserHistory.push("/add-stall")}
                                />
                            </BottomNavigation>
                        </Paper>
                    )}
                </BodyContainer>

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
