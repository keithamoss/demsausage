import * as React from "react"
import { connect } from "react-redux"

import ElectionsManager from "./ElectionsManager"
import { IStore } from "../../redux/modules/interfaces"
import { IElection } from "../../redux/modules/elections"
import { getAPIBaseURL } from "../../redux/modules/app"
import { regenerateElectionGeoJSON } from "../../redux/modules/polling_places"

export interface IStoreProps {
    elections: Array<IElection>
}

export interface IDispatchProps {
    onDownloadElection: Function
    onRegenerateElectionGeoJSON: Function
}

export interface IStateProps {}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

export class ElectionsManagerContainer extends React.PureComponent<IStoreProps & IDispatchProps, IStateProps> {
    render() {
        const { elections, onDownloadElection, onRegenerateElectionGeoJSON } = this.props

        return (
            <ElectionsManager
                elections={elections}
                onDownloadElection={onDownloadElection}
                onRegenerateElectionGeoJSON={onRegenerateElectionGeoJSON}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { elections } = state

    return {
        elections: elections.elections,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        onDownloadElection(election: IElection) {
            window.location.href = `${getAPIBaseURL()}/api.php?download-election=1&electionId=${election.id}`
        },
        onRegenerateElectionGeoJSON(election: IElection) {
            dispatch(regenerateElectionGeoJSON(election))
        },
    }
}

const ElectionsManagerContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(ElectionsManagerContainer)

export default ElectionsManagerContainerWrapped
