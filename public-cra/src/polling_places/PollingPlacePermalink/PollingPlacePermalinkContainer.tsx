import { ActionSearch } from 'material-ui/svg-icons'
import * as React from 'react'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import { getElectionByURLSafeName, getURLSafeElectionName, IElection } from '../../redux/modules/elections'
import { setMapToSearch } from '../../redux/modules/map'
import {
  IPollingPlace,
  lookupPollingPlaces,
  lookupPollingPlacesByECId,
  lookupPollingPlacesByStallId,
} from '../../redux/modules/polling_places'
import { IStore } from '../../redux/modules/reducer'
import EmptyState from '../../shared/empty_state/EmptyState'
import PollingPlacePermalink from './PollingPlacePermalink'

interface IRouteProps {
  routeParams: IRouteParams
}

interface IProps extends IRouteProps {}

interface IStoreProps {
  election: IElection | undefined
}

interface IDispatchProps {
  fetchPollingPlace: Function
  onViewOnMap: Function
}

interface IStateProps {
  pollingPlace: IPollingPlace | null | undefined
}

interface IRouteParams {
  electionName: string
  stallId?: string
  ecId?: string
  name?: string
  premises?: string
  state?: string
}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class PollingPlacePermalinkContainer extends React.Component<TComponentProps, IStateProps> {
  private fetchPollingPlace: Function

  constructor(props: TComponentProps) {
    super(props)

    this.state = { pollingPlace: undefined }

    this.fetchPollingPlace = (election: IElection) => props.fetchPollingPlace(election)
  }

  async UNSAFE_componentWillMount() {
    const { election } = this.props

    if (this.props.election !== undefined) {
      this.setState({ pollingPlace: await this.fetchPollingPlace(election) })
    }
  }

  render() {
    const { election, onViewOnMap } = this.props
    const { pollingPlace } = this.state

    if (election === undefined || pollingPlace === undefined) {
      return null
    }

    if (pollingPlace === null) {
      return (
        <EmptyState
          message={
            <div>
              Sorry about this, but we couldn&apos;t
              <br />
              find that polling place.
            </div>
          }
          icon={<ActionSearch />}
        />
      )
    }

    return <PollingPlacePermalink pollingPlace={pollingPlace} election={election} onViewOnMap={onViewOnMap} />
  }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
  const getElectionByURLSafeNameFilter = getElectionByURLSafeName(state)

  return {
    election: getElectionByURLSafeNameFilter(ownProps.routeParams.electionName),
  }
}

const mapDispatchToProps = (dispatch: Function, ownProps: IProps): IDispatchProps => {
  return {
    fetchPollingPlace: async (election: IElection) => {
      const { routeParams } = ownProps

      if ('stallId' in routeParams) {
        // eslint-disable-next-line @typescript-eslint/return-await
        return await dispatch(lookupPollingPlacesByStallId(election, routeParams.stallId!))
      }
      if ('ecId' in routeParams) {
        // eslint-disable-next-line @typescript-eslint/return-await
        return await dispatch(lookupPollingPlacesByECId(election, routeParams.ecId!))
      }
      if ('name' in routeParams && 'premises' in routeParams && 'state' in routeParams) {
        // eslint-disable-next-line @typescript-eslint/return-await
        return await dispatch(
          lookupPollingPlaces(election, routeParams.name!, routeParams.premises!, routeParams.state!)
        )
      }
      return null
    },
    onViewOnMap(election: IElection, pollingPlace: IPollingPlace) {
      dispatch(
        setMapToSearch({
          lon: pollingPlace.geom.coordinates[0],
          lat: pollingPlace.geom.coordinates[1],
          extent: null,
          formattedAddress: '',
        })
      )
      browserHistory.push(`/${getURLSafeElectionName(election)}`)
    },
  }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(PollingPlacePermalinkContainer)
