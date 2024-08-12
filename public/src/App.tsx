/* eslint-disable max-classes-per-file */
import { AppBar } from 'material-ui';
import { BodyContainer, ResponsiveAppBar, ResponsiveDrawer } from 'material-ui-responsive-drawer';
import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation';
import Divider from 'material-ui/Divider';
import LinearProgress from 'material-ui/LinearProgress';
import { List, ListItem } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import Snackbar from 'material-ui/Snackbar';
import Subheader from 'material-ui/Subheader';
import {
	ActionCode,
	ActionInfo,
	ActionSearch,
	ActionStore,
	CommunicationEmail,
	EditorInsertChart,
	HardwareTv,
	MapsAddLocation,
	MapsLayers,
	SocialPublic,
} from 'material-ui/svg-icons';
import * as React from 'react';
import { browserHistory, Link } from 'react-router';
import styled from 'styled-components';
import './App.css';
import ElectionAppBarContainer from './elections/ElectionAppBar/ElectionAppBarContainer';
import FacebookIcon from './icons/fontawesome/facebook';
import InstagramIcon from './icons/fontawesome/instagram';
import TwitterIcon from './icons/fontawesome/twitter';
import { getBaseURL, IModule as IAppModule } from './redux/modules/app';
import { getURLSafeElectionName, IElection } from './redux/modules/elections';
import { IModule as ISnackbarsModule } from './redux/modules/snackbars';

const PageContainer = styled.div`
	font-family: 'Roboto', sans-serif;
	height: 100%;
	margin: 0px;
	padding: 0px;
`;

const TitleContainer = styled.div`
	display: flex;
	align-items: center;
	font-size: 20px !important;
`;

const TitleLogo = styled.img`
	height: 32px;
	margin-right: 10px;
`;

const UnstyledAnchor = styled.a`
	text-decoration: none;
	color: inherit;
`;

class MenuListItem extends React.Component<any, any> {
	render(): any {
		const { muiThemePalette, locationPathName, locationPathNameMatch, contentMuiName, ...rest } = this.props;

		// Ugh - For making /, /<election-1-name>, /<election-2-name> URLs match properly
		if (
			(locationPathNameMatch === '/' && contentMuiName === 'SausageMapContainer') ||
			(locationPathNameMatch === '/search' && contentMuiName === 'PollingPlaceFinderContainer') ||
			(locationPathNameMatch === '/sausagelytics' && contentMuiName === 'SausagelyticsContainer')
		) {
			// 🤦‍♂️
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			rest.style = { color: muiThemePalette.accent1Color };
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			rest.leftIcon = React.cloneElement(rest.leftIcon, { color: muiThemePalette.accent1Color });
		} else if (locationPathNameMatch === locationPathName) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			rest.style = { color: muiThemePalette.accent1Color };
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			rest.leftIcon = React.cloneElement(rest.leftIcon, { color: muiThemePalette.accent1Color });
		}
		return <ListItem {...rest} />;
	}
}

interface IProps {
	children: React.ReactNode;
	muiThemePalette: any;
	app: IAppModule;
	snackbars: ISnackbarsModule;
	elections: Array<IElection>;
	currentElection: IElection;
	defaultBreakPoint: string;
	showElectionAppBar: boolean;
	showFooterNavBar: boolean;
	isResponsiveAndOverBreakPoint: boolean;
	handleSnackbarClose: any;
	onOpenDrawer: any;
	onClickDrawerLink: any;
	onClickOutboundDrawerLink: any;
	locationPathName: string;
	content: any;
}

