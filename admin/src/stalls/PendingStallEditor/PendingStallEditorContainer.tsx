import * as React from "react"
import { connect } from "react-redux"
import { browserHistory } from "react-router"
import { IElection } from "../../redux/modules/elections"
import { IStore } from "../../redux/modules/reducer"
import { IStall, markStallAsDeclined, markStallAsRead, markStallAsReadAndAddPollingPlace } from "../../redux/modules/stalls"
import PendingStallEditor from "./PendingStallEditor"

export interface IProps {}
export interface IStoreProps {
    stall: IStall
    election: IElection
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

export class PendingStallEditorContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
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

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { stalls, elections } = state

    const stall: IStall = stalls.pending.find((stall: IStall) => stall.id === parseInt(ownProps.params.stallId, 10))!
    const election: IElection = elections.elections.find((election: IElection) => election.id === stall.elections_id)!

    return { stall: stall, election: election }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        onPollingPlaceEdited: async (id: number) => {
            const json = await dispatch(markStallAsRead(id))
            if (json.rows === 1) {
                browserHistory.push("/stalls")
            }
        },
        onApproveUnofficialStall: async (id: number) => {
            const json = await dispatch(markStallAsReadAndAddPollingPlace(id))
            if (json.rows === 1) {
                browserHistory.push("/stalls")
            }
        },
        onDeclineUnofficialStall: async (id: number) => {
            const json = await dispatch(markStallAsDeclined(id))
            if (json.rows === 1) {
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
