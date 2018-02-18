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
}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

export class SausageMapContainer extends React.PureComponent<IStoreProps & IDispatchProps, IStateProps> {
    constructor(props: any) {
        super(props)

        this.state = { queriedPollingPlaces: [] }

        this.onSetQueriedPollingPlaces = this.onSetQueriedPollingPlaces.bind(this)
        this.onClearQueriedPollingPlaces = this.onClearQueriedPollingPlaces.bind(this)
    }

    onSetQueriedPollingPlaces(pollingPlaces: Array<IPollingPlace>) {
        this.setState({ queriedPollingPlaces: pollingPlaces })
    }

    onClearQueriedPollingPlaces() {
        this.setState({ queriedPollingPlaces: [] })
    }

    render() {
        const { currentElection, fetchQueriedPollingPlaces } = this.props
        const { queriedPollingPlaces } = this.state

        return (
            <SausageMap
                election={currentElection}
                queriedPollingPlaces={queriedPollingPlaces}
                onQueryMap={async (features: Array<IMapPollingPlace>) => {
                    const pollingPlaceIds: Array<number> = features.map((feature: IMapPollingPlace) => feature.id)
                    const pollingPlaces = await fetchQueriedPollingPlaces(currentElection, pollingPlaceIds)
                    this.onSetQueriedPollingPlaces(pollingPlaces)
                }}
                onCloseQueryMapDialog={() => this.onClearQueriedPollingPlaces()}
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
    return {
        fetchQueriedPollingPlaces: async (election: IElection, pollingPlaceIds: Array<number>) => {
            return await dispatch(fetchPollingPlacesByIds(election, pollingPlaceIds))
        },
    }
}

const SausageMapContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(SausageMapContainer)

export default SausageMapContainerWrapped
