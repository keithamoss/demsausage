import { BodyContainer, ResponsiveAppBar, ResponsiveDrawer } from "material-ui-responsive-drawer"
import { BottomNavigation, BottomNavigationItem } from "material-ui/BottomNavigation"
import Divider from "material-ui/Divider"
import LinearProgress from "material-ui/LinearProgress"
import { List, ListItem } from "material-ui/List"
import Paper from "material-ui/Paper"
import Snackbar from "material-ui/Snackbar"
import Subheader from "material-ui/Subheader"
import { ActionInfo, ActionSearch, ActionStore, CommunicationEmail, HardwareTv, MapsAddLocation, MapsMap } from "material-ui/svg-icons"
import * as React from "react"
import { browserHistory, Link } from "react-router"
import styled from "styled-components"
import "./App.css"
import ElectionChooserContainer from "./elections/ElectionChooser/ElectionChooserContainer"
import FacebookIcon from "./icons/fontawesome/facebook"
import TwitterIcon from "./icons/fontawesome/twitter"
import { IModule as IAppModule } from "./redux/modules/app"
import { getURLSafeElectionName, IElection } from "./redux/modules/elections"
import { IModule as ISnackbarsModule } from "./redux/modules/snackbars"

// const logo = require("./logo.svg")

const TitleContainer = styled.div`
    display: flex;
    align-items: center;
    font-size: 20px !important;
`

const TitleLogo = styled.img`
    height: 32px;
    margin-right: 10px;
`

class MenuListItem extends React.Component<any, any> {
    render(): any {
        const { muiThemePalette, locationPathName, locationPathNameMatch, contentMuiName, ...rest } = this.props

        // Ugh - For making /, /<election-1-name>, /<election-2-name> all match
        if (
            (locationPathNameMatch === "/" && contentMuiName === "SausageMapContainer") ||
            (locationPathNameMatch === "/search" && contentMuiName === "PollingPlaceFinderContainer")
        ) {
            // @ts-ignore
            rest.style = { color: muiThemePalette.accent1Color }
            // @ts-ignore
            rest.leftIcon = React.cloneElement(rest.leftIcon, { color: muiThemePalette.accent1Color })
        } else if (locationPathNameMatch === locationPathName) {
            // @ts-ignore
            rest.style = { color: muiThemePalette.accent1Color }
            // @ts-ignore
            rest.leftIcon = React.cloneElement(rest.leftIcon, { color: muiThemePalette.accent1Color })
        }
        return <ListItem {...rest} />
    }
}

export interface IProps {
    muiThemePalette: any
    app: IAppModule
    snackbars: ISnackbarsModule
    elections: Array<IElection>
    currentElection: IElection
    defaultBreakPoint: string
    isResponsiveAndOverBreakPoint: boolean
    handleSnackbarClose: any
    onOpenDrawer: any
    onClickDrawerLink: any
    onClickOutboundDrawerLink: any
    locationPathName: string
    content: any
}

