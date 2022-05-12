import * as React from 'react'
import { connect } from 'react-redux'
import { IElection } from '../../redux/modules/elections'
import { IStore } from '../../redux/modules/reducer'
import { IPendingStall } from '../../redux/modules/stalls'
import PendingStallsManager from './PendingStallsManager'

interface IProps {}

interface IStoreProps {
  stalls: Array<IPendingStall>
  elections: Array<IElection>
}

interface IDispatchProps {}

interface IStateProps {}

type TComponentProps = IStoreProps & IDispatchProps
class PendingStallsManagerContainer extends React.Component<TComponentProps, IStateProps> {
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

const mapDispatchToProps = (_dispatch: Function): IDispatchProps => {
  return {}
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(PendingStallsManagerContainer)
