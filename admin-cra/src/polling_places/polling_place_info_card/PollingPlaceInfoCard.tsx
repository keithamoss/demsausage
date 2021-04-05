// import "./PollingPlaceInfoCard.css"
import { Card, CardTitle } from 'material-ui/Card'
import * as React from 'react'
import { IElection } from '../../redux/modules/elections'
import { getPollingPlaceLongName, IPollingPlace } from '../../redux/modules/polling_places'
// import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"

interface IProps {
  election: IElection
  pollingPlace: IPollingPlace
}

class PollingPlaceInfoCard extends React.PureComponent<IProps, {}> {
  render() {
    const { pollingPlace } = this.props

    // const MyMapComponent: any = withScriptjs(
    //     withGoogleMap((props: any) => (
    //         <GoogleMap defaultZoom={9} defaultCenter={{ lat: pollingPlace.lat, lon: pollingPlace.lon }}>
    //             <Marker position={{ lat: pollingPlace.lat, lon: pollingPlace.lon }} />
    //         </GoogleMap>
    //     ))
    // )

    const pollingPlaceAddressDetails =
      pollingPlace.address === pollingPlace.premises
        ? pollingPlace.state
        : `${pollingPlace.address}, ${pollingPlace.state}`

    return (
      <Card>
        {/* <CardMedia overlay={<CardTitle title={pollingPlace.polling_place_name} subtitle={pollingPlace.division} />}>
                    <MyMapComponent
                        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env
                            .REACT_APP_GOOGLE_MAPS_API_KEY}&v=3.exp&libraries=geometry,places`}
                        loadingElement={<div style={{ height: `325px` }} />}
                        containerElement={<div style={{ height: `325px` }} />}
                        mapElement={<div style={{ height: `100%` }} />}
                    />
                </CardMedia> */}
        <CardTitle title={getPollingPlaceLongName(pollingPlace)} subtitle={pollingPlaceAddressDetails} />
      </Card>
    )
  }
}

export default PollingPlaceInfoCard
