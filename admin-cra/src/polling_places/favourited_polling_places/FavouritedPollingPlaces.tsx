import { ActionCheckCircle } from 'material-ui/svg-icons'
import * as React from 'react'
import ElectionChooser from '../../elections/ElectionChooser/ElectionChooserContainer'
import { IPollingPlace } from '../../redux/modules/polling_places'
import EmptyState from '../../shared/empty_state/EmptyState'
import PollingPlaceInfoCardMiniContainer from '../polling_place_info_card_mini/PollingPlaceInfoCardMiniContainer'

interface IProps {
  pollingPlaces: IPollingPlace[]
  onElectionChanged: any
}

class FavouritedPollingPlaces extends React.PureComponent<IProps, {}> {
  render() {
    const { pollingPlaces, onElectionChanged } = this.props

    return (
      <React.Fragment>
        <ElectionChooser onElectionChanged={onElectionChanged} />
        <br />
        {pollingPlaces.length > 0 &&
          pollingPlaces.map((pollingPlace: IPollingPlace) => (
            <PollingPlaceInfoCardMiniContainer key={pollingPlace.id} pollingPlace={pollingPlace} />
          ))}

        {pollingPlaces.length === 0 && (
          <EmptyState
            message={
              <div>
                We haven't favourited any
                <br />
                polling places for this election yet.
              </div>
            }
            icon={<ActionCheckCircle />}
          />
        )}
      </React.Fragment>
    )
  }
}

export default FavouritedPollingPlaces
