import * as React from 'react'
import { connect } from 'react-redux'
import { IGeoJSON } from '../../redux/modules/interfaces'
import { IStore } from '../../redux/modules/reducer'
import MapExtentChooser from './MapExtentChooser'

interface IProps {
  value: IGeoJSON | undefined
  onChange: (geojson: IGeoJSON) => void
}

interface IDispatchProps {}

interface IStoreProps {}

interface IStateProps {}

type TComponentProps = IProps & IStoreProps & IDispatchProps
class MapExtentChooserContainer extends React.Component<TComponentProps, IStateProps> {
  render() {
    const { value, onChange } = this.props

    return <MapExtentChooser value={value} onChange={onChange} />
  }
}

const mapStateToProps = (_state: IStore, _ownProps: IProps): IStoreProps => {
  return {}
}

const mapDispatchToProps = (_dispatch: Function): IDispatchProps => {
  return {}
}

export default connect<IStoreProps, IDispatchProps, IProps, IStore>(
  mapStateToProps,
  mapDispatchToProps
)(MapExtentChooserContainer)
