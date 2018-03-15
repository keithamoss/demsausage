import * as React from "react"
import PollingPlaceAutocomplete from "./PollingPlaceAutocomplete"
import { connect } from "react-redux"
import { debounce } from "lodash-es"

import { searchPollingPlaces } from "../../redux/modules/polling_places"
import { IStore, IElection, IPollingPlace } from "../../redux/modules/interfaces"

export interface IProps {
    election: IElection
    autoFocus: boolean
    hintText: string
    onPollingPlaceChosen: Function
}

export interface IDispatchProps {
    onPollingPlaceSearch: Function
}

export interface IStateProps {
    searchText: string
    searchResults: Array<IPollingPlace>
}

export class PollingPlaceAutocompleteContainer extends React.PureComponent<IProps & IDispatchProps, IStateProps> {
    onFieldChangeDebounced: Function

    constructor(props: IProps & IDispatchProps) {
        super(props)
        this.state = { searchText: "", searchResults: [] }

        // http://stackoverflow.com/a/24679479/7368493
        this.onFieldChangeDebounced = debounce(this.onFieldChange, 750, { maxWait: 2000 })
    }

    async onFieldChange(searchTerm: string, election: IElection, onPollingPlaceSearch: Function) {
        const json = await onPollingPlaceSearch(election, searchTerm)
        this.setState({ searchText: searchTerm, searchResults: json })
    }

    render() {
        const { election, onPollingPlaceSearch, onPollingPlaceChosen } = this.props
        const { searchText, searchResults } = this.state

        return (
            <PollingPlaceAutocomplete
                onFieldChange={(searchTerm: string) => this.onFieldChangeDebounced(searchTerm, election, onPollingPlaceSearch)}
                searchText={searchText}
                searchResults={searchResults}
                onChoosePollingPlace={(pollingPlace: IPollingPlace) => {
                    this.setState({ searchResults: [] })
                    onPollingPlaceChosen(pollingPlace)
                }}
            />
        )
    }
}

const mapStateToProps = (state: IStore): any => {
    return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
    return {
        onPollingPlaceSearch: async (election: IElection, searchTerm: string) => {
            return await dispatch(searchPollingPlaces(election, searchTerm))
        },
    }
}

const PollingPlaceAutocompleteContainerWrapped = connect<{}, IDispatchProps, IProps>(mapStateToProps, mapDispatchToProps)(
    PollingPlaceAutocompleteContainer
)

export default PollingPlaceAutocompleteContainerWrapped
