import * as React from "react"
import styled from "styled-components"
import { browserHistory } from "react-router"
import PollingPlaceAutocompleteContainer from "../polling_place_autocomplete/PollingPlaceAutocompleteContainer"
import PollingPlaceInfoCardContainer from "../polling_place_info_card/PollingPlaceInfoCardContainer"
import PollingPlaceFormContainer from "../polling_place_form/PollingPlaceFormContainer"
import ElectionChooser from "../../elections/ElectionChooser/ElectionChooserContainer"
import { IElection, IPollingPlace, IStall } from "../../redux/modules/interfaces"
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
    onPollingPlaceEdited: Function
    onElectionChanged: Function
}

class PollingPlaceEditor extends React.PureComponent<IProps, {}> {
    render() {
        const { election, pollingPlace, stall, showAutoComplete, onPollingPlaceEdited, onElectionChanged } = this.props

        return (
            <div>
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

export default PollingPlaceEditor
