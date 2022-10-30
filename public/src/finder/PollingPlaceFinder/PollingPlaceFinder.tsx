import Avatar from 'material-ui/Avatar'
import { ListItem } from 'material-ui/List'
import Paper from 'material-ui/Paper'
import { blue500 } from 'material-ui/styles/colors'
import { ActionInfo } from 'material-ui/svg-icons'
import * as React from 'react'
import styled from 'styled-components'
import { IElection } from '../../redux/modules/elections'
import GooglePlacesAutocompleteList from '../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocompleteList'

const FinderContainer = styled.div`
  width: 85%;
  margin-top: 10px;
  margin-left: 7.5%;
  margin-right: 7.5%;
`

interface IProps {
  election: IElection
  onGeocoderResults: any
}

class PollingPlaceFinder extends React.PureComponent<IProps, {}> {
  render() {
    const { election, onGeocoderResults } = this.props

    return (
      <FinderContainer>
        {election.polling_places_loaded === false && (
          <Paper style={{ marginBottom: 15 }}>
            <ListItem
              leftAvatar={<Avatar icon={<ActionInfo />} backgroundColor={blue500} />}
              primaryText={"Polling places haven't been announced yet"}
              secondaryText={"Until then we're only listing stalls reported by the community."}
              secondaryTextLines={2}
              disabled={true}
            />
          </Paper>
        )}

        <GooglePlacesAutocompleteList
          componentRestrictions={{ country: 'AU' }}
          hintText="Search here"
          onChoosePlace={onGeocoderResults}
        />
      </FinderContainer>
    )
  }
}

export default PollingPlaceFinder
