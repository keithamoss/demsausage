import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"

import SausageMap from "./SausageMap"
import { IStore, IElection, IMapPollingPlace, IPollingPlace } from "../../redux/modules/interfaces"

import { fetchPollingPlacesByIds } from "../../redux/modules/polling_places"
import { setCurrentElection, getURLSafeElectionName } from "../../redux/modules/elections"

export interface IStoreProps {
    elections: Array<IElection>
    currentElection: IElection
    defaultElection: IElection
}

export interface IDispatchProps {
    onChooseElection: Function
    onChangeElection: Function
    fetchQueriedPollingPlaces: Function
}

export interface IStateProps {
    isElectionChooserOpen: boolean
    queriedPollingPlaces: Array<IPollingPlace>
    hasSeenElectionAnnouncement: boolean
}

interface IRouteProps {
    electionName: string
}

interface IOwnProps {
    params: IRouteProps
}

export class SausageMapContainer extends React.Component<IStoreProps & IDispatchProps & IOwnProps, IStateProps> {
    constructor(props: any) {
        super(props)

        this.state = { isElectionChooserOpen: false, queriedPollingPlaces: [], hasSeenElectionAnnouncement: false }

        this.onClickElectionChooser = this.onClickElectionChooser.bind(this)
        this.onCloseElectionChooserDialog = this.onCloseElectionChooserDialog.bind(this)
        this.onSetQueriedPollingPlaces = this.onSetQueriedPollingPlaces.bind(this)
        this.onClearQueriedPollingPlaces = this.onClearQueriedPollingPlaces.bind(this)
        this.onElectionAnnounceClose = this.onElectionAnnounceClose.bind(this)
    }

    componentDidMount() {
        const { currentElection } = this.props
        document.title = `Democracy Sausage | ${currentElection.name}`
    }

    componentWillReceiveProps(nextProps: any) {
        const { params } = this.props
        console.log("componentWillReceiveProps", params, nextProps.params)

        // Handle page navigate events between elections (Back/Forward)
        if (nextProps.params.electionName !== params.electionName) {
            const nextElection = nextProps.elections.find(
                (election: IElection) => getURLSafeElectionName(election) === nextProps.params.electionName
            )

            // We've navigated to a specific election
            if (nextElection !== undefined) {
                nextProps.onChangeElection(nextElection)
            } else {
                // We've navigated back to the root i.e. https://democracysausage.org
                nextProps.onChangeElection(nextProps.defaultElection)
            }
        }
    }

    onClickElectionChooser() {
        this.setState(Object.assign(this.state, { isElectionChooserOpen: true }))
    }

    onCloseElectionChooserDialog() {
        this.setState(Object.assign(this.state, { isElectionChooserOpen: false }))
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
        const { elections, currentElection, fetchQueriedPollingPlaces, onChooseElection } = this.props
        const { isElectionChooserOpen, queriedPollingPlaces, hasSeenElectionAnnouncement } = this.state

        return (
            <SausageMap
                elections={elections}
                currentElection={currentElection}
                queriedPollingPlaces={queriedPollingPlaces}
                hasSeenElectionAnnouncement={hasSeenElectionAnnouncement}
                onClickElectionChooser={this.onClickElectionChooser}
                isElectionChooserOpen={isElectionChooserOpen}
                onCloseElectionChooserDialog={this.onCloseElectionChooserDialog}
                onChooseElection={(election: IElection) => {
                    this.onCloseElectionChooserDialog()
                    onChooseElection(election)
                }}
                onChooseElectionTab={(electionId: number) => {
                    onChooseElection(elections.find((election: IElection) => election.id === electionId))
                }}
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
        elections: elections.elections,
        currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
        defaultElection: elections.elections.find((election: IElection) => election.id === elections.default_election_id)!,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        onChooseElection(election: IElection) {
            dispatch(setCurrentElection(election.id))
            browserHistory.push(getURLSafeElectionName(election))
            document.title = `Democracy Sausage | ${election.name}`
        },
        onChangeElection(election: IElection) {
            dispatch(setCurrentElection(election.id))
            document.title = `Democracy Sausage | ${election.name}`
        },
        fetchQueriedPollingPlaces: async (election: IElection, pollingPlaceIds: Array<number>) => {
            return await dispatch(fetchPollingPlacesByIds(election, pollingPlaceIds))
        },
    }
}

const SausageMapContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(SausageMapContainer)

export default SausageMapContainerWrapped
