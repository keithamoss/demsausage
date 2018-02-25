import * as React from "react"
import { connect } from "react-redux"

import { IStore, IElection } from "../../redux/modules/interfaces"

import PollingPlaceAutocompleteContainer from "./PollingPlaceAutocompleteContainer"
import StallLocationCard from "../../add-stall/StallLocationCard/StallLocationCard"
import { IPollingPlace } from "../../redux/modules/interfaces"

export interface IProps {
    election: IElection
    onConfirmChosenLocation: Function
    onChoosePlace: Function
    autoFocus: boolean
    hintText: string
    onRequestSearch?: Function
}
export interface IStoreProps {
    currentElection: IElection
}

export interface IDispatchProps {}

export interface IStateProps {
    pollingPlaceInfo: IPollingPlace | null
    locationConfirmed: boolean
}

interface IOwnProps {}

export class PollingPlaceAutocompleteListWithConfirm extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    constructor(props: any) {
        super(props)
        this.state = { pollingPlaceInfo: null, locationConfirmed: false }

        this.onChoosePlace = this.onChoosePlace.bind(this)
        this.onCancelChosenLocation = this.onCancelChosenLocation.bind(this)
        this.onConfirmChosenLocation = this.onConfirmChosenLocation.bind(this)
    }

    onChoosePlace(pollingPlaceInfo: IPollingPlace) {
        this.setState(
            Object.assign(this.state, {
                pollingPlaceInfo: pollingPlaceInfo,
            })
        )
    }

    onCancelChosenLocation() {
        this.setState(Object.assign(this.state, { pollingPlaceInfo: null, locationConfirmed: false }))
    }

    onConfirmChosenLocation(pollingPlaceInfo: IPollingPlace) {
        this.setState(
            Object.assign(this.state, {
                locationConfirmed: true,
            })
        )
        this.props.onConfirmChosenLocation(this.state.pollingPlaceInfo!)
    }

    render() {
        const { election, autoFocus, hintText } = this.props
        const { pollingPlaceInfo, locationConfirmed } = this.state

        return (
            <div>
                {locationConfirmed === false &&
                    election.polling_places_loaded === true && (
                        <div>
                            <PollingPlaceAutocompleteContainer
                                election={election}
                                autoFocus={autoFocus}
                                hintText={hintText}
                                onPollingPlaceChosen={this.onChoosePlace}
                            />
                            <br />
                        </div>
                    )}

                {pollingPlaceInfo !== null && (
                    <StallLocationCard
                        stallLocationInfo={pollingPlaceInfo}
                        showActions={locationConfirmed === false}
                        onCancel={this.onCancelChosenLocation}
                        onConfirm={this.onConfirmChosenLocation}
                    />
                )}
            </div>
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { elections } = state

    return {
        currentElection: elections.elections[elections.current_election_id],
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const PollingPlaceAutocompleteListWithConfirmWrapped = connect(mapStateToProps, mapDispatchToProps)(PollingPlaceAutocompleteListWithConfirm)

export default PollingPlaceAutocompleteListWithConfirmWrapped as any
