import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { IElection } from "../../redux/modules/elections"
import { IStore } from "../../redux/modules/reducer"
import PollingPlaceEditorContainer from "./PollingPlaceEditorContainer"

interface IRouteProps {
    electionIdentifier: string
    pollingPlaceId?: number
}

interface IOwnProps {
    params: IRouteProps
}

interface IProps extends IOwnProps {}

export interface IStoreProps {
    election: IElection
    pollingPlaceId: number | null
}

export interface IDispatchProps {}

export interface IStateProps {}

type TComponentProps = IStoreProps & IDispatchProps & IOwnProps
class PollingPlaceEditorContainerRoute extends React.Component<TComponentProps, IStateProps> {
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

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
    const { elections } = state

    return {
        election: elections.elections.find((election: IElection) => election.id === parseInt(ownProps.params.electionIdentifier, 10))!,
        pollingPlaceId: ownProps.params.pollingPlaceId || null,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
    mapStateToProps,
    mapDispatchToProps
)(PollingPlaceEditorContainerRoute)
