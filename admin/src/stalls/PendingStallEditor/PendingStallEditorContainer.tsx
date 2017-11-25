import * as React from "react"
import { connect } from "react-redux"

import PendingStallEditor from "./PendingStallEditor"
// import { fetchPendingStalls } from "../../redux/modules/stalls"
import { IStore, IStall } from "../../redux/modules/interfaces"

export interface IProps {
    stall: IStall
}
export interface IStoreProps {}

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
        const { stall } = this.props

        return <PendingStallEditor stall={stall} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { stalls } = state

    const filteredStall: Array<IStall> = stalls.pending.filter(
        (stall: IStall) => stall.cartodb_id === parseInt(ownProps.params.stallId, 10)
    )

    return { stall: filteredStall[0] }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const PendingStallEditorContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(PendingStallEditorContainer)

export default PendingStallEditorContainerWrapped
