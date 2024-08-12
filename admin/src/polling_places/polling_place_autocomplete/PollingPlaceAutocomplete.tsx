/* eslint-disable-next-line max-classes-per-file */
import { AutoCompleteProps } from 'material-ui'
import AutoComplete from 'material-ui/AutoComplete'
import { ListItem } from 'material-ui/List'
import MenuItem from 'material-ui/MenuItem'
import * as React from 'react'
import reactStringReplace from 'react-string-replace'
import styled from 'styled-components'
import { getPollingPlaceLongName, IPollingPlace } from '../../redux/modules/polling_places'

interface IProps {
  searchText: string
  pollingPlaces: Array<IPollingPlace>
  onPollingPlaceAutocompleteSelect: any
  onChoosePollingPlace: any
}

const HighlightedString = styled.span`
  color: purple;
  font-weight: bold !important;
`

// Working around issues with onClick not being exposed and causing TS linting errors
interface ICustomAutoCompleteProps extends AutoCompleteProps<any> {
  floatingLabelText: string
  onClick: any
}
class CustomAutoComplete extends React.Component<ICustomAutoCompleteProps, any> {
  render(): any {
    return <AutoComplete {...this.props} />
  }
}

class App extends React.PureComponent<IProps, {}> {
  render() {
    const { searchText, pollingPlaces, onPollingPlaceAutocompleteSelect, onChoosePollingPlace } = this.props

    const pollingPlaceResults: any = pollingPlaces.map((currentValue: IPollingPlace, _index: any, _array: any) => {
      const primaryText = reactStringReplace(
        getPollingPlaceLongName(currentValue),
        searchText,
        (match: string, i: number) => <HighlightedString key={i}>{match}</HighlightedString>
      )
      const secondaryText = reactStringReplace(
        `${currentValue.address}, ${currentValue.state}`,
        searchText,
        (match: string, i: number) => <HighlightedString key={i}>{match}</HighlightedString>
      )

      return {
        text: `${currentValue.name}, ${currentValue.address}`,
        value: (
          <MenuItem
            children={<ListItem primaryText={primaryText} secondaryText={secondaryText} disabled={true} />}
            data-foo={1}
          />
        ),
      }
    })

    return (
      <CustomAutoComplete
        floatingLabelText="Search for a polling place"
        autoComplete="off"
        dataSource={pollingPlaceResults}
        filter={AutoComplete.noFilter}
        maxSearchResults={20}
        fullWidth={true}
        menuProps={{ maxHeight: 500 }}
        onUpdateInput={onPollingPlaceAutocompleteSelect}
        onNewRequest={onChoosePollingPlace}
        onClick={(evt: any) => {
          evt.target.setSelectionRange(0, evt.target.value.length)
        }}
      />
    )
  }
}

export default App
