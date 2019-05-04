import { debounce } from "lodash-es"
import * as React from "react"
import { connect } from "react-redux"
import { IElection } from "../../redux/modules/elections"
import { IPollingPlace, searchPollingPlaces } from "../../redux/modules/polling_places"
import { IStore } from "../../redux/modules/reducer"
import PollingPlaceAutocomplete from "./PollingPlaceAutocomplete"

interface IProps {
    election: IElection
    autoFocus: boolean
    hintText: string
    onPollingPlaceChosen: Function
}

interface IStoreProps {}

interface IDispatchProps {
    onPollingPlaceSearch: Function
}

interface IStateProps {
    searchText: string
    searchResults: Array<IPollingPlace>
}

class PollingPlaceAutocompleteContainer extends React.PureComponent<IProps & IDispatchProps, IStateProps> {
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
            if (searchTerm.length > 0) {
                return await dispatch(searchPollingPlaces(election, searchTerm))
            }
        },
    }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
    mapStateToProps,
    mapDispatchToProps
)(PollingPlaceAutocompleteContainer)
