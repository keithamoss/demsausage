import * as React from 'react'
import { connect } from 'react-redux'
import { fetchElectionStats, IElection, ISausagelyticsStats } from '../../redux/modules/elections'
import { IStore } from '../../redux/modules/reducer'
import Sausagelytics from './Sausagelytics'

interface IProps {}

interface IDispatchProps {
  fetchStats: Function
}

interface IStoreProps {
  currentElection: IElection
}

interface IStateProps {
  stats: ISausagelyticsStats | undefined
}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class SausagelyticsContainer extends React.Component<TComponentProps, IStateProps> {
  static muiName = 'SausagelyticsContainer'

  static pageTitle = 'Democracy Sausage | Charts, graphs, and data!'

  static pageBaseURL = '/sausagelytics'

  private fetchStats: Function

  constructor(props: TComponentProps) {
    super(props)

    this.state = { stats: undefined }

    this.fetchStats = (election: IElection) => props.fetchStats(election)
  }

  async UNSAFE_componentWillMount() {
    const { currentElection } = this.props

    if (currentElection !== undefined) {
      this.setState({ stats: await this.fetchStats(currentElection) })
    }
  }

  render() {
    const { currentElection } = this.props
    const { stats } = this.state

    if (stats === undefined || stats === null) {
      return null
    }

    return <Sausagelytics election={currentElection} stats={stats} />
  }
}

const mapStateToProps = (state: IStore): IStoreProps => {
  const { elections } = state

  return {
    currentElection: elections.elections.find((election: IElection) => election.id === elections.current_election_id)!,
  }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
  return {
    fetchStats: async (election: IElection) => {
      // eslint-disable-next-line @typescript-eslint/return-await
      return await dispatch(fetchElectionStats(election))
    },
  }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(SausagelyticsContainer)
