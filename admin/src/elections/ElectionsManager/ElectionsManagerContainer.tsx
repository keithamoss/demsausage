import * as React from "react"
import { connect } from "react-redux"

import ElectionsManager from "./ElectionsManager"
import { IStore, IElections } from "../../redux/modules/interfaces"
import { IElection } from "../../redux/modules/elections"
import { getAPIBaseURL } from "../../redux/modules/app"

export interface IStoreProps {
    elections: IElections;
}

export interface IDispatchProps { onDownloadElection: Function }

export interface IStateProps {}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps;
}

export class ElectionsManagerContainer extends React.PureComponent<IStoreProps & IDispatchProps, IStateProps> {
    render() {
        const { elections, onDownloadElection } = this.props

        return (
            <ElectionsManager
                elections={Object.keys(elections)
                    .map(k => elections[k])
                    .sort((a: IElection, b: IElection) => b.id - a.id)}
                onDownloadElection={onDownloadElection}
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
    }
}

const ElectionsManagerContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(ElectionsManagerContainer)

export default ElectionsManagerContainerWrapped
