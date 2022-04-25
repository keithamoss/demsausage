import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { getBaseURL } from '../../redux/modules/app'
import { getLiveElections, IElection } from '../../redux/modules/elections'
import { IStore } from '../../redux/modules/reducer'
import AddStall from './AddStall'

interface IProps {}

interface IDispatchProps {}

interface IStoreProps {
  liveElections: Array<IElection>
}

interface IStateProps {
  formSubmitted: boolean
}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class AddStallFormContainer extends React.Component<TComponentProps, IStateProps> {
  constructor(props: TComponentProps) {
    super(props)
    this.state = { formSubmitted: false }

    this.onStallAdded = this.onStallAdded.bind(this)
  }

  onStallAdded() {
    this.setState({ formSubmitted: true })
  }

  render() {
    const { liveElections } = this.props
    const { formSubmitted } = this.state

    const showNoLiveElections = liveElections.length === 0

    return (
      <React.Fragment>
        <Helmet>
          <title>Democracy Sausage | Add a sausage sizzle or cake stall to the map</title>

          {/* Open Graph / Facebook / Twitter */}
          <meta property="og:url" content={`${getBaseURL()}/add-stall`} />
          <meta property="og:title" content="Democracy Sausage | Add a sausage sizzle or cake stall to the map" />
        </Helmet>

        <AddStall
          showNoLiveElections={showNoLiveElections}
          showWelcome={!formSubmitted && !showNoLiveElections}
          showThankYou={formSubmitted && !showNoLiveElections}
          showForm={!formSubmitted && !showNoLiveElections}
          onStallAdded={this.onStallAdded}
        />
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: IStore): IStoreProps => {
  return {
    liveElections: getLiveElections(state),
  }
}

const mapDispatchToProps = (_dispatch: Function): IDispatchProps => {
  return {}
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(AddStallFormContainer)
