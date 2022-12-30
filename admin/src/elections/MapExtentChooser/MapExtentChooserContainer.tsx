import * as React from 'react'
import { connect } from 'react-redux'
import { IElection } from '../../redux/modules/elections'
import { IGeoJSON } from '../../redux/modules/interfaces'
import { IStore } from '../../redux/modules/reducer'
import MapExtentChooser from './MapExtentChooser'

interface IProps {
  value: IGeoJSON | undefined
  onChange: (geojson: IGeoJSON) => void
}

interface IDispatchProps {}

interface IStoreProps {
  elections: IElection[]
}

interface IStateProps {}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class MapExtentChooserContainer extends React.Component<TComponentProps, IStateProps> {
  render() {
    const { elections, value, onChange } = this.props

    return <MapExtentChooser elections={elections} value={value} onChange={onChange} />
  }
}

const mapStateToProps = (state: IStore, _ownProps: IProps): IStoreProps => {
  const { elections } = state
  return {
    elections: elections.elections,
  }
}

const mapDispatchToProps = (_dispatch: Function): IDispatchProps => {
  return {}
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(MapExtentChooserContainer)
