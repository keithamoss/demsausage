import Avatar from "material-ui/Avatar"
import { ListItem } from "material-ui/List"
import { blue500 } from "material-ui/styles/colors"
import { AlertWarning } from "material-ui/svg-icons"
import * as React from "react"
import { connect } from "react-redux"
import { IElection } from "../../redux/modules/elections"
import { IPollingPlaceLoaderResponseMessages, loadPollingPlaces } from "../../redux/modules/polling_places"
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
    config: string | undefined
    dryRun: boolean
    error: boolean | undefined
    messages: IPollingPlaceLoaderResponseMessages | undefined
}

interface IRouteProps {
    electionIdentifier: string
}

interface IOwnProps {
    params: IRouteProps
}

type TComponentProps = IStoreProps & IDispatchProps & IOwnProps
export class ElectionPollingPlaceLoaderContainer extends React.PureComponent<TComponentProps, IStateProps> {
    constructor(props: any) {
        super(props)

        this.state = { file: undefined, config: undefined, dryRun: false, error: undefined, messages: undefined }
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
                    this.setState({ ...this.state, file: file })
                    loadPollingPlaces(election, file, this.state.config, this.state.dryRun, this)
                }}
                onConfigChange={(event: any, config: string) => {
                    try {
                        JSON.parse(config)
                        this.setState({ ...this.state, config: config })
                    } catch (e) {
                        // tslint:disable-next-line: no-console
                        console.error(e)
                    }
                }}
                onCheckDryRun={(event: any, isInputChecked: boolean) => {
                    this.setState({ ...this.state, dryRun: isInputChecked })
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: TComponentProps): IStoreProps => {
    const { elections } = state

    const electionId = parseInt(ownProps.params.electionIdentifier, 10)
    const getPendingStallsForCurrentElectionFilter = getPendingStallsForCurrentElection(state)

    return {
        election: elections.elections.find((election: IElection) => election.id === parseInt(ownProps.params.electionIdentifier, 10))!,
        pendingStallCount: getPendingStallsForCurrentElectionFilter(electionId).length,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        loadPollingPlaces: async (
            election: IElection,
            file: File,
            config: any,
            dryRun: boolean,
            that: ElectionPollingPlaceLoaderContainer
        ) => {
            const json = await dispatch(loadPollingPlaces(election, file, config, dryRun))
            that.setState({ ...that.state, error: "errors" in json.logs && json.logs.errors.length > 0 ? true : false, messages: json })
        },
    }
}

const ElectionPollingPlaceLoaderContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(ElectionPollingPlaceLoaderContainer)

export default ElectionPollingPlaceLoaderContainerWrapped