class App extends React.Component<IProps, {}> {
    render() {
        const {
            muiThemePalette,
            app,
            snackbars,
            currentElection,
            defaultBreakPoint,
            isResponsiveAndOverBreakPoint,
            handleSnackbarClose,
            onOpenDrawer,
            onClickDrawerLink,
            onClickOutboundDrawerLink,
            locationPathName,
            content,
        } = this.props

        // Ugh - For making /, /<election-1-name>, /<election-2-name> all match
        let bottomNavSelectedIndex: number = -1
        if (content.type.muiName === "SausageMapContainer") {
            bottomNavSelectedIndex = 0
        } else if (content.type.muiName === "PollingPlaceFinderContainer") {
            bottomNavSelectedIndex = 1
        } else if (locationPathName === "/add-stall") {
            bottomNavSelectedIndex = 2
        }

        const styles: any /*React.CSSProperties*/ = {
            linearProgressStyle: {
                position: "fixed",
                top: "0px",
                zIndex: 1200,
                display: app.requestsInProgress > 0 ? "block" : "none",
            },
        }

        const showElectionChooser = "pageTitle" in content.type && "pageBaseURL" in content.type

        return (
            <div className="page">
                <ResponsiveDrawer breakPoint={defaultBreakPoint}>
                    {isResponsiveAndOverBreakPoint === true && (
                        <List>
                            <MenuListItem
                                primaryText="Map"
                                leftIcon={<MapsMap />}
                                containerElement={<Link to={`/${getURLSafeElectionName(currentElection)}`} />}
                                locationPathName={locationPathName}
                                locationPathNameMatch={"/"}
                                muiThemePalette={muiThemePalette}
                                contentMuiName={content.type.muiName}
                            />
                            <MenuListItem
                                primaryText="Find"
                                leftIcon={<ActionSearch />}
                                containerElement={<Link to={`/search/${getURLSafeElectionName(currentElection)}`} />}
                                locationPathName={locationPathName}
                                locationPathNameMatch={"/search"}
                                muiThemePalette={muiThemePalette}
                                contentMuiName={content.type.muiName}
                            />
                            <MenuListItem
                                primaryText="Add Stall"
                                leftIcon={<MapsAddLocation />}
                                containerElement={<Link to={`/add-stall`} />}
                                locationPathName={locationPathName}
                                locationPathNameMatch={"/add-stall"}
                                muiThemePalette={muiThemePalette}
                            />
                            {/* <MenuListItem
                                primaryText="Sausagelytics"
                                leftIcon={<EditorInsertChart />}
                                containerElement={<Link to={`/sausagelytics/${getURLSafeElectionName(currentElection)}`} />}
                                locationPathName={locationPathName}
                                locationPathNameMatch={"/sausagelytics"}
                                muiThemePalette={muiThemePalette}
                            /> */}
                        </List>
                    )}
                    {isResponsiveAndOverBreakPoint === true && <Divider />}
                    <List>
                        <MenuListItem
                            primaryText="About Us"
                            leftIcon={<ActionInfo />}
                            containerElement={<Link to={`/about`} />}
                            onClick={onClickDrawerLink}
                            locationPathName={locationPathName}
                            locationPathNameMatch={"/about"}
                            muiThemePalette={muiThemePalette}
                        />
                        <MenuListItem
                            primaryText="Media"
                            leftIcon={<HardwareTv />}
                            containerElement={<Link to={`/media`} />}
                            onClick={onClickDrawerLink}
                            locationPathName={locationPathName}
                            locationPathNameMatch={"/media"}
                            muiThemePalette={muiThemePalette}
                        />
                        <ListItem
                            primaryText="Redbubble Store"
                            leftIcon={<ActionStore />}
                            onClick={(e: React.MouseEvent<HTMLElement>) => onClickOutboundDrawerLink(e, "Redbubble Store")}
                            containerElement={<a href={"https://www.redbubble.com/people/demsausage/shop"} />}
                        />
                    </List>
                    <Divider />
                    <List>
                        <Subheader>Contact Us</Subheader>
                        <ListItem
                            primaryText="Email"
                            leftIcon={<CommunicationEmail />}
                            onClick={(e: React.MouseEvent<HTMLElement>) => onClickOutboundDrawerLink(e, "Email")}
                            containerElement={<a href={"mailto:ausdemocracysausage@gmail.com"} />}
                        />
                        <ListItem
                            primaryText="Twitter"
                            leftIcon={<TwitterIcon />}
                            onClick={(e: React.MouseEvent<HTMLElement>) => onClickOutboundDrawerLink(e, "Twitter")}
                            containerElement={<a href={"https://twitter.com/DemSausage"} />}
                        />
                        <ListItem
                            primaryText="Facebook"
                            leftIcon={<FacebookIcon />}
                            onClick={(e: React.MouseEvent<HTMLElement>) => onClickOutboundDrawerLink(e, "Facebook")}
                            containerElement={<a href={"https://www.facebook.com/AusDemocracySausage"} />}
                        />
                    </List>
                </ResponsiveDrawer>

                <BodyContainer breakPoint={defaultBreakPoint}>
                    <LinearProgress mode="indeterminate" color={muiThemePalette.accent3Color} style={styles.linearProgressStyle} />

                    <ResponsiveAppBar
                        breakPoint={defaultBreakPoint}
                        onLeftIconButtonClick={onOpenDrawer}
                        title={
                            <TitleContainer>
                                <TitleLogo src="/icons/sausage+cake_big.png" /> Democracy Sausage
                            </TitleContainer>
                        }
                        zDepth={0}
                    />

                    {showElectionChooser === true && (
                        <ElectionChooserContainer pageTitle={content.type.pageTitle} pageBaseURL={content.type.pageBaseURL} />
                    )}

                    <div className="page-content" style={{ marginTop: showElectionChooser === true ? "110px" : "60px" }}>
                        {content || this.props.children}
                    </div>

                    {isResponsiveAndOverBreakPoint === false && (
                        <Paper zDepth={1} className="page-footer">
                            <BottomNavigation selectedIndex={bottomNavSelectedIndex}>
                                <BottomNavigationItem
                                    label="Map"
                                    icon={<MapsMap />}
                                    onClick={() => browserHistory.push(`/${getURLSafeElectionName(currentElection)}`)}
                                />
                                <BottomNavigationItem
                                    label="Find"
                                    icon={<ActionSearch />}
                                    onClick={() => browserHistory.push(`/search/${getURLSafeElectionName(currentElection)}`)}
                                />
                                <BottomNavigationItem
                                    label="Add Stall"
                                    icon={<MapsAddLocation />}
                                    onClick={() => browserHistory.push("/add-stall")}
                                />
                                {/* <BottomNavigationItem
                                    label="Sausagelytics"
                                    icon={<EditorInsertChart />}
                                    onClick={() => browserHistory.push(`/sausagelytics/${getURLSafeElectionName(currentElection)}`)}
                                /> */}
                            </BottomNavigation>
                        </Paper>
                    )}
                </BodyContainer>

                <Snackbar
                    open={snackbars.open}
                    message={snackbars.active.message}
                    action={snackbars.active.action}
                    autoHideDuration={snackbars.active.autoHideDuration}
                    onActionClick={() => {
                        if ("onActionClick" in snackbars.active) {
                            snackbars.active.onActionClick!()
                        }
                    }}
                    onRequestClose={handleSnackbarClose}
                    /* Support multi-line Snackbars */
                    bodyStyle={{ height: "auto", lineHeight: "22px", padding: 24, whiteSpace: "pre-line" }}
                />
            </div>
        )
    }
}

export default App
