import * as React from 'react'
import { connect } from 'react-redux'
import { IElection } from '../../redux/modules/elections'
import { IPollingPlace } from '../../redux/modules/polling_places'
import { IStore } from '../../redux/modules/reducer'
import PollingPlaceInfoCard from './PollingPlaceInfoCard'

interface IProps {
  election: IElection
  pollingPlace: IPollingPlace
}

interface IDispatchProps {}

interface IStoreProps {}

interface IStateProps {}

class PollingPlaceInfoCardContainer extends React.PureComponent<IProps & IDispatchProps, IStateProps> {
  render() {
    const { election, pollingPlace } = this.props

    return <PollingPlaceInfoCard election={election} pollingPlace={pollingPlace} />
  }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
  return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
  return {}
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(PollingPlaceInfoCardContainer)
