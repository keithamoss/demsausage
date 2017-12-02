import * as React from "react"
// import styled from "styled-components"
// import { Link } from "react-router"
import { IElection, IStall } from "../../redux/modules/interfaces"
import { StallInfoCardContainer } from "../StallInfoCard/StallInfoCardContainer"
import PollingPlaceEditorContainer from "../../polling_places/polling_place_editor/PollingPlaceEditorContainer"
// import {PollingPlaceEditorContainer} from "../../polling_places/polling_place_editor/PollingPlaceEditorContainer"
// import "./PendingStallEditor.css"

// import { List, ListItem } from "material-ui/List"

export interface IProps {
    election: IElection
    stall: IStall
    onPollingPlaceEdited: Function
}

class PendingStallEditor extends React.PureComponent<IProps, {}> {
    render() {
        const { stall, election, onPollingPlaceEdited } = this.props

        return (
            <div>
                <StallInfoCardContainer stall={stall} />
                <br />
                <PollingPlaceEditorContainer
                    election={election}
                    pollingPlaceId={stall.polling_place_id}
                    showAutoComplete={false}
                    onPollingPlaceEdited={onPollingPlaceEdited}
                />
            </div>
        )
    }
}

export default PendingStallEditor
