import * as React from "react"
import styled from "styled-components"
// import { Link, browserHistory } from "react-router"
// import "./PollingPlaceCardMini.css"
// import { IPollingPlace } from "../../redux/modules/interfaces"
import {
    pollingPlaceHasReports,
    pollingPlaceHasReportsOfNoms,
    getSausageChanceDescription,
    getFoodDescription,
} from "../../redux/modules/polling_places"

import Paper from "material-ui/Paper"
import { Card, CardHeader, CardTitle, CardText } from "material-ui/Card"
import FlatButton from "material-ui/FlatButton"
import { ListItem } from "material-ui/List"
import Avatar from "material-ui/Avatar"
import { MapsNavigation, AlertWarning, ActionHelpOutline /*, MapsAddLocation*/ } from "material-ui/svg-icons"
import { grey500, yellow600 } from "material-ui/styles/colors"

import SausageIcon from "../../icons/sausage"
import CakeIcon from "../../icons/cake"
import VegoIcon from "../../icons/vego"
import RedCrossofShameIcon from "../../icons/red-cross-of-shame"
import HalalIcon from "../../icons/halal"
import CoffeeIcon from "../../icons/coffee"
import BaconandEggsIcon from "../../icons/bacon-and-eggs"

const FlexboxContainer = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 10px;
`

const FlexboxIcons = styled.div`
    flex-grow: 1;
    svg {
        padding-left: 5px;
        padding-right: 5px;
    }
`

const FlexboxDistance = styled(FlatButton)`
    color: ${grey500} !important;
`

const HasFreeTextDeliciousness = styled.div`
    color: ${grey500};
    font-size: 12px;
`

const RunOutWarning = styled(ListItem)`
    margin-bottom: 10px !important;
`

const Division = styled.div`
    color: ${grey500};
`

const ChanceOfSausage = styled(ListItem)`
    color: ${grey500};
    padding-top: 0px !important;

    .sausageChance {
        color: red;
    }
`

const ChanceOfSausageIndicator = styled.span`
    color: black;
`

export interface IProps {
    pollingPlace: any // FIXME - Due to this component accepting IPollingPlaceSearchResult and IPollingPlace from different parent components
}

class PollingPlaceCardMini extends React.PureComponent<IProps, {}> {
    render() {
        const { pollingPlace } = this.props

        const isExpandable: boolean = pollingPlaceHasReportsOfNoms(pollingPlace) === true ? true : false

        let title = `${pollingPlace.polling_place_name}`
        if (pollingPlace.premises !== null) {
            title = `${pollingPlace.polling_place_name}, ${pollingPlace.premises}`
        }

        return (
            <Paper>
                <Card>
                    <CardHeader
                        title={title}
                        subtitle={pollingPlace.address}
                        actAsExpander={isExpandable}
                        showExpandableButton={isExpandable}
                    />
                    {/* <CardMedia overlay={<CardTitle title="Overlay title" subtitle="Overlay subtitle" />}>
                    <img src="images/nature-600-337.jpg" alt="" />
                </CardMedia> */}
                    {pollingPlace.stall_name !== null && (
                        <CardTitle title={pollingPlace.stall_name} subtitle={pollingPlace.stall_description} />
                    )}
                    <CardText>
                        <FlexboxContainer>
                            <FlexboxIcons>
                                {pollingPlace.has_bbq && <SausageIcon />}
                                {pollingPlace.has_caek && <CakeIcon />}
                                {pollingPlace.has_other !== null && "has_vego" in pollingPlace.has_other && <VegoIcon />}
                                {pollingPlace.has_nothing && <RedCrossofShameIcon />}
                                {pollingPlace.has_other !== null && "has_halal" in pollingPlace.has_other && <HalalIcon />}
                                {pollingPlace.has_other !== null && "has_coffee" in pollingPlace.has_other && <CoffeeIcon />}
                                {pollingPlace.has_other !== null && "has_bacon_and_eggs" in pollingPlace.has_other && <BaconandEggsIcon />}
                            </FlexboxIcons>
                            {"distance_metres" in pollingPlace && (
                                <FlexboxDistance
                                    label={`${(pollingPlace.distance_metres / 1000).toFixed(2)}km`}
                                    icon={<MapsNavigation color={grey500} />}
                                />
                            )}
                        </FlexboxContainer>
                        {pollingPlace.has_other !== null &&
                            "has_free_text" in pollingPlace.has_other && (
                                <HasFreeTextDeliciousness>Also available: {pollingPlace.has_other.has_free_text}</HasFreeTextDeliciousness>
                            )}
                        {pollingPlace.has_run_out && (
                            <RunOutWarning
                                secondaryText={"We've had reports that the stalls at this polling booth have run out of food."}
                                secondaryTextLines={2}
                                leftAvatar={<Avatar icon={<AlertWarning />} backgroundColor={yellow600} />}
                                disabled={true}
                            />
                        )}
                        {pollingPlaceHasReports(pollingPlace) === false && (
                            <ChanceOfSausage
                                primaryText={"We don't have any reports for this booth yet."}
                                secondaryText={
                                    <span>
                                        Based on past elections this booth has a{" "}
                                        <ChanceOfSausageIndicator>{getSausageChanceDescription(pollingPlace)}</ChanceOfSausageIndicator>{" "}
                                        chance of having food.
                                    </span>
                                }
                                secondaryTextLines={2}
                                leftAvatar={<Avatar icon={<ActionHelpOutline />} />}
                                disabled={true}
                            />
                        )}
                        {pollingPlace.division !== null && <Division>Division(s): {pollingPlace.division}</Division>}
                        {pollingPlace.extra_info !== null && <Division>Extra Info: {pollingPlace.extra_info}</Division>}
                        {pollingPlace.booth_info !== null && <Division>Booth Info: {pollingPlace.booth_info}</Division>}
                    </CardText>
                    {isExpandable && (
                        <CardText expandable={isExpandable}>
                            {pollingPlaceHasReportsOfNoms(pollingPlace) === true &&
                                `This polling place has ${getFoodDescription(pollingPlace)}.`}
                        </CardText>
                    )}
                    {/* <CardActions>
                        <RaisedButton primary={true} label="Report" icon={<MapsAddLocation />} />
                    </CardActions> */}
                </Card>
            </Paper>
        )
    }
}

export default PollingPlaceCardMini
