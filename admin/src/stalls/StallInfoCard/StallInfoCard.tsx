import * as React from "react"
// import PollingPlaceAutocompleteContainer from "../polling_place_autocomplete/PollingPlaceAutocompleteContainer"
import { IStall } from "../../redux/modules/interfaces"
// import "./StallInfoCard.css"

import { Card, CardHeader, CardTitle, CardText } from "material-ui/Card"
import FlatButton from "material-ui/FlatButton"
import ActionCheckCircle from "material-ui/svg-icons/action/check-circle"
// import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"

export interface IProps {
    stall: IStall
}

class StallInfoCard extends React.PureComponent<IProps, {}> {
    render() {
        const { stall } = this.props
        console.log("stall", stall)

        return (
            <Card>
                <CardHeader title={stall.polling_place_premises} />
                <CardTitle title={stall.stall_name} subtitle={stall.stall_description} />
                <CardText>
                    {stall.stall_website}
                    {stall.has_bbq && <FlatButton label="BBQ" secondary={true} icon={<ActionCheckCircle />} />}
                    {stall.has_caek && <FlatButton label="Cake" secondary={true} icon={<ActionCheckCircle />} />}
                    {stall.has_halal && <FlatButton label="Halal" secondary={true} icon={<ActionCheckCircle />} />}
                    {stall.has_vego && <FlatButton label="Vegetarian" secondary={true} icon={<ActionCheckCircle />} />}
                </CardText>
            </Card>
        )
    }
}

export default StallInfoCard
