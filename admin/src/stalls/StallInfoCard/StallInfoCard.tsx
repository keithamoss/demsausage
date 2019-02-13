import { Avatar } from "material-ui"
// import "./StallInfoCard.css"
import { Card, CardHeader, CardText } from "material-ui/Card"
import IconButton from "material-ui/IconButton"
import { List, ListItem } from "material-ui/List"
import { grey500 } from "material-ui/styles/colors"
import { ActionDescription, ActionHome, AvWeb, CommunicationEmail, MapsLocalDining, MapsPlace } from "material-ui/svg-icons"
import * as React from "react"
import styled from "styled-components"
import BaconandEggsIcon from "../../icons/bacon-and-eggs"
import CakeIcon from "../../icons/cake"
import CoffeeIcon from "../../icons/coffee"
import HalalIcon from "../../icons/halal"
import SausageIcon from "../../icons/sausage"
import VegoIcon from "../../icons/vego"
import { getStallLocationAddress, getStallLocationName, IStall } from "../../redux/modules/stalls"

export interface IProps {
    stall: IStall
    cardActions?: any
}

const HasFreeTextDeliciousness = styled.div`
    color: ${grey500};
    font-size: 12px;
`

class StallInfoCard extends React.PureComponent<IProps, {}> {
    render() {
        const { stall, cardActions } = this.props

        return (
            <Card>
                <CardHeader title={stall.name} subtitle={stall.description} avatar={<Avatar icon={<ActionHome />} />} />
                <CardText style={{ paddingTop: 0, paddingBottom: 0 }}>
                    <List style={{ paddingTop: 0, paddingBottom: 0 }}>
                        <ListItem
                            primaryText="Polling Place"
                            secondaryText={getStallLocationName(stall)}
                            leftIcon={<MapsPlace />}
                            disabled={true}
                        />
                        <ListItem
                            primaryText="Address"
                            secondaryText={getStallLocationAddress(stall)}
                            leftIcon={<MapsPlace />}
                            disabled={true}
                        />
                        <ListItem
                            primaryText="Description"
                            secondaryText={stall.description}
                            leftIcon={<ActionDescription />}
                            disabled={true}
                        />
                        <ListItem primaryText="Website" secondaryText={stall.website} leftIcon={<AvWeb />} disabled={true} />
                        <ListItem primaryText="Email" secondaryText={stall.email} leftIcon={<CommunicationEmail />} disabled={true} />
                        <ListItem leftIcon={<MapsLocalDining />} disabled={true}>
                            <div>Deliciousness</div>
                            {stall.noms.bbq && (
                                <IconButton tooltip="Sausage Sizzle" touch={true}>
                                    <SausageIcon />
                                </IconButton>
                            )}

                            {stall.noms.cake && (
                                <IconButton tooltip="Cake Stall" touch={true}>
                                    <CakeIcon />
                                </IconButton>
                            )}

                            {stall.noms.vego && (
                                <IconButton tooltip="Vegetarian Options" touch={true}>
                                    <VegoIcon />
                                </IconButton>
                            )}

                            {stall.noms.halal && (
                                <IconButton tooltip="Halal Options" touch={true}>
                                    <HalalIcon />
                                </IconButton>
                            )}

                            {stall.noms.coffee && (
                                <IconButton tooltip="Coffee" touch={true}>
                                    <CoffeeIcon />
                                </IconButton>
                            )}

                            {stall.noms.bacon_and_eggs && (
                                <IconButton tooltip="Bacon and Eggs" touch={true}>
                                    <BaconandEggsIcon />
                                </IconButton>
                            )}
                            {"free_text" in stall.noms && (
                                <HasFreeTextDeliciousness>Also has: {stall.noms.free_text}</HasFreeTextDeliciousness>
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
