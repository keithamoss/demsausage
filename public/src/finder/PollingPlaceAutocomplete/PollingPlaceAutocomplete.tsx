import SearchBar from "material-ui-search-bar"
import Avatar from "material-ui/Avatar"
import { List, ListItem } from "material-ui/List"
import MapsPlace from "material-ui/svg-icons/maps/place"
import * as React from "react"
import * as reactStringReplace from "react-string-replace"
import styled from "styled-components"
import { IPollingPlace } from "../../redux/modules/polling_places"

export interface IProps {
    onFieldChange: Function
    searchText: string
    searchResults: Array<IPollingPlace>
    onChoosePollingPlace: any
}

const HighlightedString = styled.span`
    color: purple;
    font-weight: bold !important;
`

class PollingPlaceAutocomplete extends React.PureComponent<IProps, {}> {
    render() {
        const { searchText, searchResults, onChoosePollingPlace } = this.props
        const { onFieldChange } = this.props

        return (
            <div>
                <SearchBar onRequestSearch={() => undefined} onChange={onFieldChange} hintText={"Where is your stall?"} />

                {searchResults.length > 0 && (
                    <List>
                        {searchResults.map((pollingPlace: IPollingPlace, index: number) => {
                            const primaryTextString =
                                pollingPlace.name === pollingPlace.premises
                                    ? pollingPlace.name
                                    : `${pollingPlace.name}, ${pollingPlace.premises}`
                            const primaryText = reactStringReplace(primaryTextString, searchText, (match: string, i: number) => (
                                <HighlightedString key={i}>{match}</HighlightedString>
                            ))
                            const secondaryText = reactStringReplace(
                                `${pollingPlace.address}, ${pollingPlace.state}`,
                                searchText,
                                (match: string, i: number) => <HighlightedString key={i}>{match}</HighlightedString>
                            )

                            return (
                                <ListItem
                                    key={pollingPlace.id}
                                    leftAvatar={<Avatar icon={<MapsPlace />} />}
                                    primaryText={primaryText}
                                    secondaryText={secondaryText}
                                    secondaryTextLines={2}
                                    onClick={(event: any) => {
                                        onChoosePollingPlace(pollingPlace)
                                    }}
                                />
                            )
                        })}
                    </List>
                )}
            </div>
        )
    }
}

export default PollingPlaceAutocomplete
