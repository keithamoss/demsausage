import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { IElection } from "../../redux/modules/elections"
import { IStore } from "../../redux/modules/reducer"
import PollingPlaceEditorContainer from "./PollingPlaceEditorContainer"

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

type TComponentProps = IStoreProps & IDispatchProps & IOwnProps
export class PollingPlaceEditorContainerRoute extends React.Component<TComponentProps, IStateProps> {
    render() {
        const { election, pollingPlaceId } = this.props

        return (
            <PollingPlaceEditorContainer
                election={election}
                pollingPlaceId={pollingPlaceId}
                showAutoComplete={true}
                showElectionChooser={true}
                onPollingPlaceEdited={() => {
                    browserHistory.push(`/election/${election.id}/polling_places`)
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { elections } = state

    return {
        election: elections.elections.find((election: IElection) => election.id === parseInt(ownProps.params.electionIdentifier, 10))!,
        pollingPlaceId: ownProps.params.pollingPlaceId || null,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const PollingPlaceEditorContainerRouteWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(PollingPlaceEditorContainerRoute)

export default PollingPlaceEditorContainerRouteWrapped