class App extends React.Component<IProps, {}> {
	render() {
		const {
			muiThemePalette,
			app,
			snackbars,
			currentElection,
			defaultBreakPoint,
			showElectionAppBar,
			showFooterNavBar,
			isResponsiveAndOverBreakPoint,
			handleSnackbarClose,
			onOpenDrawer,
			onClickDrawerLink,
			onClickOutboundDrawerLink,
			locationPathName,
			content,
		} = this.props;

		// Ugh - For making /, /<election-1-name>, /<election-2-name> all match
		let bottomNavSelectedIndex = -1;
		if (content.type.muiName === 'SausageMapContainer') {
			bottomNavSelectedIndex = 0;
		} else if (content.type.muiName === 'PollingPlaceFinderContainer') {
			bottomNavSelectedIndex = 1;
		} else if (locationPathName === '/add-stall') {
			bottomNavSelectedIndex = 2;
		} else if (content.type.muiName === 'SausagelyticsContainer') {
			bottomNavSelectedIndex = 3;
		}

		const styles: any /* React.CSSProperties */ = {
			linearProgressStyle: {
				position: 'fixed',
				top: '0px',
				zIndex: 1200,
				display: app.requestsInProgress > 0 ? 'block' : 'none',
			},
			bodyContainerStyle: { display: 'flex', flexDirection: 'column', height: '100%' },
		};

		if (app.embedded_map === true) {
			styles.bodyContainerStyle.inset = '0px';
		}

		return (
			<PageContainer>
				{app.embedded_map === false && (
					<ResponsiveDrawer breakPoint={defaultBreakPoint}>
						{isResponsiveAndOverBreakPoint === true && (
							<List>
								<MenuListItem
									primaryText="Map"
									leftIcon={<SocialPublic />}
									containerElement={<Link to={`/${getURLSafeElectionName(currentElection)}`} />}
									locationPathName={locationPathName}
									locationPathNameMatch="/"
									muiThemePalette={muiThemePalette}
									contentMuiName={content.type.muiName}
								/>
								<MenuListItem
									primaryText="Find"
									leftIcon={<ActionSearch />}
									containerElement={<Link to={`/search/${getURLSafeElectionName(currentElection)}`} />}
									locationPathName={locationPathName}
									locationPathNameMatch="/search"
									muiThemePalette={muiThemePalette}
									contentMuiName={content.type.muiName}
								/>
								<MenuListItem
									primaryText="Add Stall"
									leftIcon={<MapsAddLocation />}
									containerElement={<Link to="/add-stall" />}
									locationPathName={locationPathName}
									locationPathNameMatch="/add-stall"
									muiThemePalette={muiThemePalette}
									contentMuiName={content.type.muiName}
								/>
							</List>
						)}

						{isResponsiveAndOverBreakPoint === true && <Divider />}

						<List>
							{isResponsiveAndOverBreakPoint === false && (
								<React.Fragment>
									<MenuListItem
										primaryText="Map"
										leftIcon={<SocialPublic />}
										containerElement={<Link to={`/${getURLSafeElectionName(currentElection)}`} />}
										onClick={onClickDrawerLink}
										locationPathName={locationPathName}
										locationPathNameMatch="/"
										muiThemePalette={muiThemePalette}
										contentMuiName={content.type.muiName}
									/>
									<MenuListItem
										primaryText="Add Stall"
										leftIcon={<MapsAddLocation />}
										containerElement={<Link to="/add-stall" />}
										onClick={onClickDrawerLink}
										locationPathName={locationPathName}
										locationPathNameMatch="/add-stall"
										muiThemePalette={muiThemePalette}
									/>
								</React.Fragment>
							)}
							<MenuListItem
								primaryText="Elections"
								leftIcon={<MapsLayers />}
								containerElement={<Link to="/elections" />}
								onClick={onClickDrawerLink}
								locationPathName={locationPathName}
								locationPathNameMatch="/elections"
								muiThemePalette={muiThemePalette}
							/>
							<MenuListItem
								primaryText="Stats"
								leftIcon={<EditorInsertChart />}
								containerElement={<Link to={`/sausagelytics/${getURLSafeElectionName(currentElection)}`} />}
								onClick={onClickDrawerLink}
								locationPathName={locationPathName}
								locationPathNameMatch="/sausagelytics"
								muiThemePalette={muiThemePalette}
								contentMuiName={content.type.muiName}
							/>
							<MenuListItem
								primaryText="Embed the map"
								leftIcon={<ActionCode />}
								containerElement={<Link to="/embed-builder" />}
								onClick={onClickDrawerLink}
								locationPathName={locationPathName}
								locationPathNameMatch="/embed-builder"
								muiThemePalette={muiThemePalette}
							/>
							<MenuListItem
								primaryText="FAQs and About Us"
								leftIcon={<ActionInfo />}
								containerElement={<Link to="/about" />}
								onClick={onClickDrawerLink}
								locationPathName={locationPathName}
								locationPathNameMatch="/about"
								muiThemePalette={muiThemePalette}
							/>
							<MenuListItem
								primaryText="Media"
								leftIcon={<HardwareTv />}
								containerElement={<Link to="/media" />}
								onClick={onClickDrawerLink}
								locationPathName={locationPathName}
								locationPathNameMatch="/media"
								muiThemePalette={muiThemePalette}
							/>
							<ListItem
								primaryText="Redbubble Store"
								leftIcon={<ActionStore />}
								onClick={(e: React.MouseEvent<HTMLElement>) => onClickOutboundDrawerLink(e, 'Redbubble Store')}
								// eslint-disable-next-line
								containerElement={<a href={'https://www.redbubble.com/people/demsausage/shop'} />}
							/>
						</List>
						<Divider />
						<List>
							<Subheader>Contact Us</Subheader>
							<ListItem
								primaryText="Email"
								leftIcon={<CommunicationEmail />}
								onClick={(e: React.MouseEvent<HTMLElement>) => onClickOutboundDrawerLink(e, 'Email')}
								// eslint-disable-next-line
								containerElement={<a href={'mailto:ausdemocracysausage@gmail.com'} />}
							/>
							<ListItem
								primaryText="Twitter"
								leftIcon={<TwitterIcon />}
								onClick={(e: React.MouseEvent<HTMLElement>) => onClickOutboundDrawerLink(e, 'Twitter')}
								// eslint-disable-next-line
								containerElement={<a href={'https://twitter.com/DemSausage'} />}
							/>
							<ListItem
								primaryText="Facebook"
								leftIcon={<FacebookIcon />}
								onClick={(e: React.MouseEvent<HTMLElement>) => onClickOutboundDrawerLink(e, 'Facebook')}
								// eslint-disable-next-line
								containerElement={<a href={'https://www.facebook.com/AusDemocracySausage'} />}
							/>
							<ListItem
								primaryText="Instagram"
								leftIcon={<InstagramIcon />}
								onClick={(e: React.MouseEvent<HTMLElement>) => onClickOutboundDrawerLink(e, 'Instagram')}
								// eslint-disable-next-line
								containerElement={<a href={'https://www.instagram.com/ausdemocracysausage/'} />}
							/>
						</List>
					</ResponsiveDrawer>
				)}

				{/* <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ backgroundColor: "purple" }}>Header</div>
                    <div style={{ backgroundColor: "green" }}>AppBar</div>
                    <div className="page-content" style={{ backgroundColor: "orange" }}>
                        Map & Content
                    </div>
                    <div style={{ backgroundColor: "blue" }}>Footer</div>
                </div> */}

				<BodyContainer breakPoint={defaultBreakPoint} style={styles.bodyContainerStyle}>
					<LinearProgress
						mode="indeterminate"
						color={muiThemePalette.accent3Color}
						style={styles.linearProgressStyle}
					/>

					{app.embedded_map === false && (
						<ResponsiveAppBar
							breakPoint={defaultBreakPoint}
							onLeftIconButtonClick={onOpenDrawer}
							title={
								<TitleContainer>
									<TitleLogo src="/icons/sausage+cake_big.png" /> Democracy Sausage
								</TitleContainer>
							}
							zDepth={0}
							style={{
								position: 'relative',
								left: isResponsiveAndOverBreakPoint === true ? '0px !important' : undefined,
							}}
						/>
					)}

					{app.embedded_map === true && (
						<AppBar
							title={
								<TitleContainer>
									<TitleLogo src="/icons/sausage+cake_big.png" />{' '}
									<UnstyledAnchor href={`${getBaseURL()}`} target="_parent">
										Democracy Sausage
									</UnstyledAnchor>
								</TitleContainer>
							}
							showMenuIconButton={false}
							zDepth={0}
							style={{
								position: 'fixed',
								bottom: 0,
								width: '100%',
							}}
						/>
					)}

					{showElectionAppBar === true && app.embedded_map === false && (
						<ElectionAppBarContainer
							isResponsiveAndOverBreakPoint={isResponsiveAndOverBreakPoint}
							pageTitle={content.type.pageTitle}
							pageBaseURL={content.type.pageBaseURL}
						/>
					)}

					<div className="page-content">{content || this.props.children}</div>

					{isResponsiveAndOverBreakPoint === false && showFooterNavBar === true && (
						<Paper zDepth={1} className="page-footer">
							<BottomNavigation selectedIndex={bottomNavSelectedIndex}>
								<BottomNavigationItem
									label="Map"
									icon={<SocialPublic />}
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
									onClick={() => browserHistory.push('/add-stall')}
								/>
								<BottomNavigationItem
									label="Stats"
									icon={<EditorInsertChart />}
									onClick={() => browserHistory.push(`/sausagelytics/${getURLSafeElectionName(currentElection)}`)}
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
							snackbars.active.onActionClick!();
						}
					}}
					onRequestClose={handleSnackbarClose}
					/* Support multi-line Snackbars */
					bodyStyle={{ height: 'auto', lineHeight: '22px', padding: 24, whiteSpace: 'pre-line' }}
				/>
			</PageContainer>
		);
	}
}

export default App;
