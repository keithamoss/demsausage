import { Avatar, Checkbox, CircularProgress, FloatingActionButton, ListItem, Paper } from 'material-ui'
import { blue500 } from 'material-ui/styles/colors'
import { ActionInfo, SocialPublic } from 'material-ui/svg-icons'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { browserHistory } from 'react-router'
import styled from 'styled-components'
import { ePollingPlaceFinderInit } from '../../redux/modules/app'
import { getURLSafeElectionName, IElection } from '../../redux/modules/elections'
import { setMapToSearch, setSausageNearMeSearchGeocodePlaceResult } from '../../redux/modules/map'
import {
  getBBoxFromPollingPlaces,
  IPollingPlace,
  pollingPlaceHasReportsOfNoms,
} from '../../redux/modules/polling_places'
import { IStore } from '../../redux/modules/reducer'
import { gaTrack } from '../../shared/analytics/GoogleAnalytics'
import { useGetNearbyPollingPlacesQuery } from '../../shared/api/APIClient-RTK'
import { IGoogleGeocodeResult } from '../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocomplete'
import GooglePlacesAutocompleteList from '../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocompleteList'
import PollingPlaceCardMiniContainer from '../PollingPlaceCardMini/PollingPlaceCardMiniContainer'

const FinderContainer = styled.div`
  width: 85%;
  margin-top: 10px;
  margin-left: 7.5%;
  margin-right: 7.5%;
`

const StyledPaper = styled(Paper)`
  margin-bottom: 15px;
`

const StyledCheckbox = styled(Checkbox)`
  margin-bottom: 15px;
`

const MapViewFABContainer = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
`

export default function SausageNearMeFinder() {
  const election = useSelector(
    (state: IStore) => state.elections.elections.find((e: IElection) => e.id === state.elections.current_election_id)!
  )

  const [showAllPollingPlaces, setShowAllPollingPlaces] = React.useState<boolean>(false)

  const onCheckboxChange = (_event: React.MouseEvent<HTMLInputElement>, checked: boolean) => {
    setShowAllPollingPlaces(checked)
  }

  const geocodePlaceResult = useSelector((state: IStore) => state.map.place)

  const [geocodeResult, setGeocodeResult] = React.useState<IGoogleGeocodeResult | undefined>(geocodePlaceResult)

  const dispatch = useDispatch()

  const onGeocoderResults = async (place: IGoogleGeocodeResult) => {
    gaTrack.event({
      category: 'SausageNearMeFinder',
      action: 'findNearestPollingPlaces',
      label: 'Searched for polling places near an address',
    })

    setGeocodeResult(place)

    dispatch(setSausageNearMeSearchGeocodePlaceResult(place))
  }

  const {
    data: pollingPlaces,
    error,
    isLoading,
  } = useGetNearbyPollingPlacesQuery(
    {
      election_id: election.id,
      lonlat: `${geocodeResult?.geometry.location.lng()},${geocodeResult?.geometry.location.lat()}`,
    },
    {
      skip: geocodeResult === undefined,
    }
  )

  if (geocodePlaceResult !== undefined && pollingPlaces !== undefined) {
    const bbox = getBBoxFromPollingPlaces(pollingPlaces)

    dispatch(
      setMapToSearch({
        lon: geocodePlaceResult.geometry.location.lng(),
        lat: geocodePlaceResult.geometry.location.lat(),
        extent: [bbox.lon_left, bbox.lat_bottom, bbox.lon_right, bbox.lat_top],
        formattedAddress: geocodePlaceResult.formatted_address,
      })
    )
  }

  const pollingPlacesWithNoms =
    pollingPlaces !== undefined
      ? pollingPlaces.filter((pollingPlace: IPollingPlace) =>
          showAllPollingPlaces === false ? pollingPlaceHasReportsOfNoms(pollingPlace) === true : true
        )
      : undefined

  const doWeHaveAnyResults =
    error === undefined &&
    isLoading === false &&
    pollingPlacesWithNoms !== undefined &&
    pollingPlacesWithNoms.length > 0

  const onClickGoToMap = () => browserHistory.push(`/${getURLSafeElectionName(election)}`)

  return (
    <FinderContainer>
      {election.polling_places_loaded === false && (
        <StyledPaper>
          <ListItem
            leftAvatar={<Avatar icon={<ActionInfo />} backgroundColor={blue500} />}
            primaryText={"Polling places haven't been annonced yet"}
            secondaryText={"Until then we're only listing stalls reported by the community."}
            secondaryTextLines={2}
            disabled={true}
          />
        </StyledPaper>
      )}

      <GooglePlacesAutocompleteList
        componentRestrictions={{ country: 'AU' }}
        hintText="Search here"
        onChoosePlace={onGeocoderResults}
        searchText={geocodeResult !== undefined ? geocodeResult.formatted_address : undefined}
        autoFocus={false}
        initModeOverride={geocodeResult !== undefined ? ePollingPlaceFinderInit.DO_NOTHING : undefined}
      />

      <br />

      {isLoading === true && <CircularProgress />}

      {error === undefined &&
        isLoading === false &&
        pollingPlacesWithNoms !== undefined &&
        pollingPlacesWithNoms.length === 0 && (
          <StyledPaper>
            <ListItem
              leftAvatar={<Avatar icon={<ActionInfo />} backgroundColor={blue500} />}
              primaryText={"Oh no! We couldn't find any sausages or cakes at your local polling places."}
              disabled={true}
            />
          </StyledPaper>
        )}

      {error === undefined && isLoading === false && pollingPlacesWithNoms !== undefined && (
        <StyledCheckbox label="Show all polling places" checked={showAllPollingPlaces} onCheck={onCheckboxChange} />
      )}

      {doWeHaveAnyResults === true &&
        pollingPlacesWithNoms !== undefined &&
        pollingPlacesWithNoms.map((pollingPlace: IPollingPlace) => (
          <React.Fragment key={pollingPlace.id}>
            <PollingPlaceCardMiniContainer pollingPlace={pollingPlace} election={election} />
            <br />
          </React.Fragment>
        ))}

      {error !== undefined && (
        <StyledPaper>
          <ListItem
            leftAvatar={<Avatar icon={<ActionInfo />} backgroundColor={blue500} />}
            primaryText="Oh no! We hit an error while trying to find your nearby polling places."
            disabled={true}
          />
        </StyledPaper>
      )}

      {error === undefined && isLoading === false && pollingPlacesWithNoms !== undefined && (
        <MapViewFABContainer>
          <FloatingActionButton onClick={onClickGoToMap}>
            <SocialPublic />
          </FloatingActionButton>
        </MapViewFABContainer>
      )}
    </FinderContainer>
  )
}
