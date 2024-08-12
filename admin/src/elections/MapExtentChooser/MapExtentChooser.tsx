/* eslint-disable import/extensions, import/no-duplicates */
import { MenuItem, SelectField } from 'material-ui'
import GeoJSON from 'ol/format/GeoJSON'
import Geometry from 'ol/geom/Geometry'
// import GeometryType from 'ol/geom/GeometryType'
import Polygon from 'ol/geom/Polygon'
import Draw from 'ol/interaction/Draw'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-next-line
import { createBox, DrawEvent } from 'ol/interaction/Draw.js'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import Map from 'ol/Map'
import 'ol/ol.css'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import View from 'ol/View'
import * as React from 'react'
import { IElection } from '../../redux/modules/elections'
import { IGeoJSON } from '../../redux/modules/interfaces'

interface IProps {
  elections: IElection[]
  value: IGeoJSON | undefined
  onChange: (geojson: IGeoJSON) => void
}

type TComponentProps = IProps
class MapExtentChooser extends React.PureComponent<TComponentProps, {}> {
  private map: Map | undefined

  public componentDidMount() {
    this.map = new Map({
      layers: [
        new TileLayer({
          source: new OSM({
            attributions: ['© <a href="https://www.openstreetmap.org/copyright"> OpenStreetMap contributors</a>'],
          }),
        }),
      ],
      target: 'map',
      view: new View({
        center: [13668163.65, -2988993.54],
        zoom: 3,
      }),
    })

    if (this.props.value !== undefined) {
      const view = this.map.getView()
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore-next-line
      const polygon = new Polygon(this.props.value.coordinates).transform('EPSG:4326', 'EPSG:3857')
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore-next-line
      view.fit(polygon, {
        size: this.map.getSize(),
      })
    }

    const source = this.createDrawingVectorLayer()
    this.createDrawingInteraction(source)
  }

  private createDrawingVectorLayer() {
    if (this.map !== undefined) {
      let source
      if (this.props.value !== undefined) {
        source = new VectorSource({
          wrapX: false,
          features: new GeoJSON().readFeatures(this.props.value, {
            featureProjection: 'EPSG:3857',
            dataProjection: 'EPSG:4326',
          }),
        })
      } else {
        source = new VectorSource({ wrapX: false })
      }

      const vector = new VectorLayer({
        source,
      })
      vector.setProperties({ owner: 'drawing-interaction' })

      this.map.addLayer(vector)
      return source
    }
    return null
  }

  private createDrawingInteraction(source: VectorSource<Geometry> | null) {
    if (this.map !== undefined && source !== null) {
      const draw = new Draw({
        source,
        // type: GeometryType.CIRCLE,
        type: 'Circle',
        geometryFunction: createBox(),
      })
      draw.on('drawstart', (_event: DrawEvent) => {
        source.clear()
      })
      draw.on('drawend', (event: DrawEvent) => {
        const writer = new GeoJSON()
        const feature = writer.writeFeatureObject(event.feature, {
          featureProjection: 'EPSG:3857',
          dataProjection: 'EPSG:4326',
        })
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore-next-line
        this.props.onChange(feature.geometry)
      })
      this.map.addInteraction(draw)
    }
  }

  public render() {
    const { elections } = this.props

    return (
      <React.Fragment>
        <div id="map" style={{ width: 400, height: 300, paddingTop: 20, paddingBottom: 20 }} />

        <div>OR</div>

        <SelectField
          floatingLabelText="Use existing geometry"
          onChange={(_e: any, _key: number, geojson: string) => this.props.onChange(JSON.parse(geojson))}
        >
          {elections.map((elec: IElection) => (
            <MenuItem key={elec.id} value={JSON.stringify(elec.geom)} primaryText={elec.name} />
          ))}
        </SelectField>
      </React.Fragment>
    )
  }
}

export default MapExtentChooser
