import Avatar from "material-ui/Avatar"
import { ListItem } from "material-ui/List"
import { blue500 } from "material-ui/styles/colors"
import { AlertWarning } from "material-ui/svg-icons"
import * as React from "react"
import { connect } from "react-redux"
import { IElection, setElectionTableName } from "../../redux/modules/elections"
import { IPollingPlaceLoaderResponse, IPollingPlaceLoaderResponseMessage, loadPollingPlaces } from "../../redux/modules/polling_places"
import { IStore } from "../../redux/modules/reducer"
import { getPendingStallsForCurrentElection } from "../../redux/modules/stalls"
import ElectionPollingPlaceLoader from "./ElectionPollingPlaceLoader"

export interface IStoreProps {
    election: IElection
    pendingStallCount: number
}

export interface IDispatchProps {
    loadPollingPlaces: Function
}

export interface IStateProps {
    file: File | undefined
    error: boolean | undefined
    messages: Array<IPollingPlaceLoaderResponseMessage>
}

interface IRouteProps {
    electionIdentifier: string
}

interface IOwnProps {
    params: IRouteProps
}

export class ElectionPollingPlaceLoaderContainer extends React.PureComponent<IStoreProps & IDispatchProps, IStateProps> {
    constructor(props: any) {
        super(props)

        this.state = { file: undefined, error: undefined, messages: [] }
    }

    render() {
        const { election, pendingStallCount, loadPollingPlaces } = this.props

        if (pendingStallCount > 0) {
            return (
                <ListItem
                    leftAvatar={<Avatar icon={<AlertWarning />} backgroundColor={blue500} />}
                    primaryText={"Notice"}
                    secondaryText={"Polling places can't be loaded until all pending stalls have been approved."}
                    secondaryTextLines={2}
                    disabled={true}
                />
            )
        }

        return (
            <ElectionPollingPlaceLoader
                election={election}
                file={this.state.file}
                error={this.state.error}
                messages={this.state.messages}
                onFileUpload={(file: File) => {
                    this.setState({ file: file })
                    loadPollingPlaces(election, file, this)
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { elections, stalls } = state

    return {
        election: elections.elections.find((election: IElection) => election.id === parseInt(ownProps.params.electionIdentifier, 10))!,
        pendingStallCount: getPendingStallsForCurrentElection(stalls, parseInt(ownProps.params.electionIdentifier, 10)).length,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        loadPollingPlaces: async (election: IElection, file: File, that: ElectionPollingPlaceLoaderContainer) => {
            const response: IPollingPlaceLoaderResponse = await dispatch(loadPollingPlaces(election, file))
            that.setState({ error: response.error, messages: response.messages })
            if (response.error === false) {
                dispatch(setElectionTableName(election, response.table_name))
            }
        },
    }
}

const ElectionPollingPlaceLoaderContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(ElectionPollingPlaceLoaderContainer)

export default ElectionPollingPlaceLoaderContainerWrapped
