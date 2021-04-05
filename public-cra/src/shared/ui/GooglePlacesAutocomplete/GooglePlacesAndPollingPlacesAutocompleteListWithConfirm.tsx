import Avatar from 'material-ui/Avatar'
import { ListItem } from 'material-ui/List'
import { blue500, grey600 } from 'material-ui/styles/colors'
import { ActionInfo } from 'material-ui/svg-icons'
import * as React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import PollingPlaceAutocompleteList from '../../../finder/PollingPlaceAutocomplete/PollingPlaceAutocompleteList'
import { IElection } from '../../../redux/modules/elections'
import { fetchNearbyPollingPlaces, IPollingPlace } from '../../../redux/modules/polling_places'
import { IStore } from '../../../redux/modules/reducer'
import { IGoogleGeocodeResult } from './GooglePlacesAutocomplete'
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

interface IDispatchProps {
  fetchPollingPlaces: Function
}

interface IStateProps {
  geocodedPlace: IGoogleGeocodeResult | null
  matchedPollingPlaces?: IPollingPlace[]
}

const ChosenAddressHeading = styled.h5`
  margin-bottom: 0px;
  color: ${grey600};
  font-weight: normal;
`

type TComponentProps = IProps & IStoreProps & IDispatchProps
class GooglePlacesAndPollingPlacesAutocompleteListWithConfirm extends React.Component<TComponentProps, IStateProps> {
  constructor(props: TComponentProps) {
    super(props)
    this.state = { geocodedPlace: null }

    this.onChoosePlace = this.onChoosePlace.bind(this)
    this.onCancelChosenLocation = this.onCancelChosenLocation.bind(this)
  }

  async onChoosePlace(place: IGoogleGeocodeResult) {
    const { fetchPollingPlaces } = this.props

    this.setState({
      ...this.state,
      geocodedPlace: place,
      matchedPollingPlaces: await fetchPollingPlaces(place.geometry.location.lat(), place.geometry.location.lng()),
    })
  }

  onCancelChosenLocation() {
    this.setState({ ...this.state, geocodedPlace: null, matchedPollingPlaces: undefined })
  }

  render() {
    const { election, onConfirmChosenLocation, componentRestrictions, autoFocus, hintText } = this.props
    const { geocodedPlace, matchedPollingPlaces } = this.state

    return (
      <div>
        {election.polling_places_loaded === true && (
          <div>
            <GooglePlacesAutocompleteList
              componentRestrictions={componentRestrictions}
              autoFocus={autoFocus}
              hintText={hintText}
              onShowPlaceAutocompleteResults={this.onCancelChosenLocation}
              onChoosePlace={this.onChoosePlace}
              onCancelSearch={this.onCancelChosenLocation}
            />
            <br />
          </div>
        )}

        {geocodedPlace !== null && matchedPollingPlaces !== undefined && matchedPollingPlaces.length > 0 && (
          <React.Fragment>
            <ListItem
              leftAvatar={<Avatar icon={<ActionInfo />} backgroundColor={blue500} />}
              primaryText="Choose a polling booth from below to continue"
              disabled={true}
            />

            <ChosenAddressHeading>
              Polling booths close to <em>{geocodedPlace.formatted_address}</em>
            </ChosenAddressHeading>
          </React.Fragment>
        )}

        {geocodedPlace !== null && matchedPollingPlaces !== undefined && matchedPollingPlaces.length === 0 && (
          <ListItem
            leftAvatar={<Avatar icon={<ActionInfo />} backgroundColor={blue500} />}
            primaryText="Oh dear. We couldn't find any polling booths near there."
            secondaryText={"Drop us an email with the place you were searching for and we'll help you out."}
            secondaryTextLines={2}
            disabled={true}
          />
        )}

        {matchedPollingPlaces !== undefined && matchedPollingPlaces.length > 0 && (
          <PollingPlaceAutocompleteList
            searchResults={matchedPollingPlaces}
            onChoosePollingPlace={onConfirmChosenLocation}
          />
        )}
      </div>
    )
  }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
  return {}
}

const mapDispatchToProps = (dispatch: Function, ownProps: IProps): IDispatchProps => {
  return {
    async fetchPollingPlaces(lat: number, lon: number) {
      const json = await dispatch(fetchNearbyPollingPlaces(ownProps.election, lat, lon))
      return json.slice(0, 5)
    },
  }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(GooglePlacesAndPollingPlacesAutocompleteListWithConfirm)
