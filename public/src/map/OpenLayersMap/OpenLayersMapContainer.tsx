import * as React from 'react'
import { connect } from 'react-redux'
import { IElection } from '../../redux/modules/elections'
import { IGeoJSONFeatureCollection } from '../../redux/modules/interfaces'
import { IMapFilterOptions, IMapSearchResults, storeMapData } from '../../redux/modules/map'
import { IStore } from '../../redux/modules/reducer'
import OpenLayersMap from './OpenLayersMap'

interface IProps {
  election: IElection
  mapSearchResults: IMapSearchResults | null
  mapFilterOptions: IMapFilterOptions
  onMapBeginLoading: Function
  onMapLoaded: Function
  onQueryMap: Function
}

interface IStoreProps {
  geojson: IGeoJSONFeatureCollection | undefined
}

interface IDispatchProps {
  stashMapData: Function
}

interface IStateProps {}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class OpenLayersMapContainer extends React.Component<TComponentProps, IStateProps> {
  render() {
    const {
      election,
      mapSearchResults,
      mapFilterOptions,
      onMapBeginLoading,
      onMapLoaded,
      onQueryMap,
      geojson,
      stashMapData,
    } = this.props

    return (
      <OpenLayersMap
        key={election.id}
        election={election}
        geojson={geojson}
        mapSearchResults={mapSearchResults}
        mapFilterOptions={mapFilterOptions}
        onMapBeginLoading={onMapBeginLoading}
        onMapDataLoaded={stashMapData}
        onMapLoaded={onMapLoaded}
        onQueryMap={onQueryMap}
      />
    )
  }
}

const mapStateToProps = (state: IStore, ownProps: IProps): IStoreProps => {
  const { map } = state

  return {
    geojson: map.geojson[ownProps.election.id],
  }
}

const mapDispatchToProps = (dispatch: Function, ownProps: IProps): IDispatchProps => {
  return {
    stashMapData: (geojson: IGeoJSONFeatureCollection) => {
      dispatch(storeMapData(ownProps.election.id, geojson))
    },
  }
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(OpenLayersMapContainer)
