import * as React from "react"
import { connect } from "react-redux"
import { getAPIBaseURL } from "../../redux/modules/app"
import { IElection, setPrimaryElection } from "../../redux/modules/elections"
import { regenerateMapDataForElection } from "../../redux/modules/polling_places"
import { IStore } from "../../redux/modules/reducer"
import ElectionsManager from "./ElectionsManager"

export interface IStoreProps {
    elections: Array<IElection>
}

export interface IDispatchProps {
    onMakeElectionPrimary: Function
    onDownloadElection: Function
    onRegenerateMapDataForElection: Function
}

export interface IStateProps {}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

type TComponentProps = IStoreProps & IDispatchProps & IOwnProps
export class ElectionsManagerContainer extends React.PureComponent<TComponentProps, IStateProps> {
    render() {
        const { elections, onMakeElectionPrimary, onDownloadElection, onRegenerateMapDataForElection } = this.props

        return (
            <ElectionsManager
                elections={elections}
                onMakeElectionPrimary={onMakeElectionPrimary}
                onDownloadElection={onDownloadElection}
                onRegenerateMapDataForElection={onRegenerateMapDataForElection}
            />
        )
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { elections } = state

    return {
        elections: elections.elections,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        onMakeElectionPrimary(electionId: number) {
            dispatch(setPrimaryElection(electionId))
        },
        onDownloadElection(election: IElection) {
            window.location.href = `${getAPIBaseURL()}/0.1/polling_places/?format=csv&election_id=${election.id}`
        },
        onRegenerateMapDataForElection(election: IElection) {
            dispatch(regenerateMapDataForElection(election))
        },
    }
}

const ElectionsManagerContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(ElectionsManagerContainer)

export default ElectionsManagerContainerWrapped
