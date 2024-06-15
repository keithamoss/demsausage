import { Dialog, FloatingActionButton, IconButton, Toolbar, ToolbarGroup, ToolbarSeparator } from 'material-ui';
import FullscreenDialog from 'material-ui-fullscreen-dialog';
import SearchBar from 'material-ui-search-bar';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import { ListItem } from 'material-ui/List';
import { blue500, grey600 } from 'material-ui/styles/colors';
import {
	ActionInfo,
	ActionList,
	ActionSearch,
	DeviceLocationSearching,
	MapsAddLocation,
	MapsLocalHospital,
	MapsRestaurantMenu,
} from 'material-ui/svg-icons';
import * as React from 'react';
import GoogleMapLoader from 'react-google-maps-loader';
import { Link } from 'react-router';
import styled from 'styled-components';
import PollingPlaceCardMiniContainer from '../../finder/PollingPlaceCardMini/PollingPlaceCardMiniContainer';
import BaconandEggsIcon from '../../icons/bacon-and-eggs';
import CoffeeIcon from '../../icons/coffee';
import HalalIcon from '../../icons/halal';
import VegoIcon from '../../icons/vego';
import { IElection, getURLSafeElectionName } from '../../redux/modules/elections';
import { IMapFilterOptions, IMapSearchResults, isFilterEnabled } from '../../redux/modules/map';
import { IPollingPlace } from '../../redux/modules/polling_places';
import SausageLoader from '../../shared/loader/SausageLoader';
import OpenLayersMapContainer from '../OpenLayersMap/OpenLayersMapContainer';
// import "./SausageMap.css"

const FlexboxMapContainer = styled.div`
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
`;

const SearchBarContainer = styled.div`
	position: absolute;
	width: 85%;
	margin-top: 10px;
	margin-left: 7.5%;
	margin-right: 7.5%;
`;

const MapLoadingContainer = styled.div`
	position: absolute;
	height: calc(100% - 80px); /* Height of PollingPlaceFilterToolbar */
	width: 100%;
	margin: 0 auto;
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: auto;
`;

const MapLoaderBar = styled.div`
	height: 100px;
	width: 100%;
	background-color: rgba(103, 64, 180, 0.8);
`;

const AddStallFABContainer = styled.div`
	position: absolute;
	bottom: 16px;
	right: 16px;
`;

const ListSearchResultsFABContainer = styled.div`
	position: absolute;
	bottom: 88px;
	right: 16px;
`;

const PollingPlaceFilterToolbar = styled(Toolbar)`
	background-color: white !important;
`;

const PollingPlaceFilterToolbarGroup = styled(ToolbarGroup)`
	width: 100%;
	max-width: 300px;
`;

const PollingPlaceFilterToolbarSeparator = styled(ToolbarSeparator)`
	margin-left: 12px !important;
`;

const PollingPlaceCardWrapper = styled.div`
	padding: 10px;
`;

const COVIDSafeToolbar = styled(Toolbar)`
	background-color: white !important;
	padding-left: 12px !important;
`;

const COVIDSafeFlatButton = styled(FlatButton)`
	& span {
		text-transform: none !important;
	}
`;

interface IProps {
	currentElection: IElection;
	embeddedMap: boolean;
	waitingForGeolocation: boolean;
	queriedPollingPlaces: Array<IPollingPlace>;
	geolocationSupported: boolean;
	mapSearchResults: IMapSearchResults | null;
	mapFilterOptions: IMapFilterOptions;
	onQueryMap: Function;
	onCloseQueryMapDialog: any;
	onOpenFinderForAddressSearch: any;
	onOpenFinderForGeolocation: any;
	onClearMapSearch: any;
	onClickMapFilterOption: any;
}

interface IState {
	mapLoading: boolean | undefined;
	nt2020DialogOpen: boolean;
}

// Allows us to use the actual map search results, or to override it (a bit hackily) and use the `extent` parameter passed when a map is embedded
const getMapSearchResultsForEmbedding = (mapSearchResults: any) => {
	const searchParams = new URLSearchParams(window.location.search);
	if (searchParams.has('extent') === true && searchParams.get('extent') !== '') {
		return {
			extent: searchParams.get('extent')?.split(','),
			padding: false,
			animation: false,
		};
	}

	return mapSearchResults;
};

