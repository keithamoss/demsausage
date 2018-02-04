import * as React from "react"
import { connect } from "react-redux"

import SausageMap from "./SausageMap"
import { IStore, IElection } from "../../redux/modules/interfaces"

export interface IStoreProps {
    currentElection: IElection
}

export interface IDispatchProps {}

export interface IStateProps {}

interface IRouteProps {}

interface IOwnProps {
    params: IRouteProps
}

export class SausageMapContainer extends React.PureComponent<IStoreProps & IDispatchProps, IStateProps> {
    render() {
        const { currentElection } = this.props

        return <SausageMap election={currentElection} />
    }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
    const { elections } = state

    return {
        currentElection: elections.elections[elections.current_election_id],
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const SausageMapContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(SausageMapContainer)

export default SausageMapContainerWrapped
