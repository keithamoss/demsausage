import * as React from "react"
import { connect } from "react-redux"
import { IElection } from "../../redux/modules/elections"
import { IStore } from "../../redux/modules/reducer"
import Sausagelytics from "./Sausagelytics"

interface IProps {}

interface IDispatchProps {}

interface IStoreProps {
    currentElection: IElection
}

interface IStateProps {}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class SausagelyticsContainer extends React.Component<TComponentProps, IStateProps> {
    static muiName = "SausagelyticsContainer"
    static pageTitle = "Democracy Sausage | Charts, graphs, and data!"
    static pageBaseURL = "/sausagelytics"

    constructor(props: TComponentProps) {
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

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
    mapStateToProps,
    mapDispatchToProps
)(SausagelyticsContainer)
