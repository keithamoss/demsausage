import * as React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { getBaseURL } from '../../redux/modules/app'
import { getURLSafeElectionName, IElection } from '../../redux/modules/elections'
import { clearMapToSearch } from '../../redux/modules/map'
import { IStore } from '../../redux/modules/reducer'
import { gaTrack } from '../../shared/analytics/GoogleAnalytics'
import ElectionChooser from './ElectionChooser'

interface IProps {}

interface IDispatchProps {
  onChooseElection: Function
}

interface IStoreProps {
  elections: Array<IElection>
}

interface IStateProps {
  isElectionChooserOpen: boolean
}

interface IRouterProps {
  content: any
  location: any
}

type TComponentProps = IProps & IStoreProps & IDispatchProps & IRouterProps
class ElectionChooserContainer extends React.Component<TComponentProps, IStateProps> {
  static muiName = 'ElectionChooserContainer'

  static pageTitle = 'Democracy Sausage | Elections'

  static pageBaseURL = '/elections'

  render() {
    const { elections, onChooseElection } = this.props

    if (elections === undefined) {
      return null
    }

    return (
      <React.Fragment>
        <Helmet>
          <title>{ElectionChooserContainer.pageTitle}</title>

          {/* Open Graph / Facebook / Twitter */}
          <meta property="og:url" content={`${getBaseURL()}${ElectionChooserContainer.pageBaseURL}`} />
          <meta property="og:title" content={ElectionChooserContainer.pageTitle} />
        </Helmet>

        <ElectionChooser elections={elections} onChooseElection={onChooseElection} />
      </React.Fragment>
    )
  }
}

const mapStateToProps = (state: IStore): IStoreProps => {
  const { elections } = state

  return {
    elections: elections.elections,
  }
}

const mapDispatchToProps = (dispatch: Function, _ownProps: IProps): IDispatchProps => {
  return {
    onChooseElection(election: IElection) {
      gaTrack.event({
        category: 'ElectionChooserContainer',
        action: 'onChooseElectionFromList',
      })

      dispatch(clearMapToSearch())

      browserHistory.push(`/${getURLSafeElectionName(election)}`)
    },
  }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(ElectionChooserContainer)
