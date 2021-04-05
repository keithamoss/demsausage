import * as React from 'react'
import { connect } from 'react-redux'
import { IStore } from '../../redux/modules/reducer'
import { IPendingStall } from '../../redux/modules/stalls'
import StallInfoCard from './StallInfoCard'

interface IProps {
  stall: IPendingStall
  cardActions?: any
}

interface IDispatchProps {}

interface IStoreProps {}

interface IStateProps {}

class StallInfoCardContainer extends React.PureComponent<IProps & IDispatchProps, IStateProps> {
  render() {
    const { stall, cardActions } = this.props

    return <StallInfoCard stall={stall} cardActions={cardActions} />
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
)(StallInfoCardContainer)
