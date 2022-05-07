import * as React from 'react'
import { connect } from 'react-redux'
import { IElection } from '../../redux/modules/elections'
import {
  fetchPollingPlaceLoaderJob,
  IPollingPlaceLoaderResponseMessages,
  loadPollingPlaces,
} from '../../redux/modules/polling_places'
import { IStore } from '../../redux/modules/reducer'
import ElectionPollingPlaceLoader from './ElectionPollingPlaceLoader'

interface IRouteProps {
  electionIdentifier: string
}

interface IOwnProps {
  params: IRouteProps
}

interface IProps extends IOwnProps {}

interface IStoreProps {
  election: IElection
}

interface IDispatchProps {
  loadPollingPlaces: Function
  fetchPollingPlaceLoaderJobStatus: Function
}

interface IStateProps {
  file: File | undefined
  config: string | undefined
  dryRun: boolean
  intervalId: number | undefined
  job_id: string | undefined
  job_status: string | undefined
  stages_log: string[] | undefined
  error: boolean | undefined
  messages: IPollingPlaceLoaderResponseMessages | undefined
}

type TComponentProps = IStoreProps & IDispatchProps & IOwnProps
class ElectionPollingPlaceLoaderContainer extends React.PureComponent<TComponentProps, IStateProps> {
  constructor(props: TComponentProps) {
    super(props)

    this.state = {
      file: undefined,
      config: undefined,
      dryRun: true,
      intervalId: undefined,
      job_id: undefined,
      job_status: undefined,
      stages_log: undefined,
      error: undefined,
      messages: undefined,
    }
  }

  render() {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { election, loadPollingPlaces } = this.props

    return (
      <ElectionPollingPlaceLoader
        election={election}
        file={this.state.file}
        error={this.state.error}
        job_id={this.state.job_id}
        job_status={this.state.job_status}
        stages_log={this.state.stages_log}
        messages={this.state.messages}
        onFileUpload={(file: File) => {
          // eslint-disable-next-line react/no-access-state-in-setstate
          this.setState({ ...this.state, file })
          loadPollingPlaces(election, file, this.state.config, this.state.dryRun, this)
        }}
        onConfigChange={(_event: any, config: string) => {
          try {
            JSON.parse(config)
            // eslint-disable-next-line react/no-access-state-in-setstate
            this.setState({ ...this.state, config })
          } catch (e) {
            // tslint:disable-next-line: no-console
            console.error(e)
          }
        }}
        onCheckDryRun={(_event: any, isInputChecked: boolean) => {
          // eslint-disable-next-line react/no-access-state-in-setstate
          this.setState({ ...this.state, dryRun: isInputChecked })
        }}
      />
    )
  }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
  const { elections } = state

  return {
    election: elections.elections.find(
      (election: IElection) => election.id === parseInt(ownProps.params.electionIdentifier, 10)
    )!,
  }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
  return {
    loadPollingPlaces: async (
      election: IElection,
      file: File,
      config: any,
      dryRun: boolean,
      that: ElectionPollingPlaceLoaderContainer
    ) => {
      const json = await dispatch(loadPollingPlaces(election, file, config, dryRun))

      if (json !== null) {
        const { job_id } = json

        const intervalId = window.setInterval(() => {
          that.props.fetchPollingPlaceLoaderJobStatus(election, job_id, that)
        }, 5000)

        that.setState({
          ...that.state,
          intervalId,
          job_id,
          job_status: undefined,
          stages_log: undefined,
          error: undefined,
          messages: undefined,
        })
      }
    },
    fetchPollingPlaceLoaderJobStatus: async (
      election: IElection,
      job_id: string,
      that: ElectionPollingPlaceLoaderContainer
    ) => {
      const json = await dispatch(fetchPollingPlaceLoaderJob(election, job_id))

      that.setState({
        ...that.state,
        job_status: json.status,
        stages_log: json.stages_log !== null ? json.stages_log : undefined,
        error:
          json.response !== null
            ? !!('errors' in json.response.logs && json.response.logs.errors.length > 0)
            : undefined,
        messages: json.response !== null ? json.response : undefined,
      })

      if (['finished', 'failed', 'stopped', 'canceled', 'cancelled'].includes(json.status)) {
        window.clearInterval(that.state.intervalId)
      }
    },
  }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(ElectionPollingPlaceLoaderContainer)
