import * as React from "react"
import { connect } from "react-redux"

import PollingPlaceEditor from "./PollingPlaceEditor"
import EmptyState from "../../shared/empty_state/EmptyState"
import { fetchPollingPlacesByIds } from "../../redux/modules/polling_places"
import { IStore, IElection, IPollingPlace } from "../../redux/modules/interfaces"

import CommunicationLocationOff from "material-ui/svg-icons/communication/location-off"

export interface IProps {
  election: IElection
  pollingPlaceId: number | null
  showAutoComplete: boolean
  onPollingPlaceEdited: Function
}
export interface IStoreProps {}

export interface IDispatchProps {
  fetchRequiredState: Function
}

export interface IStateProps {
  pollingPlace?: IPollingPlace
}

interface IOwnProps {}

export class PollingPlaceEditorContainer extends React.Component<IProps & IDispatchProps, IStateProps> {
  async componentWillMount() {
    const { fetchRequiredState, election, pollingPlaceId } = this.props

    if (pollingPlaceId !== null) {
      this.setState({ pollingPlace: await fetchRequiredState(election, pollingPlaceId) })
    }
  }

  async componentWillReceiveProps(nextProps: any) {
    const { fetchRequiredState, election, pollingPlaceId } = nextProps

    if (pollingPlaceId !== null) {
      this.setState({ pollingPlace: await fetchRequiredState(election, pollingPlaceId) })
    } else if (pollingPlaceId === null) {
      await this.setState({ pollingPlace: undefined })
    }
  }

  render() {
    const { election, showAutoComplete, onPollingPlaceEdited } = this.props
    const pollingPlace: any = this.state !== null && this.state.pollingPlace !== null ? this.state.pollingPlace : null

    if (election.db_table_name === "") {
      return (
        <EmptyState
          message={
            <div>
              We don't have any polling<br />places for this election yet :(
            </div>
          }
          icon={<CommunicationLocationOff />}
        />
      )
    }

    return (
      <PollingPlaceEditor
        election={election}
        pollingPlace={pollingPlace}
        showAutoComplete={showAutoComplete}
        onPollingPlaceEdited={onPollingPlaceEdited}
      />
    )
  }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
  // const { elections } = state

  return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
  return {
    fetchRequiredState: async (election: IElection, pollingPlaceId: number) => {
      const pollingPlaces: Array<IPollingPlace> = await dispatch(fetchPollingPlacesByIds(election, [pollingPlaceId]))
      if (pollingPlaces.length === 1) {
        return pollingPlaces[0]
      }
      // @TOOD Gracefully handle no polling place being returned
      return null
    },
  }
}

const PollingPlaceEditorContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(PollingPlaceEditorContainer)

export default PollingPlaceEditorContainerWrapped
