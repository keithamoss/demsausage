import * as React from "react"
import { connect } from "react-redux"

import PollingPlaceEditor from "./PollingPlaceEditor"
import { fetchPollingPlacesByIds } from "../../redux/modules/polling_places"
import { IStore, IElection, IPollingPlace } from "../../redux/modules/interfaces"

export interface IStoreProps {
    election: IElection
    pollingPlaceId: number | null
}

export interface IDispatchProps {
    fetchRequiredState: Function
}

export interface IStateProps {
    pollingPlace: IPollingPlace
}

interface IRouteProps {
    electionIdentifier: string
    pollingPlaceId?: number
}

interface IOwnProps {
    params: IRouteProps
}

export class PollingPlaceEditorContainer extends React.Component<IStoreProps & IDispatchProps, IStateProps> {
    constructor(props: IStoreProps & IDispatchProps & IRouteProps) {
        super(props)
    }

    async componentWillMount() {
        const { fetchRequiredState, election, pollingPlaceId } = this.props
        if (pollingPlaceId !== null) {
            this.setState({ pollingPlace: await fetchRequiredState(election, pollingPlaceId) })
        }
    }

    render() {
        const { election } = this.props

        if (this.state !== null) {
            return <PollingPlaceEditor election={election} pollingPlace={this.state.pollingPlace} />
        }
        return null
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
    return {
        fetchRequiredState: async (election: IElection, pollingPlaceId: number) => {
            const pollingPlaces: Array<IPollingPlace> = await dispatch(fetchPollingPlacesByIds(election, [pollingPlaceId]))
            if (pollingPlaces.length === 1) {
                return pollingPlaces[0]
            }
            // @TOOD Gracefully handle no polling place being returned
            return null
        },
    }
}

const PollingPlaceEditorContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(PollingPlaceEditorContainer)

export default PollingPlaceEditorContainerWrapped
