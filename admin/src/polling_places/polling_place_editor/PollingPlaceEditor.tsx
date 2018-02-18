import * as React from "react"
import styled from "styled-components"
import { browserHistory } from "react-router"
import PollingPlaceAutocompleteContainer from "../polling_place_autocomplete/PollingPlaceAutocompleteContainer"
import PollingPlaceInfoCardContainer from "../polling_place_info_card/PollingPlaceInfoCardContainer"
import PollingPlaceFormContainer from "../polling_place_form/PollingPlaceFormContainer"
import { IElection, IPollingPlace } from "../../redux/modules/interfaces"
// import "./PollingPlaceEditor.css"

import Divider from "material-ui/Divider"

const PuffyDivider = styled(Divider)`
    margin-top: 25px !important;
    margin-bottom: 25px !important;
`

export interface IProps {
    election: IElection
    pollingPlace?: IPollingPlace
    showAutoComplete: boolean
    onPollingPlaceEdited: Function
}

class PollingPlaceEditor extends React.PureComponent<IProps, {}> {
    render() {
        const { election, pollingPlace, showAutoComplete, onPollingPlaceEdited } = this.props

        return (
            <div>
                {showAutoComplete && (
                    <PollingPlaceAutocompleteContainer
                        election={election}
                        onPollingPlaceChosen={(pollingPlace: IPollingPlace) => {
                            browserHistory.push(`/election/${election.id}/polling_places/${pollingPlace.id}/edit`)
                        }}
                    />
                )}
                {showAutoComplete && pollingPlace && <PuffyDivider />}
                {pollingPlace && <PollingPlaceInfoCardContainer election={election} pollingPlace={pollingPlace} />}
                {pollingPlace && (
                    <PollingPlaceFormContainer
                        election={election}
                        pollingPlace={pollingPlace}
                        onPollingPlaceEdited={onPollingPlaceEdited}
                    />
                )}
            </div>
        )
    }
}

export default PollingPlaceEditor
