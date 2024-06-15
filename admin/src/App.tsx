/* eslint-disable-next-line max-classes-per-file */
import { BodyContainer, ResponsiveAppBar, ResponsiveDrawer } from 'material-ui-responsive-drawer'
import Badge from 'material-ui/Badge'
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation'
import Divider from 'material-ui/Divider'
import FlatButton from 'material-ui/FlatButton'
import LinearProgress from 'material-ui/LinearProgress'
import { List, ListItem } from 'material-ui/List'
import Paper from 'material-ui/Paper'
import Snackbar from 'material-ui/Snackbar'
import { ToolbarGroup } from 'material-ui/Toolbar'
import {
  ActionFace,
  ActionGrade,
  ActionOpenInNew,
  ContentDrafts,
  ContentInbox,
  ContentSend,
  ToggleStar,
} from 'material-ui/svg-icons'
import * as React from 'react'
import { Link, browserHistory } from 'react-router'
import styled, { AnyStyledComponent } from 'styled-components'
import './App.css'
import { IModule as IAppModule } from './redux/modules/app'
import { IElection } from './redux/modules/elections'
import { IModule as ISnackbarsModule } from './redux/modules/snackbars'
import { IUser } from './redux/modules/user'

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

const HeaderBarButton = styled(FlatButton as unknown as AnyStyledComponent)`
  color: #ffffff !important;
  margin: 4px 0px !important;
`

const BottomNavBadgeWithIcon = styled(Badge as unknown as AnyStyledComponent)`
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore-next-line
      rest.style! = { color: muiThemePalette.accent1Color }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore-next-line
      rest.leftIcon! = React.cloneElement(rest.leftIcon, { color: muiThemePalette.accent1Color })
    }
    return <ListItem {...rest} />
  }
}

interface IProps {
  children: React.ReactNode;
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

    let bottomNavSelectedIndex = -1
    if (locationPathName === '/elections') {
      bottomNavSelectedIndex = 0
    } else if (locationPathName === '/stalls') {
      bottomNavSelectedIndex = 1
    } else if (locationPathName === `/election/${currentElection.id}/polling_places/`) {
      bottomNavSelectedIndex = 2
    }

    const styles: any /* React.CSSProperties */ = {
      linearProgressStyle: {
        position: 'fixed',
        top: '0px',
        zIndex: 1200,
        display: app.requestsInProgress > 0 ? 'block' : 'none',
      },
    }

    const appBarProps: any = {}
    if (isResponsiveAndOverBreakPoint === true && user !== null) {
      appBarProps.iconElementRight = (
        <ToolbarGroup>
          <HeaderBarButton label={user.email} icon={<ActionFace color="white" />} disabled={true} />
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
              containerElement={<Link to="/" />}
              locationPathName={locationPathName}
              muiThemePalette={muiThemePalette}
              onClick={onClickDrawerLink}
            />

            {isResponsiveAndOverBreakPoint === true && (
              <div>
                <MenuListItem
                  primaryText="Pending Stalls"
                  leftIcon={<ContentSend />}
                  rightIcon={
                    pendingStallCount > 0 ? <Badge badgeContent={pendingStallCount} secondary={true} /> : undefined
                  }
                  containerElement={<Link to="/stalls" />}
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
                <MenuListItem
                  primaryText="Election Management"
                  leftIcon={<ContentInbox />}
                  containerElement={<Link to="/elections" />}
                  locationPathName={locationPathName}
                  muiThemePalette={muiThemePalette}
                  onClick={onClickDrawerLink}
                />
              </div>
            )}
            <MenuListItem
              primaryText="Favourited Polling Places"
              leftIcon={<ToggleStar />}
              containerElement={<Link to={`/election/${currentElection.id}/favourited_polling_places`} />}
              locationPathName={locationPathName}
              muiThemePalette={muiThemePalette}
              onClick={onClickDrawerLink}
            />
            <MenuListItem
              primaryText="Edit Polling Place Types"
              leftIcon={<ContentDrafts />}
              containerElement={<Link to={`/election/${currentElection.id}/polling_place_types`} />}
              locationPathName={locationPathName}
              muiThemePalette={muiThemePalette}
              onClick={onClickDrawerLink}
            />
            <ListItem
              primaryText="democracysausage.org"
              leftIcon={<ActionOpenInNew />}
              // eslint-disable-next-line
              containerElement={<a href={'https://democracysausage.org'} target="_blank" />}
            />

            {isResponsiveAndOverBreakPoint === false && user !== null && <Divider />}
            {isResponsiveAndOverBreakPoint === false && user !== null && (
              <ListItem primaryText={user.email} leftIcon={<ActionFace />} disabled={true} />
            )}
          </List>
        </ResponsiveDrawer>

        <BodyContainer breakPoint={defaultBreakPoint}>
          <LinearProgress
            mode="indeterminate"
            color={muiThemePalette.accent3Color}
            style={styles.linearProgressStyle}
          />

          <ResponsiveAppBar
            breakPoint={defaultBreakPoint}
            title={
              <TitleContainer>
                <TitleLogo src="/icons/sausage+cake_big.png" /> Admin Console
              </TitleContainer>
            }
            {...appBarProps}
            zDepth={1}
          />

          <div className="page-content">{content || this.props.children}</div>

          {isResponsiveAndOverBreakPoint === false && (
            <Paper zDepth={1} className="page-footer">
              <BottomNavigation selectedIndex={bottomNavSelectedIndex}>
                <BottomNavigationItem
                  label="Elections"
                  icon={<ContentInbox />}
                  onClick={() => browserHistory.push('/elections')}
                />
                <BottomNavigationItem
                  label="Pending Stalls"
                  icon={
                    pendingStallCount > 0 ? (
                      <BottomNavBadgeWithIcon badgeContent={pendingStallCount} secondary={true}>
                        <ContentSend />
                      </BottomNavBadgeWithIcon>
                    ) : (
                      <ContentSend />
                    )
                  }
                  onClick={() => browserHistory.push('/stalls')}
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
          onActionClick={() => {
            if ('onActionClick' in snackbars.active) {
              snackbars.active.onActionClick!()
            }
          }}
          onRequestClose={handleSnackbarClose}
        />
      </div>
    )
  }
}

export default App
