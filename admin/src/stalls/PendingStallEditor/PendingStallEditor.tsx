import * as React from "react"
import styled from "styled-components"
// import { Link } from "react-router"
import { IElection, IStall } from "../../redux/modules/interfaces"
import { StallInfoCardContainer } from "../StallInfoCard/StallInfoCardContainer"
import PollingPlaceEditorContainer from "../../polling_places/polling_place_editor/PollingPlaceEditorContainer"
// import {PollingPlaceEditorContainer} from "../../polling_places/polling_place_editor/PollingPlaceEditorContainer"
// import "./PendingStallEditor.css"

import { ListItem } from "material-ui/List"
import Avatar from "material-ui/Avatar"
import { AlertWarning } from "material-ui/svg-icons"
import { GridList, GridTile } from "material-ui/GridList"
import { blue500 } from "material-ui/styles/colors"
import { CardActions } from "material-ui/Card"
import FlatButton from "material-ui/FlatButton"

const PaddedGridTile = styled(GridTile)`
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
            <GridList cellHeight={"auto"} cols={2}>
                <PaddedGridTile>
                    <PollingPlaceEditorContainer
                        election={election}
                        pollingPlaceId={stall.polling_place_id}
                        showAutoComplete={false}
                        onPollingPlaceEdited={onPollingPlaceEdited}
                    />
                </PaddedGridTile>
                <PaddedGridTile>
                    <StallInfoCardContainer
                        stall={stall}
                        cardActions={
                            stall.polling_place_id === 0 && (
                                <CardActions>
                                    <FlatButton label="Approve" primary={true} onClick={onApproveUnofficialStall} />{" "}
                                    <FlatButton label="Decline" primary={true} onClick={onDeclineUnofficialStall} />
                                </CardActions>
                            )
                        }
                    />
                    <ListItem
                        primaryText={"Lorem ipsum dolor"}
                        secondaryText={"..."}
                        leftAvatar={<Avatar icon={<AlertWarning />} backgroundColor={blue500} />}
                        disabled={true}
                    />
                </PaddedGridTile>
            </GridList>
        )
    }
}

export default PendingStallEditor
