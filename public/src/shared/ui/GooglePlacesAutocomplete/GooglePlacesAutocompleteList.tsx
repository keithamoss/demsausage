import Avatar from 'material-ui/Avatar';
import { List, ListItem } from 'material-ui/List';
import { ActionSearch, DeviceLocationSearching, NavigationClose } from 'material-ui/svg-icons';
import MapsPlace from 'material-ui/svg-icons/maps/place';
import * as React from 'react';
import GoogleMapLoader from 'react-google-maps-loader';
import { connect } from 'react-redux';
import { ePollingPlaceFinderInit } from '../../../redux/modules/app';
import { IStore } from '../../../redux/modules/reducer';
import { gaTrack } from '../../analytics/GoogleAnalytics';
import { askForGeolocationPermissions } from '../../geolocation/geo';
import GooglePlacesAutocomplete, { IGoogleAddressSearchResult, IGoogleGeocodeResult } from './GooglePlacesAutocomplete';

interface IProps {
	gps?: boolean;
	onShowPlaceAutocompleteResults?: Function;
	onChoosePlace: (place: IGoogleGeocodeResult, addressResult?: IGoogleAddressSearchResult) => void;
	onCancelSearch?: Function;
	// From SearchBar via GooglePlacesAutocomplete
	componentRestrictions: object;
	autoFocus?: boolean;
	hintText: string;
	style?: any;
	searchText?: string;
	// This is a giant hack to allow parent components like SausageNearMe to override initMode without having to interact with the Redux store.
	// Improve this in the rebuild once we're using modern React + Redux Toolkit
	initModeOverride?: ePollingPlaceFinderInit;
}
interface IStoreProps {
	initMode: ePollingPlaceFinderInit;
	geolocationSupported: boolean;
}

interface IDispatchProps {
	onRequestLocationPermissions: Function;
	fetchLocationFromGeocoder: Function;
}

interface IStateProps {
	waitingForGeolocation: boolean;
	addressSearchResults: Array<IGoogleAddressSearchResult>;
	searchText: string;
}

type TComponentProps = IProps & IStoreProps & IDispatchProps;
class GooglePlacesAutocompleteList extends React.PureComponent<TComponentProps, IStateProps> {
	onRequestLocationPermissions: any;

	constructor(props: TComponentProps) {
		super(props);

		this.state = {
			waitingForGeolocation: false,
			addressSearchResults: [],
			searchText: props.searchText !== undefined ? props.searchText : '',
		};

		this.onRequestLocationPermissions = props.onRequestLocationPermissions.bind(this);
		this.onWaitForGeolocation = this.onWaitForGeolocation.bind(this);
		this.onGeolocationComplete = this.onGeolocationComplete.bind(this);
		this.onGeolocationError = this.onGeolocationError.bind(this);

		this.onReceiveAddressSearchResults = this.onReceiveAddressSearchResults.bind(this);
		this.onPlaceChosen = this.onPlaceChosen.bind(this);
	}

	componentDidMount() {
		const { initMode, initModeOverride } = this.props;

		const actualInitMode = initModeOverride !== undefined ? initModeOverride : initMode;

		if (actualInitMode === ePollingPlaceFinderInit.GEOLOCATION) {
			// GooglePlacesAutocompleteList loads the Google APIs for us - but if we come here and try to
			// use it too soon for a geolocation request it may not be loaded yet
			const intervalId = window.setInterval(() => {
				if (window.google !== undefined) {
					window.clearInterval(intervalId);
					this.onRequestLocationPermissions();
				}
			}, 250);
		}
	}

