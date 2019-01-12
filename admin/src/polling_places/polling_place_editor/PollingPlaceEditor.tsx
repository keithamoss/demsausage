import * as React from "react"
import { browserHistory } from "react-router"
import styled from "styled-components"
import ElectionChooser from "../../elections/ElectionChooser/ElectionChooserContainer"
import { IElection } from "../../redux/modules/elections"
import { IPollingPlace } from "../../redux/modules/polling_places"
import { IStall } from "../../redux/modules/stalls"
import PollingPlaceAutocompleteContainer from "../polling_place_autocomplete/PollingPlaceAutocompleteContainer"
import PollingPlaceFormContainer from "../polling_place_form/PollingPlaceFormContainer"
import PollingPlaceInfoCardContainer from "../polling_place_info_card/PollingPlaceInfoCardContainer"
// import "./PollingPlaceEditor.css"

const FlexboxContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: left;
    justify-content: left;
    /* Or do it all in one line with flex flow */
    flex-flow: row wrap;
    /* tweak where items line up on the row valid values are: 
       flex-start, flex-end, space-between, space-around, stretch */
    align-content: flex-end;
    margin-bottom: 20px;
`

const FlexboxItem = styled.div`
    margin-right: 10px;
`

const FlexboxPollingPlaceAutocompleteContainer = styled.div`
    max-width: 500px;
    width: 100%;
`

export interface IProps {
    election: IElection
    pollingPlace?: IPollingPlace
    stall?: IStall
    showAutoComplete: boolean
    showElectionChooser: boolean
    onPollingPlaceEdited: Function
    onElectionChanged: Function
}

export class PollingPlaceEditor extends React.PureComponent<IProps, {}> {
    render() {
        const { election, pollingPlace, stall, showAutoComplete, showElectionChooser, onPollingPlaceEdited, onElectionChanged } = this.props

        return (
            <div>
                {showElectionChooser === true && (
                    <FlexboxContainer>
                        <FlexboxItem>
                            <ElectionChooser onElectionChanged={onElectionChanged} />
                        </FlexboxItem>
                        {showAutoComplete && (
                            <FlexboxPollingPlaceAutocompleteContainer>
                                <PollingPlaceAutocompleteContainer
                                    key={election.id}
                                    election={election}
                                    onPollingPlaceChosen={(pollingPlace: IPollingPlace) => {
                                        browserHistory.push(`/election/${election.id}/polling_places/${pollingPlace.id}/edit`)
                                    }}
                                />
                            </FlexboxPollingPlaceAutocompleteContainer>
                        )}
                    </FlexboxContainer>
                )}

                {showElectionChooser === false && showAutoComplete === true && (
                    <PollingPlaceAutocompleteContainer
                        key={election.id}
                        election={election}
                        onPollingPlaceChosen={(pollingPlace: IPollingPlace) => {
                            browserHistory.push(`/election/${election.id}/polling_places/${pollingPlace.id}/edit`)
                        }}
                    />
                )}

                {pollingPlace && <PollingPlaceInfoCardContainer election={election} pollingPlace={pollingPlace} />}

                {pollingPlace && (
                    <PollingPlaceFormContainer
                        election={election}
                        stall={stall}
                        pollingPlace={pollingPlace}
                        onPollingPlaceEdited={onPollingPlaceEdited}
                    />
                )}
            </div>
        )
    }
}
