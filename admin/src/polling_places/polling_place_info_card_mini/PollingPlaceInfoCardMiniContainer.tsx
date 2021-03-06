import * as React from 'react'
import { connect } from 'react-redux'
import { IPollingPlace } from '../../redux/modules/polling_places'
import { IStore } from '../../redux/modules/reducer'
import PollingPlaceInfoCardMini from './PollingPlaceInfoCardMini'

interface IProps {
  pollingPlace: IPollingPlace
}

interface IDispatchProps {}

interface IStoreProps {}

interface IStateProps {}

class PollingPlaceInfoCardMiniContainer extends React.PureComponent<IProps & IDispatchProps, IStateProps> {
  render() {
    const { pollingPlace } = this.props

    return <PollingPlaceInfoCardMini pollingPlace={pollingPlace} />
  }
}

const mapStateToProps = (_state: IStore, _ownProps: IProps): IStoreProps => {
  return {}
}

const mapDispatchToProps = (_dispatch: Function): IDispatchProps => {
  return {}
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(PollingPlaceInfoCardMiniContainer)
