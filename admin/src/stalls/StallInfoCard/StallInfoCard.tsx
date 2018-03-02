import * as React from "react"
// import styled from "styled-components"
import { IStall } from "../../redux/modules/interfaces"
// import "./StallInfoCard.css"

import { Card, CardHeader, CardText } from "material-ui/Card"
import { Avatar } from "material-ui"
import { ActionHome, MapsPlace, ActionDescription, AvWeb, CommunicationEmail, MapsLocalDining } from "material-ui/svg-icons"
import { List, ListItem } from "material-ui/List"
import IconButton from "material-ui/IconButton"

import SausageIcon from "../../icons/sausage"
import CakeIcon from "../../icons/cake"
import VegoIcon from "../../icons/vego"
import HalalIcon from "../../icons/halal"
import CoffeeIcon from "../../icons/coffee"
import BaconandEggsIcon from "../../icons/bacon-and-eggs"

export interface IProps {
    stall: IStall
    cardActions?: any
}

class StallInfoCard extends React.PureComponent<IProps, {}> {
    render() {
        const { stall, cardActions } = this.props

        return (
            <Card>
                <CardHeader title={stall.stall_name} subtitle={stall.stall_description} avatar={<Avatar icon={<ActionHome />} />} />
                <CardText style={{ paddingTop: 0, paddingBottom: 0 }}>
                    <List style={{ paddingTop: 0, paddingBottom: 0 }}>
                        <ListItem
                            primaryText="Polling Place"
                            secondaryText={
                                stall.stall_location_info === null
                                    ? stall.polling_place_info.premises
                                    : stall.stall_location_info.polling_place_name
                            }
                            leftIcon={<MapsPlace />}
                            disabled={true}
                        />
                        <ListItem
                            primaryText="Address"
                            secondaryText={
                                stall.stall_location_info === null ? stall.polling_place_info.address : stall.stall_location_info.address
                            }
                            leftIcon={<MapsPlace />}
                            disabled={true}
                        />
                        <ListItem
                            primaryText="Description"
                            secondaryText={stall.stall_description}
                            leftIcon={<ActionDescription />}
                            disabled={true}
                        />
                        <ListItem primaryText="Website" secondaryText={stall.stall_website} leftIcon={<AvWeb />} disabled={true} />
                        <ListItem
                            primaryText="Email"
                            secondaryText={stall.contact_email}
                            leftIcon={<CommunicationEmail />}
                            disabled={true}
                        />
                        <ListItem leftIcon={<MapsLocalDining />} disabled={true}>
                            <div>Deliciousness</div>
                            {stall.has_bbq && (
                                <IconButton tooltip="Sausage Sizzle" touch={true}>
                                    <SausageIcon />
                                </IconButton>
                            )}

                            {stall.has_caek && (
                                <IconButton tooltip="Cake Stall" touch={true}>
                                    <CakeIcon />
                                </IconButton>
                            )}

                            {stall.has_vego && (
                                <IconButton tooltip="Vegetarian Options" touch={true}>
                                    <VegoIcon />
                                </IconButton>
                            )}

                            {stall.has_halal && (
                                <IconButton tooltip="Halal Options" touch={true}>
                                    <HalalIcon />
                                </IconButton>
                            )}

                            {stall.has_coffee && (
                                <IconButton tooltip="Coffee" touch={true}>
                                    <CoffeeIcon />
                                </IconButton>
                            )}

                            {stall.has_bacon_and_eggs && (
                                <IconButton tooltip="Bacon and Eggs" touch={true}>
                                    <BaconandEggsIcon />
                                </IconButton>
                            )}
                        </ListItem>
                    </List>
                </CardText>
                {cardActions}
            </Card>
        )
    }
}

export default StallInfoCard
