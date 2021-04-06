import * as React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { IElection } from '../../redux/modules/elections'
import { IStore } from '../../redux/modules/reducer'
import {
  approveStall,
  approveStallAndAddUnofficialPollingPlace,
  declineStall,
  IPendingStall,
} from '../../redux/modules/stalls'
import PendingStallEditor from './PendingStallEditor'

interface IRouteProps {
  stallId: string
}

interface IOwnProps {
  params: IRouteProps
}

interface IProps extends IOwnProps {}

interface IStoreProps {
  stall: IPendingStall | null
  election: IElection | null
}

interface IDispatchProps {
  onPollingPlaceEdited: Function
  onApproveUnofficialStall: Function
  onDeclineUnofficialStall: Function
}

interface IStateProps {}

type TComponentProps = IProps & IStoreProps & IDispatchProps & IOwnProps
class PendingStallEditorContainer extends React.Component<TComponentProps, IStateProps> {
  render() {
    const { stall, election, onPollingPlaceEdited, onApproveUnofficialStall, onDeclineUnofficialStall } = this.props

    if (stall === null || election === null) {
      return null
    }

    return (
      <PendingStallEditor
        election={election}
        stall={stall}
        onPollingPlaceEdited={() => {
          onPollingPlaceEdited(stall.id)
        }}
        onApproveUnofficialStall={() => {
          onApproveUnofficialStall(stall.id)
        }}
        onDeclineUnofficialStall={() => {
          onDeclineUnofficialStall(stall.id)
        }}
      />
    )
  }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
  const { stalls, elections } = state

  const stall = stalls.pending.find((s: IPendingStall) => s.id === parseInt(ownProps.params.stallId, 10))!
  const election = stall !== undefined ? elections.elections.find((e: IElection) => e.id === stall.election_id)! : null

  return { stall, election }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
  return {
    onPollingPlaceEdited: async (id: number) => {
      const json = await dispatch(approveStall(id))
      if (json) {
        browserHistory.push('/stalls')
      }
    },
    onApproveUnofficialStall: async (id: number) => {
      const json = await dispatch(approveStallAndAddUnofficialPollingPlace(id))
      if (json) {
        browserHistory.push('/stalls')
      }
    },
    onDeclineUnofficialStall: async (id: number) => {
      const json = await dispatch(declineStall(id))
      if (json) {
        browserHistory.push('/stalls')
      }
    },
  }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(PendingStallEditorContainer)
