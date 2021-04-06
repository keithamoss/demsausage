import * as React from 'react'
import { connect } from 'react-redux'
import StallLocationCard from '../../../add-stall/StallLocationCard/StallLocationCard'
import { IElection } from '../../../redux/modules/elections'
import { IStore } from '../../../redux/modules/reducer'
import { IStallLocationInfo } from '../../../redux/modules/stalls'
import { IGoogleAddressSearchResult, IGoogleGeocodeResult } from './GooglePlacesAutocomplete'
import GooglePlacesAutocompleteList from './GooglePlacesAutocompleteList'

interface IProps {
  election: IElection
  onConfirmChosenLocation: Function

  // From SearchBar via GooglePlacesAutocomplete
  componentRestrictions: object
  autoFocus: boolean
  hintText: string
}
interface IStoreProps {}

interface IDispatchProps {}

interface IStateProps {
  addressResult: IGoogleAddressSearchResult | null
  geocodedPlace: IGoogleGeocodeResult | null
  stallLocationInfo: IStallLocationInfo | null
  locationConfirmed: boolean
}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class GooglePlacesAutocompleteListWithConfirm extends React.Component<TComponentProps, IStateProps> {
  constructor(props: TComponentProps) {
    super(props)
    this.state = { addressResult: null, geocodedPlace: null, stallLocationInfo: null, locationConfirmed: false }

    this.onChoosePlace = this.onChoosePlace.bind(this)
    this.onCancelChosenLocation = this.onCancelChosenLocation.bind(this)
    this.onConfirmChosenLocation = this.onConfirmChosenLocation.bind(this)
  }

  onChoosePlace(place: IGoogleGeocodeResult, addressResult?: IGoogleAddressSearchResult) {
    this.setState({
      // eslint-disable-next-line react/no-access-state-in-setstate
      ...this.state,
      addressResult: addressResult!,
      geocodedPlace: place,
      stallLocationInfo: this.getPollingPlaceInfo(place, addressResult!),
    })
  }

  onCancelChosenLocation() {
    this.setState({
      // eslint-disable-next-line react/no-access-state-in-setstate
      ...this.state,
      addressResult: null,
      geocodedPlace: null,
      stallLocationInfo: null,
      locationConfirmed: false,
    })
  }

  onConfirmChosenLocation(_stallLocationInfo: IStallLocationInfo) {
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, locationConfirmed: true })
    this.props.onConfirmChosenLocation(this.state.stallLocationInfo!)
  }

  // eslint-disable-next-line class-methods-use-this
  getPollingPlaceInfo(place: IGoogleGeocodeResult, addressResult: IGoogleAddressSearchResult): IStallLocationInfo {
    const stateComponent: any = place.address_components.find(
      (o: any) => o.types.includes('administrative_area_level_1') && o.types.includes('political')
    )

    return {
      geom: {
        type: 'Point',
        coordinates: [place.geometry.location.lng(), place.geometry.location.lat()],
      },
      name: addressResult.structured_formatting.main_text,
      address: place.formatted_address,
      state: stateComponent !== undefined ? stateComponent.short_name : null,
    }
  }

  render() {
    const { election, componentRestrictions, autoFocus, hintText } = this.props
    const { stallLocationInfo, locationConfirmed } = this.state

    return (
      <div>
        {locationConfirmed === false && election.polling_places_loaded === false && (
          <div>
            <GooglePlacesAutocompleteList
              componentRestrictions={componentRestrictions}
              autoFocus={autoFocus}
              hintText={hintText}
              onChoosePlace={this.onChoosePlace}
              /* Off because GPS makes no sense in the context of an election with no polling places loaded */
              gps={false}
            />
            <br />
          </div>
        )}

        {stallLocationInfo !== null && (
          <StallLocationCard
            stallLocationInfo={stallLocationInfo}
            showActions={locationConfirmed === false}
            onCancel={this.onCancelChosenLocation}
            onConfirm={this.onConfirmChosenLocation}
          />
        )}
      </div>
    )
  }
}

const mapStateToProps = (_state: IStore, _ownProps: IProps): IStoreProps => {
  return {}
}

const mapDispatchToProps = (_dispatch: Function): IDispatchProps => {
  return {}
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(GooglePlacesAutocompleteListWithConfirm)
