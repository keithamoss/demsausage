import * as React from "react"
import { connect } from "react-redux"

import PendingStallsManager from "./PendingStallsManager"
import { getPendingStallsForCurrentElection } from "../../redux/modules/stalls"
import { IStore, IStall } from "../../redux/modules/interfaces"

export interface IStoreProps {
    stalls: Array<IStall>
}

export interface IDispatchProps {}

export interface IStateProps {}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

export class PendingStallsManagerContainer extends React.Component<IStoreProps & IDispatchProps, IStateProps> {
    render() {
        const { stalls } = this.props

        return <PendingStallsManager stalls={stalls} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { stalls, elections } = state

    return {
        stalls: getPendingStallsForCurrentElection(stalls, elections),
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const PendingStallsManagerContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(PendingStallsManagerContainer)

export default PendingStallsManagerContainerWrapped
