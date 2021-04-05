import SearchBar from 'material-ui-search-bar'
import * as React from 'react'
import { IPollingPlace } from '../../redux/modules/polling_places'
import PollingPlaceAutocompleteList from './PollingPlaceAutocompleteList'

interface IProps {
  onFieldChange: Function
  searchText: string
  searchResults: Array<IPollingPlace> | undefined
  onChoosePollingPlace: any
}

class PollingPlaceAutocomplete extends React.PureComponent<IProps, {}> {
  render() {
    const { searchText, searchResults, onChoosePollingPlace } = this.props
    const { onFieldChange } = this.props

    return (
      <div>
        <SearchBar onRequestSearch={() => undefined} onChange={onFieldChange} hintText="Where is your stall?" />

        {searchResults !== undefined && searchResults.length > 0 && (
          <PollingPlaceAutocompleteList
            searchText={searchText}
            searchResults={searchResults}
            onChoosePollingPlace={onChoosePollingPlace}
          />
        )}
      </div>
    )
  }
}

export default PollingPlaceAutocomplete
