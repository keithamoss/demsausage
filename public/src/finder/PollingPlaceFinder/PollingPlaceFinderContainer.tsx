import * as React from "react"
import { connect } from "react-redux"

import PollingPlaceFinder from "./PollingPlaceFinder"
import { IStore, IElection } from "../../redux/modules/interfaces"

export interface IStoreProps {
    currentElection: IElection
}

export interface IDispatchProps {}

export interface IStateProps {
    results: Array<any>
}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

export class PollingPlaceFinderContainer extends React.PureComponent<IStoreProps & IDispatchProps, IStateProps> {
    onReceiveSearchResults: Function

    constructor(props: any) {
        super(props)
        this.state = { results: [] }

        this.onReceiveSearchResults = this.onReceiveAddressSearchResults.bind(this)
    }

    onReceiveAddressSearchResults(results: any) {
        this.setState({ results: results })
    }

    render() {
        const { currentElection } = this.props

        return (
            <PollingPlaceFinder
                election={currentElection}
                onReceiveAddressSearchResults={this.onReceiveSearchResults}
                addressSearchResults={this.state.results}
            />
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

const PollingPlaceFinderContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(PollingPlaceFinderContainer)

export default PollingPlaceFinderContainerWrapped