class SausageMap extends React.PureComponent<IProps, IState> {
	private onMapBeginLoading: Function;

	private onMapLoaded: Function;

	private onClickMapFilterOption: Function;

	private onCloseNT2020Dialog: any;

	constructor(props: IProps) {
		super(props);

		this.state = { mapLoading: undefined, nt2020DialogOpen: true };

		this.onMapBeginLoading = () => this.setState({ mapLoading: true });
		this.onMapLoaded = () => this.setState({ mapLoading: false });
		this.onClickMapFilterOption = (option: string) => (_event: React.MouseEvent<HTMLElement>) =>
			props.onClickMapFilterOption(option);
		this.onCloseNT2020Dialog = () => this.setState({ nt2020DialogOpen: false });
	}

	render() {
		const {
			currentElection,
			embeddedMap,
			waitingForGeolocation,
			queriedPollingPlaces,
			geolocationSupported,
			mapSearchResults,
			mapFilterOptions,
			onQueryMap,
			onCloseQueryMapDialog,
			onOpenFinderForAddressSearch,
			onOpenFinderForGeolocation,
			onClearMapSearch,
		} = this.props;
		const { mapLoading, nt2020DialogOpen } = this.state;

		return (
			<React.Fragment>
				<FlexboxMapContainer>
					<div className="openlayers-map-container">
						<OpenLayersMapContainer
							key={currentElection.id}
							election={currentElection}
							mapSearchResults={getMapSearchResultsForEmbedding(mapSearchResults)}
							mapFilterOptions={mapFilterOptions}
							onMapBeginLoading={this.onMapBeginLoading}
							onMapLoaded={this.onMapLoaded}
							onQueryMap={onQueryMap}
						/>

						{embeddedMap === false && (
							<AddStallFABContainer>
								<FloatingActionButton containerElement={<Link to="/add-stall" />}>
									<MapsAddLocation />
								</FloatingActionButton>
							</AddStallFABContainer>
						)}

						{embeddedMap === false && mapSearchResults !== null && (
							<ListSearchResultsFABContainer>
								<FloatingActionButton
									containerElement={<Link to={`/search/${getURLSafeElectionName(currentElection)}`} />}
								>
									<ActionList />
								</FloatingActionButton>
							</ListSearchResultsFABContainer>
						)}
					</div>

					{mapLoading === true && (
						<MapLoadingContainer className="map-loading">
							<MapLoaderBar>
								<SausageLoader />
							</MapLoaderBar>
						</MapLoadingContainer>
					)}

					{embeddedMap === false && (
						<SearchBarContainer>
							<GoogleMapLoader
								params={{
									key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
									libraries: 'places',
								}}
								render={(googleMaps: any) =>
									googleMaps && (
										<SearchBar
											hintText={
												waitingForGeolocation === false ? 'Search here or use GPS →' : 'Fetching your location...'
											}
											value={mapSearchResults !== null ? mapSearchResults.formattedAddress : undefined}
											onChange={(value: string) => {
												if (value === '') {
													onClearMapSearch();
												}
											}}
											onClick={onOpenFinderForAddressSearch}
											onRequestSearch={
												geolocationSupported === true ? onOpenFinderForGeolocation : onOpenFinderForAddressSearch
											}
											searchIcon={
												// eslint-disable-next-line no-nested-ternary
												geolocationSupported === true ? (
													waitingForGeolocation === false ? (
														<DeviceLocationSearching />
													) : (
														<DeviceLocationSearching className="spin" />
													)
												) : (
													<ActionSearch />
												)
											}
											style={{
												margin: '0 auto',
												maxWidth: 800,
											}}
										/>
									)
								}
							/>
						</SearchBarContainer>
					)}

					{embeddedMap === false && (
						<COVIDSafeToolbar>
							<ToolbarGroup firstChild={true}>
								<COVIDSafeFlatButton
									label="COVID safe voting"
									icon={<MapsLocalHospital color="red" />}
									containerElement={
										// eslint-disable-next-line
										<a href="https://aec.gov.au/election/covid19-safety-measures.htm" />
									}
								/>
							</ToolbarGroup>
						</COVIDSafeToolbar>
					)}

					{embeddedMap === false && (
						<PollingPlaceFilterToolbar>
							<PollingPlaceFilterToolbarGroup>
								<MapsRestaurantMenu color={grey600} />
								<PollingPlaceFilterToolbarSeparator />
								<IconButton onClick={this.onClickMapFilterOption('vego')}>
									<VegoIcon disabled={isFilterEnabled('vego', mapFilterOptions) !== true} />
								</IconButton>
								<IconButton onClick={this.onClickMapFilterOption('halal')}>
									<HalalIcon disabled={isFilterEnabled('halal', mapFilterOptions) !== true} />
								</IconButton>
								<IconButton onClick={this.onClickMapFilterOption('coffee')}>
									<CoffeeIcon disabled={isFilterEnabled('coffee', mapFilterOptions) !== true} />
								</IconButton>
								<IconButton onClick={this.onClickMapFilterOption('bacon_and_eggs')}>
									<BaconandEggsIcon disabled={isFilterEnabled('bacon_and_eggs', mapFilterOptions) !== true} />
								</IconButton>
							</PollingPlaceFilterToolbarGroup>
						</PollingPlaceFilterToolbar>
					)}
				</FlexboxMapContainer>

				{currentElection.name === 'Northern Territory Election 2020' && (
					<Dialog
						title="G'day Territorians"
						open={nt2020DialogOpen}
						onRequestClose={this.onCloseNT2020Dialog}
						autoScrollBodyContent={true}
						titleStyle={{
							// backgroundColor: "rgba(255, 255, 255, 1)",
							textAlign: 'left',
						}}
						// bodyStyle={{
						//   backgroundColor: "rgba(255, 255, 255, 0.75)",
						// }}
						// paperProps={{
						//   style: { backgroundColor: "rgba(255, 255, 255, 0)" },
						// }}
						contentStyle={{
							width: '60%',
							minWidth: '300px',
							maxWidth: 'none',
							// backgroundImage: "url(images/ntvotes_2020.png)",
							// backgroundSize: "50%",
							// backgroundRepeat: "no-repeat",
							// backgroundPosition: "center top 80px",
							textAlign: 'justify',
							color: 'rgb(0, 0, 0)',
						}}
					>
						<img
							src="images/media_release_demsausage_logo.png"
							alt="The Democracy Sausage logo in the style of the Australian coat of arms. A kangaroo and an emu are standing on either side of a BBQ."
							style={{
								width: '50%',
								minWidth: '150px',
								maxWidth: '250px',
								// textAlign: "center",
								display: 'block',
								margin: '0 auto',
							}}
						/>
						<h3 style={{ marginTop: 10, marginBottom: 0, textAlign: 'center' }}>DEMOCRACY SAUSAGE</h3>
						<h3 style={{ marginTop: 10, marginBottom: 0, textAlign: 'center' }}>MEDIA STATEMENT: 18 August 2020</h3>
						<br />

						<h3 style={{ marginTop: 10, marginBottom: 0, textAlign: 'center' }}>
							Supporting community fundraising during the Northern Territory election
						</h3>

						<p>
							The Northern Territory election on Saturday 22nd August 2020 will be the first major Australian election
							since the beginning of the COVID-19 pandemic, and one of several that will be held over the coming year.
						</p>

						<p>
							For those who need to vote in person, your local electoral commission’s priority will be to make the
							experience as fast and safe as possible, minimising the time voters spend at a polling place.
						</p>

						<p>
							Postal voting will reduce attendance at polling places, and in many locations, fundraising will be limited
							or prohibited.
						</p>

						<p>
							Election day sausage sizzles and bake sales have traditionally provided a welcome boost in funding for
							local schools and community groups - one that will be greatly missed this year.
						</p>

						<p>
							We encourage Northern Territorians who would normally buy a Democracy Sausage or cupcake to consider
							making a small donation, either to a local cause or one of the following registered charities:
						</p>

						<ul style={{ textAlign: 'left' }}>
							<li style={{ marginBottom: 10 }}>
								<strong>
									Katherine Isolated Children&apos;s Service: <a href="https://www.kics.org.au">Donate</a>
								</strong>
								<p>
									The Katherine Isolated Children’s Service provides play based learning opportunities for children and
									families who are socially and geographically isolated living on pastoral properties, in Indigenous
									communities, and in the small towns of Mataranka, Timber Creek and Elliott.
								</p>
							</li>
							<li style={{ marginBottom: 10 }}>
								<strong>
									Corrugated Iron Youth Arts: <a href="https://www.corrugatediron.org.au">Donate</a>
								</strong>
								<p>
									Corrugated Iron empowers young people through dynamic creative arts and is the premier youth arts
									organisation in the Top End of the Northern Territory. For more than 30 years, we have provided
									innovative and challenging performing arts experiences that express the diversity of young people
									living in the Northern Territory.
								</p>
							</li>
							<li style={{ marginBottom: 10 }}>
								<strong>
									Children’s Ground: <a href="https://childrensground.org.au">Donate</a>
								</strong>
								<p>
									Children’s Ground partners with whole communities. Every child born today should experience a lifetime
									of opportunity, entering adulthood strong in their identity and culture, connected to their local and
									global world, and economically independent. If all children can experience this basic right, then
									whole communities will enjoy wellbeing.
								</p>
							</li>
							<li style={{ marginBottom: 10 }}>
								<strong>
									Watarrka Foundation: <a href="http://www.watarrkafoundation.org.au">Donate</a>
								</strong>
								<p>
									The Watarrka Foundation is committed to the creation of thriving, independent and self-reliant
									aboriginal communities living on their ancestral land. Focussed on young people, we deliver programs
									that support a sustainable environment, education, healthy lifestyles and independent livelihoods for
									Aboriginal communities in the Watarrka region.
								</p>
							</li>
							<li style={{ marginBottom: 10 }}>
								<strong>
									Stars Foundation: <a href="https://starsfoundation.org.au/">Donate</a>
								</strong>
								<p>
									Stars supports Indigenous girls and young women to attend school, complete Year 12 and move into
									full-time work or further study. Our full-time Mentors provide a diverse range of activities to
									support our Stars to develop the self-esteem, confidence and life skills they need to successfully
									participate in school and transition into a positive and independent future.
								</p>
							</li>
						</ul>

						<p>
							For individual schools and community groups accepting online donations in lieu of a sizzle, we’re asking
							them to get in touch via <a href="https://twitter.com/demsausage">Twitter</a>,{' '}
							<a href="https://www.facebook.com/AusDemocracySausage/">Facebook</a>,{' '}
							<a href="https://www.instagram.com/ausdemocracysausage/">Instagram</a>, or{' '}
							<a href="mailto:ausdemocracysausage@gmail.com">email</a> so we can help get the word out.
						</p>

						<p>
							We’d also love to see some photographs and videos from hungry voters who are celebrating election day by
							making their own Democracy Sausage at home.
						</p>

						<p>
							Finally, for Democracy Sausage enthusiasts voting in person on Saturday, remember to be considerate of
							your fellow voters and election staff, and to take care of yourselves and your communities.
						</p>
					</Dialog>
				)}

				{queriedPollingPlaces.length > 0 && (
					<FullscreenDialog
						open={true}
						onRequestClose={onCloseQueryMapDialog}
						title="Polling Places"
						actionButton={<FlatButton label="Close" onClick={onCloseQueryMapDialog} />}
						containerStyle={{ paddingBottom: 56 }} /* Height of BottomNav */
					>
						{queriedPollingPlaces.slice(0, 20).map((pollingPlace: IPollingPlace) => (
							<PollingPlaceCardWrapper key={pollingPlace.id}>
								<PollingPlaceCardMiniContainer
									pollingPlace={pollingPlace}
									election={currentElection}
									showFullCard={true}
								/>
							</PollingPlaceCardWrapper>
						))}
						{queriedPollingPlaces.length > 20 && (
							<ListItem
								leftAvatar={<Avatar icon={<ActionInfo />} backgroundColor={blue500} />}
								primaryText={"There's a lot of polling places here"}
								secondaryText={
									<span>
										Try zooming in on the map and querying again - or hit the <Link to="/search">Find</Link> button and
										search by an address.
									</span>
								}
								secondaryTextLines={2}
								disabled={true}
							/>
						)}
					</FullscreenDialog>
				)}
			</React.Fragment>
		);
	}
}

export default SausageMap;
