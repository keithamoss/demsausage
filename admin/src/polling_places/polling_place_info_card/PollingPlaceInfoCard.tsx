import * as React from "react"
// import PollingPlaceAutocompleteContainer from "../polling_place_autocomplete/PollingPlaceAutocompleteContainer"
import { IElection, IPollingPlace } from "../../redux/modules/interfaces"
// import "./PollingPlaceInfoCard.css"

import { Card, CardTitle, CardText } from "material-ui/Card"
// import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"

export interface IProps {
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
            pollingPlace.address === pollingPlace.premises ? pollingPlace.state : `${pollingPlace.address}, ${pollingPlace.state}`

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
                <CardTitle title={pollingPlace.premises} subtitle={pollingPlaceAddressDetails} />
                <CardText>
                    {pollingPlace.extra_info !== "" && (
                        <span>
                            <strong>Extra Info:</strong> {pollingPlace.extra_info}
                        </span>
                    )}
                    {pollingPlace.booth_info !== "" && (
                        <span>
                            <strong>Booth Info:</strong> {pollingPlace.booth_info}
                        </span>
                    )}
                </CardText>
            </Card>
        )
    }
}

export default PollingPlaceInfoCard
