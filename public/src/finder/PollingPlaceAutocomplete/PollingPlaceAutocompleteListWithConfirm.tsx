import * as React from 'react'
import { connect } from 'react-redux'
import StallLocationCard from '../../add-stall/StallLocationCard/StallLocationCard'
import { IElection } from '../../redux/modules/elections'
import { IPollingPlace } from '../../redux/modules/polling_places'
import { IStore } from '../../redux/modules/reducer'
import PollingPlaceAutocompleteContainer from './PollingPlaceAutocompleteContainer'

interface IProps {
  election: IElection
  onConfirmChosenLocation: Function
  autoFocus: boolean
  hintText: string
  onRequestSearch?: Function
}
interface IStoreProps {}

interface IDispatchProps {}

interface IStateProps {
  pollingPlaceInfo: IPollingPlace | null
  locationConfirmed: boolean
}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class PollingPlaceAutocompleteListWithConfirm extends React.Component<TComponentProps, IStateProps> {
  constructor(props: TComponentProps) {
    super(props)
    this.state = { pollingPlaceInfo: null, locationConfirmed: false }

    this.onChoosePlace = this.onChoosePlace.bind(this)
    this.onCancelChosenLocation = this.onCancelChosenLocation.bind(this)
    this.onConfirmChosenLocation = this.onConfirmChosenLocation.bind(this)
  }

  onChoosePlace(pollingPlaceInfo: IPollingPlace) {
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, pollingPlaceInfo })
  }

  onCancelChosenLocation() {
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, pollingPlaceInfo: null, locationConfirmed: false })
  }

  onConfirmChosenLocation(_pollingPlaceInfo: IPollingPlace) {
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({ ...this.state, locationConfirmed: true })
    this.props.onConfirmChosenLocation(this.state.pollingPlaceInfo!)
  }

  render() {
    const { election, autoFocus, hintText } = this.props
    const { pollingPlaceInfo, locationConfirmed } = this.state

    return (
      <div>
        {locationConfirmed === false && election.polling_places_loaded === true && (
          <div>
            <PollingPlaceAutocompleteContainer
              election={election}
              autoFocus={autoFocus}
              hintText={hintText}
              onPollingPlaceChosen={this.onChoosePlace}
            />
            <br />
          </div>
        )}

        {pollingPlaceInfo !== null && (
          <StallLocationCard
            stallLocationInfo={pollingPlaceInfo}
            showActions={locationConfirmed === false}
            onCancel={this.onCancelChosenLocation}
            onConfirm={this.onConfirmChosenLocation}
          />
        )}
      </div>
    )
  }
}

const mapStateToProps = (_state: IStore, _ownProps: IProps): IStoreProps => {
  return {}
}

const mapDispatchToProps = (_dispatch: Function): IDispatchProps => {
  return {}
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(PollingPlaceAutocompleteListWithConfirm)
