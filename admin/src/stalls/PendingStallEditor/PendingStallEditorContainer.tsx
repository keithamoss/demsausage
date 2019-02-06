import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { IElection } from "../../redux/modules/elections"
import { IStore } from "../../redux/modules/reducer"
import { approveStall, approveStallAndAddUnofficialPollingPlace, declineStall, IStall } from "../../redux/modules/stalls"
import PendingStallEditor from "./PendingStallEditor"

export interface IProps {}
export interface IStoreProps {
    stall: IStall | null
    election: IElection | null
}

export interface IDispatchProps {
    onPollingPlaceEdited: Function
    onApproveUnofficialStall: Function
    onDeclineUnofficialStall: Function
}

export interface IStateProps {}

interface IRouteProps {
    stallId: string
}

interface IOwnProps {
    params: IRouteProps
}

type TComponentProps = IProps & IStoreProps & IDispatchProps & IOwnProps
export class PendingStallEditorContainer extends React.Component<TComponentProps, IStateProps> {
    render() {
        const { stall, election, onPollingPlaceEdited, onApproveUnofficialStall, onDeclineUnofficialStall } = this.props

        if (stall === null || election === null) {
            return null
        }

        return (
            <PendingStallEditor
                election={election}
                stall={stall}
                onPollingPlaceEdited={() => {
                    onPollingPlaceEdited(stall.id)
                }}
                onApproveUnofficialStall={() => {
                    onApproveUnofficialStall(stall.id)
                }}
                onDeclineUnofficialStall={() => {
                    onDeclineUnofficialStall(stall.id)
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore, ownProps: TComponentProps): IStoreProps => {
    const { stalls, elections } = state

    const stall = stalls.pending.find((stall: IStall) => stall.id === parseInt(ownProps.params.stallId, 10))!
    const election = stall !== undefined ? elections.elections.find((election: IElection) => election.id === stall.election_id)! : null

    return { stall: stall, election: election }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        onPollingPlaceEdited: async (id: number) => {
            const json = await dispatch(approveStall(id))
            if (json) {
                browserHistory.push("/stalls")
            }
        },
        onApproveUnofficialStall: async (id: number) => {
            const json = await dispatch(approveStallAndAddUnofficialPollingPlace(id))
            if (json) {
                browserHistory.push("/stalls")
            }
        },
        onDeclineUnofficialStall: async (id: number) => {
            const json = await dispatch(declineStall(id))
            if (json) {
                browserHistory.push("/stalls")
            }
        },
    }
}

const PendingStallEditorContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(PendingStallEditorContainer)

export default PendingStallEditorContainerWrapped
