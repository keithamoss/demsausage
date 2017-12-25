import * as React from "react"
import { connect } from "react-redux"

import ElectionPollingPlaceLoader from "./ElectionPollingPlaceLoader"
import {
  IStore,
  IElection,
  IPollingPlaceLoaderResponse,
  IPollingPlaceLoaderResponseMessage as IMessage,
} from "../../redux/modules/interfaces"
import { loadPollingPlaces } from "../../redux/modules/polling_places"
import { setElectionTableName } from "../../redux/modules/elections"

export interface IStoreProps {
  election: IElection
}

export interface IDispatchProps {
  loadPollingPlaces: Function
}

export interface IStateProps {
  file: File | undefined
  error: boolean | undefined
  messages: Array<IMessage>
}

interface IRouteProps {
  electionIdentifier: string
}

interface IOwnProps {
  params: IRouteProps
}

export class ElectionPollingPlaceLoaderContainer extends React.PureComponent<IStoreProps & IDispatchProps, IStateProps> {
  constructor(props: any) {
    super(props)

    this.state = { file: undefined, error: undefined, messages: [] }
  }

  render() {
    const { election, loadPollingPlaces } = this.props

    return (
      <ElectionPollingPlaceLoader
        election={election}
        file={this.state.file}
        error={this.state.error}
        messages={this.state.messages}
        onFileUpload={(file: File) => {
          this.setState({ file: file })
          loadPollingPlaces(election, file, this)
        }}
      />
    )
  }
}

const mapStateToProps = (state: IStore, ownProps: IOwnProps): IStoreProps => {
  const { elections } = state

  let election: IElection | null = null
  if (ownProps.params.electionIdentifier !== null) {
    // Sorry.
    const filteredElection: Array<string> = Object.keys(elections.elections).filter(
      (key: string) => elections.elections[key].id === parseInt(ownProps.params.electionIdentifier, 10)
    )
    election = elections.elections[filteredElection[0]]
  }

  return {
    election: election!,
  }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
  return {
    loadPollingPlaces: async (election: IElection, file: File, that: ElectionPollingPlaceLoaderContainer) => {
      const response: IPollingPlaceLoaderResponse = await dispatch(loadPollingPlaces(election, file))
      that.setState({ error: response.error, messages: response.messages })
      if (response.error === false) {
        dispatch(setElectionTableName(election, response.table_name))
      }
    },
  }
}

const ElectionPollingPlaceLoaderContainerWrapped = connect(mapStateToProps, mapDispatchToProps)(ElectionPollingPlaceLoaderContainer)

export default ElectionPollingPlaceLoaderContainerWrapped
