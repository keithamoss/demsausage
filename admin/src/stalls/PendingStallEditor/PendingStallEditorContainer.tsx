import * as React from "react"
import { connect } from "react-redux"

import PendingStallEditor from "./PendingStallEditor"
// import { fetchPendingStalls } from "../../redux/modules/stalls"
import { IStore, IStall, IElection } from "../../redux/modules/interfaces"

export interface IProps {}
export interface IStoreProps {
    stall: IStall
    election: IElection
}

export interface IDispatchProps {}

export interface IStateProps {}

interface IRouteProps {
    stallId: string
}

interface IOwnProps {
    params: IRouteProps
}

export class PendingStallEditorContainer extends React.Component<IProps & IStoreProps & IDispatchProps, IStateProps> {
    render() {
        const { stall, election } = this.props

        return <PendingStallEditor election={election} stall={stall} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { stalls, elections } = state

    // Sorry.
    const filteredStall: Array<IStall> = stalls.pending.filter(
        (stall: IStall) => stall.cartodb_id === parseInt(ownProps.params.stallId, 10)
    )
    const filteredElection: Array<string> = Object.keys(elections.elections).filter(
        (key: string) => elections.elections[key].cartodb_id === filteredStall[0].elections_cartodb_id
    )

    return { stall: filteredStall[0], election: elections.elections[filteredElection[0]] }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const PendingStallEditorContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(PendingStallEditorContainer)

export default PendingStallEditorContainerWrapped
