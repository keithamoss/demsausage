import * as React from "react"
import styled from "styled-components"
import { Link, browserHistory } from "react-router"
import { LoginDialog } from "./authentication/login-dialog/LoginDialog"
import { IAppModule, ISnackbarsModule, IElection, IUser } from "./redux/modules/interfaces"
import "./App.css"

import { ResponsiveDrawer, BodyContainer, ResponsiveAppBar } from "material-ui-responsive-drawer"

import { BottomNavigation, BottomNavigationItem } from "material-ui/BottomNavigation"
import Paper from "material-ui/Paper"
import { List, ListItem } from "material-ui/List"
import Badge from "material-ui/Badge"
import Divider from "material-ui/Divider"

import { ToolbarGroup } from "material-ui/Toolbar"
import Snackbar from "material-ui/Snackbar"
import LinearProgress from "material-ui/LinearProgress"
import FlatButton from "material-ui/FlatButton"
import { ContentInbox, ActionGrade, ContentSend, ContentDrafts, ActionFace } from "material-ui/svg-icons"

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

const HeaderBarButton = styled(FlatButton)`
    color: #ffffff !important;
    margin: 4px 0px !important;
`

const BottomNavBadgeWithIcon = styled(Badge)`
    padding: 0px !important;
    width: auto !important;

    & svg {
        width: 100% !important;
        fill: ${(props: any) => props.color} !important;
    }

    & span {
        top: -4px !important;
        right: 28% !important;
        font-size: 10px !important;
        width: 18px !important;
        height: 18px !important;
    }
`

class MenuListItem extends React.Component<any, any> {
    render(): any {
        const { locationPathName, muiThemePalette, ...rest } = this.props

        if (locationPathName === rest.containerElement.props.to) {
            rest.style! = { color: muiThemePalette.accent1Color }
            rest.leftIcon! = React.cloneElement(rest.leftIcon, { color: muiThemePalette.accent1Color })
        }
        return <ListItem {...rest} />
    }
}

export interface IProps {
    muiThemePalette: any
    app: IAppModule
    user: IUser
    snackbars: ISnackbarsModule
    currentElection: IElection
    pendingStallCount: number
    defaultBreakPoint: string
    isResponsiveAndOverBreakPoint: boolean
    handleSnackbarClose: any
    content: any
    onClickDrawerLink: any
    locationPathName: string
}

class App extends React.Component<IProps, {}> {
    render() {
        const {
            muiThemePalette,
            app,
            user,
            snackbars,
            currentElection,
            pendingStallCount,
            defaultBreakPoint,
            isResponsiveAndOverBreakPoint,
            handleSnackbarClose,
            content,
            onClickDrawerLink,
            locationPathName,
        } = this.props

        let bottomNavSelectedIndex: number = -1
        if (locationPathName === "/") {
            bottomNavSelectedIndex = 0
        } else if (locationPathName === "/stalls") {
            bottomNavSelectedIndex = 1
        } else if (locationPathName === `/election/${currentElection.id}/polling_places/`) {
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

        let appBarProps: any = {}
        if (isResponsiveAndOverBreakPoint === true && user !== null) {
            appBarProps.iconElementRight = (
                <ToolbarGroup>
                    <HeaderBarButton label={user.email} icon={<ActionFace color={"white"} />} disabled={true} />
                </ToolbarGroup>
            )
        }

        return (
            <div className="page">
                <ResponsiveDrawer breakPoint={defaultBreakPoint} zDepth={1}>
                    <List>
                        <MenuListItem
                            primaryText="Home"
                            leftIcon={<ContentDrafts />}
                            containerElement={<Link to={"/"} />}
                            locationPathName={locationPathName}
                            muiThemePalette={muiThemePalette}
                            onClick={onClickDrawerLink}
                        />

                        {isResponsiveAndOverBreakPoint === true && (
                            <div>
                                <MenuListItem
                                    primaryText="Pending Stalls"
                                    leftIcon={<ContentSend />}
                                    rightIcon={<Badge badgeContent={pendingStallCount} secondary={true} />}
                                    containerElement={<Link to={`/stalls`} />}
                                    locationPathName={locationPathName}
                                    muiThemePalette={muiThemePalette}
                                    onClick={onClickDrawerLink}
                                />
                                <MenuListItem
                                    primaryText="Edit Polling Places"
                                    leftIcon={<ActionGrade />}
                                    containerElement={<Link to={`/election/${currentElection.id}/polling_places/`} />}
                                    locationPathName={locationPathName}
                                    muiThemePalette={muiThemePalette}
                                    onClick={onClickDrawerLink}
                                />
                            </div>
                        )}

                        <MenuListItem
                            primaryText="Edit Polling Place Types"
                            leftIcon={<ContentDrafts />}
                            containerElement={<Link to={`/election/${currentElection.id}/polling_place_types`} />}
                            locationPathName={locationPathName}
                            muiThemePalette={muiThemePalette}
                            onClick={onClickDrawerLink}
                        />
                        <MenuListItem
                            primaryText="Election Management"
                            leftIcon={<ContentInbox />}
                            containerElement={<Link to={`/elections`} />}
                            locationPathName={locationPathName}
                            muiThemePalette={muiThemePalette}
                            onClick={onClickDrawerLink}
                        />

                        {isResponsiveAndOverBreakPoint === false && user !== null && <Divider />}
                        {isResponsiveAndOverBreakPoint === false &&
                            user !== null && <ListItem primaryText={user.email} leftIcon={<ActionFace />} disabled={true} />}
                    </List>
                </ResponsiveDrawer>

                <BodyContainer breakPoint={defaultBreakPoint}>
                    <LinearProgress mode="indeterminate" color={muiThemePalette.accent3Color} style={styles.linearProgressStyle} />

                    <ResponsiveAppBar
                        breakPoint={defaultBreakPoint}
                        title={
                            <TitleContainer>
                                <TitleLogo src="/icons/sausage+cake_big.png" /> Democracy Sausage Admin Console
                            </TitleContainer>
                        }
                        {...appBarProps}
                        zDepth={1}
                    />

                    <LoginDialog open={user === null} />

                    <div className="page-content">{content || this.props.children}</div>

                    {isResponsiveAndOverBreakPoint === false && (
                        <Paper zDepth={1} className="page-footer">
                            <BottomNavigation selectedIndex={bottomNavSelectedIndex}>
                                <BottomNavigationItem
                                    label="Elections"
                                    icon={<ContentInbox />}
                                    onClick={() => browserHistory.push("/elections")}
                                />
                                <BottomNavigationItem
                                    label="Pending Stalls"
                                    icon={
                                        <BottomNavBadgeWithIcon badgeContent={pendingStallCount} secondary={true}>
                                            <ContentSend />
                                        </BottomNavBadgeWithIcon>
                                        // tslint:disable-next-line:jsx-curly-spacing
                                    }
                                    onClick={() => browserHistory.push("/stalls")}
                                />
                                <BottomNavigationItem
                                    label="Polling Places"
                                    icon={<ActionGrade />}
                                    onClick={() => browserHistory.push(`/election/${currentElection.id}/polling_places/`)}
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
