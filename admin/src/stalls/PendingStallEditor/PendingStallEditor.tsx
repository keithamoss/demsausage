import * as React from "react"
import styled from "styled-components"
// import { Link } from "react-router"
import { IElection, IStall } from "../../redux/modules/interfaces"
import { StallInfoCardContainer } from "../StallInfoCard/StallInfoCardContainer"
import PollingPlaceEditorContainer from "../../polling_places/polling_place_editor/PollingPlaceEditorContainer"
// import "./PendingStallEditor.css"

import { ListItem } from "material-ui/List"
import Avatar from "material-ui/Avatar"
import { AlertWarning } from "material-ui/svg-icons"
import { blue500 } from "material-ui/styles/colors"
import { CardActions } from "material-ui/Card"
import FlatButton from "material-ui/FlatButton"

const FlexboxContainer = styled.div`
    display: -ms-flex;
    display: -webkit-flex;
    display: flex;
    flex-direction: row;
    align-items: left;
    justify-content: left;
    /* Or do it all in one line with flex flow */
    flex-flow: row wrap;
    /* tweak where items line up on the row valid values are: 
       flex-start, flex-end, space-between, space-around, stretch */
    align-content: flex-end;
`

const FlexboxColumn = styled.div`
    width: 40%;
    min-width: 340px;
    padding: 10px;
`

export interface IProps {
    election: IElection
    stall: IStall
    onPollingPlaceEdited: Function
    onApproveUnofficialStall: any
    onDeclineUnofficialStall: any
}

class PendingStallEditor extends React.PureComponent<IProps, {}> {
    render() {
        const { stall, election, onPollingPlaceEdited, onApproveUnofficialStall, onDeclineUnofficialStall } = this.props

        return (
            <FlexboxContainer>
                <FlexboxColumn>
                    <StallInfoCardContainer
                        stall={stall}
                        cardActions={
                            <CardActions>
                                {stall.polling_place_id === 0 && (
                                    <FlatButton label="Approve" primary={true} onClick={onApproveUnofficialStall} />
                                )}
                                <FlatButton label="Decline" primary={true} onClick={onDeclineUnofficialStall} />
                            </CardActions>
                        }
                    />
                    <ListItem primaryText={election.name} />
                    {election.polling_places_loaded === false &&
                        stall.polling_place_id === 0 && (
                            <ListItem
                                leftAvatar={<Avatar icon={<AlertWarning />} backgroundColor={blue500} />}
                                primaryText={"Notice"}
                                secondaryText={
                                    "We don't have official polling places for this election yet. " +
                                    "Approving will add it to the map as a temporary polling place."
                                }
                                secondaryTextLines={2}
                                disabled={true}
                            />
                        )}
                </FlexboxColumn>
                <FlexboxColumn>
                    <PollingPlaceEditorContainer
                        election={election}
                        pollingPlaceId={stall.polling_place_id}
                        stall={stall}
                        showAutoComplete={false}
                        showElectionChooser={false}
                        onPollingPlaceEdited={onPollingPlaceEdited}
                    />
                </FlexboxColumn>
            </FlexboxContainer>
        )
    }
}

export default PendingStallEditor
