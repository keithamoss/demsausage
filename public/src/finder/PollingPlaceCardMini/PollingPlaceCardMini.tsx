import Avatar from "material-ui/Avatar"
import { Card, CardHeader, CardText, CardTitle } from "material-ui/Card"
import FlatButton from "material-ui/FlatButton"
import { ListItem } from "material-ui/List"
import Paper from "material-ui/Paper"
import { grey500, yellow600 } from "material-ui/styles/colors"
import { ActionHelpOutline /*, MapsAddLocation*/, AlertWarning, MapsNavigation } from "material-ui/svg-icons"
import * as React from "react"
import styled from "styled-components"
import BaconandEggsIcon from "../../icons/bacon-and-eggs"
import CakeIcon from "../../icons/cake"
import CoffeeIcon from "../../icons/coffee"
import HalalIcon from "../../icons/halal"
import RedCrossofShameIcon from "../../icons/red-cross-of-shame"
import SausageIcon from "../../icons/sausage"
import VegoIcon from "../../icons/vego"
import { IElection, isElectionLive } from "../../redux/modules/elections"
// import { Link, browserHistory } from "react-router"
// import "./PollingPlaceCardMini.css"
import {
    getFoodDescription,
    getSausageChanceDescription,
    IPollingPlace,
    IPollingPlaceSearchResult,
    pollingPlaceHasReports,
    pollingPlaceHasReportsOfNoms,
} from "../../redux/modules/polling_places"

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
    pollingPlace: IPollingPlace | IPollingPlaceSearchResult
    election: IElection
}

class PollingPlaceCardMini extends React.PureComponent<IProps, {}> {
    render() {
        const { pollingPlace, election } = this.props

        const isExpandable: boolean = pollingPlaceHasReportsOfNoms(pollingPlace) === true ? true : false

        let title = `${pollingPlace.name}`
        if (pollingPlace.premises !== null) {
            title = `${pollingPlace.name}, ${pollingPlace.premises}`
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
                        <CardTitle
                            title={pollingPlace.stall_name}
                            subtitle={pollingPlace.stall_description}
                            subtitleStyle={{ whiteSpace: "pre" }}
                        />
                    )}
                    <CardText>
                        <FlexboxContainer>
                            <FlexboxIcons>
                                {pollingPlace.noms.bbq && <SausageIcon />}
                                {pollingPlace.noms.cake && <CakeIcon />}
                                {pollingPlace.noms.vego && <VegoIcon />}
                                {pollingPlace.noms.nothing && <RedCrossofShameIcon />}
                                {pollingPlace.noms.halal && <HalalIcon />}
                                {pollingPlace.noms.coffee && <CoffeeIcon />}
                                {pollingPlace.noms.bacon_and_eggs && <BaconandEggsIcon />}
                            </FlexboxIcons>
                            {"distance_km" in pollingPlace && (
                                <FlexboxDistance label={`${pollingPlace.distance_km}km`} icon={<MapsNavigation color={grey500} />} />
                            )}
                        </FlexboxContainer>
                        {pollingPlace.noms.free_text && (
                            <HasFreeTextDeliciousness>Also available: {pollingPlace.noms.free_text}</HasFreeTextDeliciousness>
                        )}
                        {pollingPlace.noms.run_out && (
                            <RunOutWarning
                                secondaryText={"We've had reports that the stalls at this polling booth have run out of food."}
                                secondaryTextLines={2}
                                leftAvatar={<Avatar icon={<AlertWarning />} backgroundColor={yellow600} />}
                                disabled={true}
                            />
                        )}
                        {isElectionLive(election) && pollingPlaceHasReports(pollingPlace) === false && (
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
                        {pollingPlace.divisions.length > 0 && <Division>Division(s): {pollingPlace.divisions.join(", ")}</Division>}
                        {pollingPlace.stall_extra_info.length > 0 && <Division>Extra Info: {pollingPlace.stall_extra_info}</Division>}
                        {pollingPlace.booth_info.length > 0 && <Division>Booth Info: {pollingPlace.booth_info}</Division>}
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
