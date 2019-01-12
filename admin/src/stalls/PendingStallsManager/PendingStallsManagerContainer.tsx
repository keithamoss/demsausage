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

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

export class PendingStallsManagerContainer extends React.Component<IStoreProps & IDispatchProps, IStateProps> {
    render() {
        const { stalls, elections } = this.props

        return <PendingStallsManager stalls={stalls} elections={elections} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
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
