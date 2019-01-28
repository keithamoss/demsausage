import * as React from "react"
import { connect } from "react-redux"
import { IElection } from "../../redux/modules/elections"
import { IStore } from "../../redux/modules/reducer"
import { IStall } from "../../redux/modules/stalls"
import PendingStallsManager from "./PendingStallsManager"

export interface IStoreProps {
    stalls: Array<IStall>
    elections: Array<IElection>
}

export interface IDispatchProps {}

export interface IStateProps {}

type TComponentProps = IStoreProps & IDispatchProps
export class PendingStallsManagerContainer extends React.Component<TComponentProps, IStateProps> {
    render() {
        const { stalls, elections } = this.props

        return <PendingStallsManager stalls={stalls} elections={elections} />
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { elections, stalls } = state

    return {
        stalls: stalls.pending,
        elections: elections.elections,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const PendingStallsManagerContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(PendingStallsManagerContainer)

export default PendingStallsManagerContainerWrapped
