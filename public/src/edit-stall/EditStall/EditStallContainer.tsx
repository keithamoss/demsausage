import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { getBaseURL } from '../../redux/modules/app'
import { IElection } from '../../redux/modules/elections'
import { IStore } from '../../redux/modules/reducer'
import { fetchStallWithCredentials, IStall } from '../../redux/modules/stalls'
import { IDjangoAPIError } from '../../shared/ui/DjangoAPIErrorUI/DjangoAPIErrorUI'
import EditStall from './EditStall'

interface IProps {
  onStallAdded: Function
}

interface IDispatchProps {
  fetchStall: Function
}

interface IStoreProps {
  elections: IElection[]
}

interface IStateProps {
  stall: IStall | undefined | null
  election: IElection | undefined
  errors: IDjangoAPIError | undefined
  formSubmitted: boolean
}

interface IRouteProps {
  location: {
    query: {
      stall_id: string
      token: string
      signature: string
    }
  }
}

export interface IStallEditCredentials {
  token: string
  signature: string
}

type TComponentProps = IProps & IStoreProps & IDispatchProps & IRouteProps
class EditStallFormContainer extends React.Component<TComponentProps, IStateProps> {
  constructor(props: TComponentProps) {
    super(props)

    this.state = {
      stall: undefined,
      election: undefined,
      errors: undefined,
      formSubmitted: false,
    }

    this.onStallUpdated = this.onStallUpdated.bind(this)
  }

  async componentDidMount() {
    const { fetchStall, location, elections } = this.props
    const { response, json } = await fetchStall(location.query.stall_id, location.query.token, location.query.signature)

    if (response.status === 200) {
      // eslint-disable-next-line react/no-access-state-in-setstate
      this.setState({ ...this.state, stall: json, election: elections.find((e: IElection) => e.id === json.election) })
    } else if (response.status >= 400) {
      // eslint-disable-next-line react/no-access-state-in-setstate
      this.setState({ ...this.state, stall: null, errors: json })
    }
  }

  onStallUpdated() {
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, formSubmitted: true })
  }

  getCredentials() {
    const { token, signature } = this.props.location.query
    return { token, signature }
  }

  render() {
    const { stall, election, formSubmitted, errors } = this.state

    if (stall === undefined || election === undefined) {
      return null
    }

    return (
      <React.Fragment>
        <Helmet>
          <title>Democracy Sausage | Update your sausage sizzle or cake stall</title>

          {/* Open Graph / Facebook / Twitter */}
          <meta property="og:url" content={getBaseURL()} />
          <meta property="og:title" content="Democracy Sausage | Update your sausage sizzle or cake stall" />
        </Helmet>

        <EditStall
          showAPIErrors={errors !== undefined}
          showWelcome={!formSubmitted && errors === undefined}
          showThankYou={formSubmitted && errors === undefined}
          showForm={!formSubmitted && errors === undefined}
          stall={stall}
          election={election}
          errors={errors}
          credentials={this.getCredentials()}
          onStallUpdated={this.onStallUpdated}
        />
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: IStore, _ownProps: IProps): IStoreProps => {
  const { elections } = state
  return { elections: elections.elections }
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
  return {
    fetchStall: (stallId: string, token: string, signature: string) => {
      return dispatch(fetchStallWithCredentials(stallId, token, signature))
    },
  }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(EditStallFormContainer)
