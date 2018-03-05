import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"

import PollingPlaceEditor from "./PollingPlaceEditor"
import EmptyState from "../../shared/empty_state/EmptyState"
import { fetchPollingPlacesByIds } from "../../redux/modules/polling_places"
import { IStore, IElection, IPollingPlace, IStall } from "../../redux/modules/interfaces"

import CommunicationLocationOff from "material-ui/svg-icons/communication/location-off"

export interface IProps {
    election: IElection
    pollingPlaceId: number | null
    stall?: IStall
    showAutoComplete: boolean
    onPollingPlaceEdited: Function
}
export interface IStoreProps {}

export interface IDispatchProps {
    fetchRequiredState: Function
    onElectionChanged: Function
}

export interface IStateProps {
    pollingPlacesChecked: boolean
    pollingPlace?: IPollingPlace
}

interface IOwnProps {}

export class PollingPlaceEditorContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    constructor(props: IProps & IStoreProps & IDispatchProps) {
        super(props)

        this.state = { pollingPlacesChecked: false }
    }

    async componentWillMount() {
        const { fetchRequiredState, election, pollingPlaceId } = this.props

        if (pollingPlaceId !== null && election.db_table_name !== "") {
            this.setState({ pollingPlacesChecked: true, pollingPlace: await fetchRequiredState(election, pollingPlaceId) })
        }
    }

    async componentWillReceiveProps(nextProps: any) {
        const { fetchRequiredState, election, pollingPlaceId } = nextProps

        if (pollingPlaceId !== null) {
            this.setState({ pollingPlacesChecked: true, pollingPlace: await fetchRequiredState(election, pollingPlaceId) })
        } else if (pollingPlaceId === null) {
            await this.setState({ pollingPlacesChecked: true, pollingPlace: undefined })
        }
    }

    render() {
        const { election, stall, showAutoComplete, onPollingPlaceEdited, onElectionChanged } = this.props
        const pollingPlace: any = this.state !== null && this.state.pollingPlace !== null ? this.state.pollingPlace : null

        if (election.db_table_name === "" || (this.state.pollingPlacesChecked && this.state.pollingPlace === null)) {
            return <EmptyState message={<div>No polling place found.</div>} icon={<CommunicationLocationOff />} />
        }

        return (
            <PollingPlaceEditor
                election={election}
                pollingPlace={pollingPlace}
                stall={stall}
                showAutoComplete={showAutoComplete}
                onPollingPlaceEdited={onPollingPlaceEdited}
                onElectionChanged={onElectionChanged}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        fetchRequiredState: async (election: IElection, pollingPlaceId: number) => {
            const pollingPlaces: Array<IPollingPlace> = await dispatch(fetchPollingPlacesByIds(election, [pollingPlaceId]))
            if (pollingPlaces.length === 1) {
                return pollingPlaces[0]
            }
            // @TOOD Gracefully handle no polling place being returned
            return null
        },
        onElectionChanged: (electionId: number) => {
            browserHistory.push(`/election/${electionId}/polling_places/`)
        },
    }
}

const PollingPlaceEditorContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(PollingPlaceEditorContainer)

export default PollingPlaceEditorContainerWrapped
