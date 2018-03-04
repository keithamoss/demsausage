import * as React from "react"
import { connect } from "react-redux"

import SausageMap from "./SausageMap"
import { IStore, IElection, IMapPollingPlace, IPollingPlace } from "../../redux/modules/interfaces"

import { fetchPollingPlacesByIds } from "../../redux/modules/polling_places"

export interface IStoreProps {
    currentElection: IElection
}

export interface IDispatchProps {
    fetchQueriedPollingPlaces: Function
}

export interface IStateProps {
    queriedPollingPlaces: Array<IPollingPlace>
    hasSeenElectionAnnouncement: boolean
}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

export class SausageMapContainer extends React.Component<IStoreProps & IDispatchProps, IStateProps> {
    constructor(props: any) {
        super(props)

        this.state = { queriedPollingPlaces: [], hasSeenElectionAnnouncement: false }

        this.onSetQueriedPollingPlaces = this.onSetQueriedPollingPlaces.bind(this)
        this.onClearQueriedPollingPlaces = this.onClearQueriedPollingPlaces.bind(this)
        this.onElectionAnnounceClose = this.onElectionAnnounceClose.bind(this)
    }

    onSetQueriedPollingPlaces(pollingPlaces: Array<IPollingPlace>) {
        this.setState(Object.assign(this.state, { queriedPollingPlaces: pollingPlaces }))
    }

    onClearQueriedPollingPlaces() {
        this.setState(Object.assign(this.state, { queriedPollingPlaces: [] }))
    }

    onElectionAnnounceClose() {
        this.setState(Object.assign(this.state, { hasSeenElectionAnnouncement: true }))
    }

    render() {
        const { currentElection, fetchQueriedPollingPlaces } = this.props
        const { queriedPollingPlaces, hasSeenElectionAnnouncement } = this.state

        return (
            <SausageMap
                election={currentElection}
                queriedPollingPlaces={queriedPollingPlaces}
                hasSeenElectionAnnouncement={hasSeenElectionAnnouncement}
                onQueryMap={async (features: Array<IMapPollingPlace>) => {
                    const pollingPlaceIds: Array<number> = features.map((feature: IMapPollingPlace) => feature.id)
                    const pollingPlaces = await fetchQueriedPollingPlaces(currentElection, pollingPlaceIds)
                    this.onSetQueriedPollingPlaces(pollingPlaces)
                }}
                onCloseQueryMapDialog={() => this.onClearQueriedPollingPlaces()}
                onElectionAnnounceClose={() => this.onElectionAnnounceClose()}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { elections } = state

    return {
        currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        fetchQueriedPollingPlaces: async (election: IElection, pollingPlaceIds: Array<number>) => {
            return await dispatch(fetchPollingPlacesByIds(election, pollingPlaceIds))
        },
    }
}

const SausageMapContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(SausageMapContainer)

export default SausageMapContainerWrapped
