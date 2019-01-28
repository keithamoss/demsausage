import * as React from "react"
import { connect } from "react-redux"
import { IElection } from "../../redux/modules/elections"
import { IStore } from "../../redux/modules/reducer"
import Sausagelytics from "./Sausagelytics"

export interface IProps {}

export interface IDispatchProps {}

export interface IStoreProps {
    currentElection: IElection
}

export interface IStateProps {}

type TComponentProps = IProps & IStoreProps & IDispatchProps
export class SausagelyticsContainer extends React.Component<TComponentProps, IStateProps> {
    static muiName = "SausagelyticsContainer"
    static pageTitle = "Democracy Sausage | Charts, graphs, and data!"
    static pageBaseURL = "/sausagelytics"

    constructor(props: any) {
        super(props)
        this.state = {}
    }

    render() {
        const { currentElection } = this.props

        return <Sausagelytics currentElection={currentElection} />
    }
}

const mapStateToProps = (state: IStore): IStoreProps => {
    const { elections } = state

    return {
        currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
    }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {}
}

const SausagelyticsContainerWrapped = connect(
    mapStateToProps,
    mapDispatchToProps
)(SausagelyticsContainer)

export default SausagelyticsContainerWrapped
