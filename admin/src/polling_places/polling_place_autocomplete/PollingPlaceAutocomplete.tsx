import * as React from "react"
import styled from "styled-components"
// import { Link } from "react-router"
import * as reactStringReplace from "react-string-replace"
import { IPollingPlace } from "../../redux/modules/interfaces"

import AutoComplete from "material-ui/AutoComplete"
import { ListItem } from "material-ui/List"
import MenuItem from "material-ui/MenuItem"

export interface IProps {
    searchText: string
    pollingPlaces: Array<IPollingPlace>
    onPollingPlaceAutocompleteSelect: any
    onChoosePollingPlace: any
}

const HighlightedString = styled.span`
    color: purple;
    font-weight: bold !important;
`

class App extends React.PureComponent<IProps, {}> {
    render() {
        const { searchText, pollingPlaces, onPollingPlaceAutocompleteSelect, onChoosePollingPlace } = this.props

        const pollingPlaceResults: any = pollingPlaces.map((currentValue: IPollingPlace, index: any, array: any) => {
            const primaryText = reactStringReplace(currentValue.polling_place_name, searchText, (match: string, i: number) => (
                <HighlightedString key={i}>{match}</HighlightedString>
            ))
            const secondaryText = reactStringReplace(
                `${currentValue.address}, ${currentValue.state}`,
                searchText,
                (match: string, i: number) => <HighlightedString key={i}>{match}</HighlightedString>
            )

            return {
                text: `${currentValue.polling_place_name}, ${currentValue.address}`,
                value: (
                    <MenuItem
                        children={<ListItem primaryText={primaryText} secondaryText={secondaryText} disabled={true} />}
                        data-foo={1}
                    />
                ),
            }
        })

        return (
            <AutoComplete
                floatingLabelText={"Search for a polling place"}
                dataSource={pollingPlaceResults}
                filter={AutoComplete.noFilter}
                maxSearchResults={20}
                fullWidth={true}
                menuProps={{ maxHeight: 500 }}
                onUpdateInput={onPollingPlaceAutocompleteSelect}
                onNewRequest={onChoosePollingPlace}
            />
        )
    }
}

export default App
