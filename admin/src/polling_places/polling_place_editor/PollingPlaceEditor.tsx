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
}

class PollingPlaceEditor extends React.PureComponent<IProps, {}> {
    render() {
        const { election, pollingPlace } = this.props

        return (
            <div>
                <PollingPlaceAutocompleteContainer
                    election={election}
                    onPollingPlaceChosen={(pollingPlace: IPollingPlace) => {
                        browserHistory.push(`/election/${election.db_table_name}/${pollingPlace.cartodb_id}/edit`)
                    }}
                />
                {pollingPlace && <PuffyDivider />}
                {pollingPlace && <PollingPlaceInfoCardContainer election={election} pollingPlace={pollingPlace} />}
                {pollingPlace && <PollingPlaceFormContainer election={election} pollingPlace={pollingPlace} />}
            </div>
        )
    }
}

export default PollingPlaceEditor
