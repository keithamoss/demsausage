import Avatar from "material-ui/Avatar"
import { Card, CardHeader, CardText, CardTitle } from "material-ui/Card"
import { ListItem } from "material-ui/List"
import Paper from "material-ui/Paper"
import { grey500, yellow600 } from "material-ui/styles/colors"
import { ActionAccessible, AlertWarning, DeviceAccessTime } from "material-ui/svg-icons"
import * as React from "react"
import styled from "styled-components"
import BaconandEggsIcon from "../../icons/bacon-and-eggs"
import CakeIcon from "../../icons/cake"
import CoffeeIcon from "../../icons/coffee"
import HalalIcon from "../../icons/halal"
import RedCrossofShameIcon from "../../icons/red-cross-of-shame"
import SausageIcon from "../../icons/sausage"
import VegoIcon from "../../icons/vego"
import { getWheelchairAccessDescription, IPollingPlace } from "../../redux/modules/polling_places"

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

const HasFreeTextDeliciousness = styled.div`
    color: ${grey500};
    font-size: 12px;
`

const RunOutWarning = styled(ListItem)`
    margin-bottom: 10px !important;
`

const Division = styled.div`
    color: ${grey500};
    padding-top: 10px;
`

const StallOpeningHours = styled.div`
    color: ${grey500};
    padding-top: 10px;
`

const WheelchairAccess = styled.div`
    color: ${grey500};
    padding-top: 10px;
`

interface IProps {
    pollingPlace: IPollingPlace
}

class PollingPlaceInfoCardMini extends React.PureComponent<IProps, {}> {
    render() {
        const { pollingPlace } = this.props

        let title = `${pollingPlace.name}`
        if (pollingPlace.premises !== null) {
            title = `${pollingPlace.name}, ${pollingPlace.premises}`
        }

        return (
            <Paper>
                <Card>
                    <CardHeader title={title} subtitle={pollingPlace.address} />
                    {pollingPlace.stall !== null && (
                        <CardTitle
                            title={pollingPlace.stall.name}
                            subtitle={pollingPlace.stall.description}
                            subtitleStyle={{ whiteSpace: "pre-wrap" }}
                        />
                    )}
                    <CardText>
                        <FlexboxContainer>
                            {pollingPlace.stall !== null && (
                                <FlexboxIcons>
                                    {pollingPlace.stall.noms.bbq && <SausageIcon />}
                                    {pollingPlace.stall.noms.cake && <CakeIcon />}
                                    {pollingPlace.stall.noms.vego && <VegoIcon />}
                                    {pollingPlace.stall.noms.nothing && <RedCrossofShameIcon />}
                                    {pollingPlace.stall.noms.halal && <HalalIcon />}
                                    {pollingPlace.stall.noms.coffee && <CoffeeIcon />}
                                    {pollingPlace.stall.noms.bacon_and_eggs && <BaconandEggsIcon />}
                                </FlexboxIcons>
                            )}
                        </FlexboxContainer>
                        {pollingPlace.stall !== null &&
                            "free_text" in pollingPlace.stall.noms &&
                            pollingPlace.stall.noms.free_text !== null && (
                                <HasFreeTextDeliciousness>Also available: {pollingPlace.stall.noms.free_text}</HasFreeTextDeliciousness>
                            )}
                        {pollingPlace.stall !== null && pollingPlace.stall.noms.run_out && (
                            <RunOutWarning
                                secondaryText={"We've had reports that the stalls at this polling booth have run out of food."}
                                secondaryTextLines={2}
                                leftAvatar={<Avatar icon={<AlertWarning />} backgroundColor={yellow600} />}
                                disabled={true}
                            />
                        )}
                        {pollingPlace.stall !== null && pollingPlace.stall.opening_hours !== "" && (
                            <StallOpeningHours>
                                <DeviceAccessTime /> Stall Opening Hours: {pollingPlace.stall.opening_hours}
                            </StallOpeningHours>
                        )}
                        <WheelchairAccess>
                            <ActionAccessible /> Wheelchair Access: {getWheelchairAccessDescription(pollingPlace)}
                        </WheelchairAccess>
                        {pollingPlace.divisions.length > 0 && <Division>Division(s): {pollingPlace.divisions.join(", ")}</Division>}
                        {pollingPlace.stall !== null &&
                            pollingPlace.stall.extra_info !== null &&
                            pollingPlace.stall.extra_info.length > 0 && <Division>Extra Info: {pollingPlace.stall.extra_info}</Division>}
                        {pollingPlace.booth_info.length > 0 && <Division>Booth Info: {pollingPlace.booth_info}</Division>}
                    </CardText>
                </Card>
            </Paper>
        )
    }
}

export default PollingPlaceInfoCardMini
