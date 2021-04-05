import * as React from 'react'
import { connect } from 'react-redux'
import { IElection } from '../../redux/modules/elections'
import { IPollingPlaceLoaderResponseMessages, loadPollingPlaces } from '../../redux/modules/polling_places'
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
}

interface IStateProps {
  file: File | undefined
  config: string | undefined
  dryRun: boolean
  error: boolean | undefined
  messages: IPollingPlaceLoaderResponseMessages | undefined
}

type TComponentProps = IStoreProps & IDispatchProps & IOwnProps
class ElectionPollingPlaceLoaderContainer extends React.PureComponent<TComponentProps, IStateProps> {
  constructor(props: TComponentProps) {
    super(props)

    this.state = { file: undefined, config: undefined, dryRun: true, error: undefined, messages: undefined }
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
          this.setState({ ...this.state, file })
          loadPollingPlaces(election, file, this.state.config, this.state.dryRun, this)
        }}
        onConfigChange={(event: any, config: string) => {
          try {
            JSON.parse(config)
            this.setState({ ...this.state, config })
          } catch (e) {
            // tslint:disable-next-line: no-console
            console.error(e)
          }
        }}
        onCheckDryRun={(event: any, isInputChecked: boolean) => {
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
      that.setState({
        ...that.state,
        error: !!('errors' in json.logs && json.logs.errors.length > 0),
        messages: json,
      })
    },
  }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(ElectionPollingPlaceLoaderContainer)
