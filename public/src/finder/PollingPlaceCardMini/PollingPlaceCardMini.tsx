import * as React from "react"
// import styled from "styled-components"
// import { Link, browserHistory } from "react-router"
// import "./PollingPlaceCardMini.css"
import { IPollingPlaceSearchResult } from "../../redux/modules/interfaces"

import Paper from "material-ui/Paper"
import { Card, CardActions, CardHeader, CardText } from "material-ui/Card"
import FlatButton from "material-ui/FlatButton"

import SausageIcon from "../../icons/sausage"
import CakeIcon from "../../icons/cake"

export interface IProps {
    pollingPlace: IPollingPlaceSearchResult
}

class PollingPlaceCardMini extends React.PureComponent<IProps, {}> {
    render() {
        const { pollingPlace } = this.props
        console.log(pollingPlace)

        return (
            <Paper>
                <Card>
                    <CardHeader title={pollingPlace.polling_place_name} subtitle={pollingPlace.address} />
                    {/* <CardMedia overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}>
                    <img src="images/nature-600-337.jpg" alt="" />
                </CardMedia> */}
                    {/* <CardTitle title={pollingPlace.address} subtitle={pollingPlace.premises} /> */}
                    <CardText>
                        <SausageIcon />
                        <CakeIcon />
                        <br />
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec mattis pretium massa. Aliquam erat volutpat. Nulla
                        facilisi. Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
                    </CardText>
                    <CardActions>
                        <FlatButton label="Report" />
                        <FlatButton label="More Information" />
                    </CardActions>
                </Card>
            </Paper>
        )
    }
}

export default PollingPlaceCardMini
