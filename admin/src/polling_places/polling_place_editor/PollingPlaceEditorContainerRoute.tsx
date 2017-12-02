import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"

import PollingPlaceEditorContainer from "./PollingPlaceEditorContainer"
import { IStore, IElection } from "../../redux/modules/interfaces"

export interface IStoreProps {
    election: IElection
    pollingPlaceId: number | null
}

export interface IDispatchProps {}

export interface IStateProps {}

interface IRouteProps {
    electionIdentifier: string
    pollingPlaceId?: number
}

interface IOwnProps {
    params: IRouteProps
}

export class PollingPlaceEditorContainerRoute extends React.Component<IStoreProps & IDispatchProps, IStateProps> {
    render() {
        const { election, pollingPlaceId } = this.props

        return (
            <PollingPlaceEditorContainer
                election={election}
                pollingPlaceId={pollingPlaceId}
                showAutoComplete={true}
                onPollingPlaceEdited={() => {
                    browserHistory.push(`/election/${election.db_table_name}/`)
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { elections } = state

    return {
        election: elections.elections[ownProps.params.electionIdentifier],
        pollingPlaceId: ownProps.params.pollingPlaceId || null,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const PollingPlaceEditorContainerRouteWrapped = connect(mapStateToProps, mapDispatchToProps)(PollingPlaceEditorContainerRoute)

export default PollingPlaceEditorContainerRouteWrapped
