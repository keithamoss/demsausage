import * as React from "react"
import { connect } from "react-redux"

import PollingPlaceEditor from "./PollingPlaceEditor"
import { fetchPollingPlacesByIds } from "../../redux/modules/polling_places"
import { IStore, IElection, IPollingPlace } from "../../redux/modules/interfaces"

export interface IProps {
    election: IElection
    pollingPlaceId: number | null
}
export interface IStoreProps {}

export interface IDispatchProps {
    fetchRequiredState: Function
}

export interface IStateProps {
    pollingPlace?: IPollingPlace
}

interface IOwnProps {}

export class PollingPlaceEditorContainer extends React.Component<IProps & IDispatchProps, IStateProps> {
    async componentWillMount() {
        const { fetchRequiredState, election, pollingPlaceId } = this.props

        if (pollingPlaceId !== null) {
            this.setState({ pollingPlace: await fetchRequiredState(election, pollingPlaceId) })
        }
    }

    async componentWillReceiveProps(nextProps: any) {
        const { fetchRequiredState, election, pollingPlaceId } = nextProps

        if (pollingPlaceId !== null) {
            this.setState({ pollingPlace: await fetchRequiredState(election, pollingPlaceId) })
        } else if (pollingPlaceId === null) {
            await this.setState({ pollingPlace: undefined })
        }
    }

    render() {
        const { election } = this.props
        const pollingPlace: any = this.state !== null && this.state.pollingPlace !== null ? this.state.pollingPlace : null

        return <PollingPlaceEditor election={election} pollingPlace={pollingPlace} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    // const { elections } = state

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
    }
}

const PollingPlaceEditorContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(PollingPlaceEditorContainer)

export default PollingPlaceEditorContainerWrapped