	onWaitForGeolocation() {
		// eslint-disable-next-line react/no-access-state-in-setstate
		this.setState({ ...this.state, waitingForGeolocation: true });
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore-next-line
	onGeolocationComplete(_position: Position, place: IGoogleGeocodeResult, _locationSearched: string) {
		const { onChoosePlace } = this.props;
		// eslint-disable-next-line react/no-access-state-in-setstate
		this.setState({ ...this.state, waitingForGeolocation: false });

		this.onPlaceChosen(place);
		onChoosePlace(place);
	}

	onGeolocationError() {
		// eslint-disable-next-line react/no-access-state-in-setstate
		this.setState({ ...this.state, waitingForGeolocation: false });
	}

	onReceiveAddressSearchResults(results: Array<IGoogleAddressSearchResult>) {
		gaTrack.event({
			category: 'GooglePlacesAutocompleteList',
			action: 'onReceiveAddressSearchResults',
			label: 'Number of address search results from the geocoder',
			value: results.length,
		});

		this.setState({
			// eslint-disable-next-line react/no-access-state-in-setstate
			...this.state,
			addressSearchResults: results,
		});

		if (this.props.onShowPlaceAutocompleteResults !== undefined) {
			this.props.onShowPlaceAutocompleteResults();
		}
	}

	onPlaceChosen(place: IGoogleGeocodeResult) {
		// eslint-disable-next-line react/no-access-state-in-setstate
		this.setState({ ...this.state, addressSearchResults: [], searchText: place.formatted_address });
	}

	private getAutoFocus() {
		return (
			this.props.autoFocus === true ||
			(this.props.initMode === ePollingPlaceFinderInit.FOCUS_INPUT &&
				(this.props.initModeOverride === undefined ||
					this.props.initModeOverride === ePollingPlaceFinderInit.FOCUS_INPUT))
		);
	}

	private getHintText() {
		const { hintText } = this.props;
		const { waitingForGeolocation } = this.state;

		// eslint-disable-next-line no-nested-ternary
		return this.canUseGPS() === true
			? waitingForGeolocation === false
				? `${hintText} or use GPS →`
				: 'Fetching your location...'
			: hintText;
	}

	private getSearchIcon() {
		const { waitingForGeolocation } = this.state;

		// eslint-disable-next-line no-nested-ternary
		return this.canUseGPS() === true ? (
			waitingForGeolocation === false ? (
				<DeviceLocationSearching />
			) : (
				<DeviceLocationSearching className="spin" />
			)
		) : (
			<ActionSearch />
		);
	}

	public canUseGPS() {
		return (this.props.gps === true || this.props.gps === undefined) && this.props.geolocationSupported;
	}

	render() {
		const { onChoosePlace, onCancelSearch, fetchLocationFromGeocoder, componentRestrictions, style } = this.props;
		const { addressSearchResults, searchText } = this.state;

		return (
			<div>
				<GoogleMapLoader
					params={{
						key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
						libraries: 'places',
					}}
					render={(googleMaps: any) =>
						googleMaps && (
							<GooglePlacesAutocomplete
								onReceiveSearchResults={this.onReceiveAddressSearchResults}
								componentRestrictions={componentRestrictions}
								hintText={this.getHintText()}
								autoFocus={this.getAutoFocus()}
								searchIcon={this.getSearchIcon()}
								closeIcon={<NavigationClose />}
								// tslint:disable-next-line: no-empty
								onRequestSearch={this.canUseGPS() === true ? this.onRequestLocationPermissions : () => {}}
								onCancelSearch={onCancelSearch}
								searchText={searchText}
								value={searchText}
								style={style}
							/>
						)
					}
				/>

				{addressSearchResults.length > 0 && (
					<List>
						{addressSearchResults.map((value: IGoogleAddressSearchResult, _index: number) => (
							<ListItem
								key={value.place_id}
								leftAvatar={<Avatar icon={<MapsPlace />} />}
								primaryText={value.structured_formatting.main_text}
								secondaryText={value.structured_formatting.secondary_text}
								secondaryTextLines={2}
								onClick={(_event: any) => {
									fetchLocationFromGeocoder(onChoosePlace, value, this.onPlaceChosen);
								}}
							/>
						))}
					</List>
				)}
			</div>
		);
	}
}

const mapStateToProps = (state: IStore, _ownProps: IProps): IStoreProps => {
	const { app } = state;

	return {
		initMode: app.pollingPlaceFinderMode /* In lieu of React-Router v4's browserHistory.push(url, state) */,
		geolocationSupported: app.geolocationSupported,
	};
};

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
	return {
		onRequestLocationPermissions(this: GooglePlacesAutocompleteList) {
			if (this.canUseGPS() === true) {
				gaTrack.event({
					category: 'GooglePlacesAutocompleteList',
					action: 'onRequestLocationPermissions',
					label: 'Clicked the geolocation button',
				});

				this.onWaitForGeolocation();
				askForGeolocationPermissions(dispatch, this.onGeolocationComplete, this.onGeolocationError);
			}
		},
		fetchLocationFromGeocoder(
			onChoosePlace: (place: IGoogleGeocodeResult, addressResult?: IGoogleAddressSearchResult) => void,
			addressResult: IGoogleAddressSearchResult,
			onPlaceChosen: Function,
		) {
			gaTrack.event({
				category: 'GooglePlacesAutocompleteList',
				action: 'fetchLocationFromGeocoder',
				label: 'Chose an address',
			});

			const { google } = window;
			const geocoder = new google.maps.Geocoder();
			geocoder.geocode({ placeId: addressResult.place_id }, (results: Array<IGoogleGeocodeResult>, status: string) => {
				if (status === 'OK' && results.length > 0) {
					gaTrack.event({
						category: 'GooglePlacesAutocompleteList',
						action: 'fetchLocationFromGeocoder',
						label: 'Number of geocoder results',
						value: results.length,
					});

					onPlaceChosen(results[0]);
					onChoosePlace(results[0], addressResult);
				} else {
					gaTrack.event({
						category: 'GooglePlacesAutocompleteList',
						action: 'fetchLocationFromGeocoder',
						label: 'Got an error from the geocoder',
					});
				}
			});
		},
	};
};

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
	mapStateToProps,
	mapDispatchToProps,
)(GooglePlacesAutocompleteList);
