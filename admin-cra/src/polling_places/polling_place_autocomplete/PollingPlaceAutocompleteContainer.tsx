/* eslint-disable func-names */
import { debounce } from 'lodash-es'
import * as React from 'react'
import { connect } from 'react-redux'
import { IElection } from '../../redux/modules/elections'
import { IPollingPlace, searchPollingPlaces } from '../../redux/modules/polling_places'
import { IStore } from '../../redux/modules/reducer'
import PollingPlaceAutocomplete from './PollingPlaceAutocomplete'

interface IStoreProps {}

interface IProps {
  election: IElection
  onPollingPlaceChosen: Function
}

interface IDispatchProps {
  onPollingPlaceSearch: Function
}

interface IStateProps {
  searchText: string
  searchResults: Array<IPollingPlace>
}

type TComponentProps = IProps & IDispatchProps
class PollingPlaceAutocompleteContainer extends React.PureComponent<TComponentProps, IStateProps> {
  onFieldChangeDebounced: Function

  constructor(props: IProps & IDispatchProps) {
    super(props)
    this.state = { searchText: '', searchResults: [] }

    // http://stackoverflow.com/a/24679479/7368493
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    this.onFieldChangeDebounced = debounce(function (this: PollingPlaceAutocompleteContainer, searchText: string) {
      // eslint-disable-next-line react/no-access-state-in-setstate
      this.setState({ ...this.state, searchText })
    }, 750)
  }

  async componentDidUpdate(_prevProps: IProps & IDispatchProps, prevState: IStateProps) {
    if (this.state.searchText !== prevState.searchText) {
      // eslint-disable-next-line react/no-access-state-in-setstate
      const searchResults = await this.props.onPollingPlaceSearch(this.props.election, this.state.searchText)
      // eslint-disable-next-line react/no-access-state-in-setstate, react/no-did-update-set-state
      this.setState({ ...this.state, searchResults })
    }
  }

  render() {
    const { onPollingPlaceChosen } = this.props
    return (
      <PollingPlaceAutocomplete
        searchText={this.state.searchText}
        pollingPlaces={this.state.searchResults}
        onPollingPlaceAutocompleteSelect={(searchText: string, _dataSource: any, params: any) => {
          if (params.source === 'change' && searchText.length >= 3) {
            this.onFieldChangeDebounced(searchText)
          }
        }}
        onChoosePollingPlace={(_chosenRequest: any, index: number) => {
          if (index >= 0) {
            onPollingPlaceChosen(this.state.searchResults[index])
          }
        }}
      />
    )
  }
}

const mapStateToProps = (_state: IStore): IStoreProps => {
  return {}
}

const mapDispatchToProps = (dispatch: Function): IDispatchProps => {
  return {
    // eslint-disable-next-line consistent-return
    onPollingPlaceSearch: async (election: IElection, searchTerm: string) => {
      if (searchTerm.length > 0) {
        // eslint-disable-next-line @typescript-eslint/return-await
        return await dispatch(searchPollingPlaces(election, searchTerm))
      }
    },
  }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(PollingPlaceAutocompleteContainer)
