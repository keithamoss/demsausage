import * as dotProp from 'dot-prop-immutable'
import Icon from 'ol/style/Icon'
import Style from 'ol/style/Style'
import * as sprite from '../../icons/sprite.json'
import { NomsReader } from '../../sausage/noms'
import { IGoogleGeocodeResult } from '../../shared/ui/GooglePlacesAutocomplete/GooglePlacesAutocomplete'
import { IGeoJSONFeatureCollection } from './interfaces'
import { IMapPollingPlaceFeature } from './polling_places'
// import { IAnalytisMeta } from "../../shared/analytics/GoogleAalytics"

// Actions
const STORE_MAP_DATA = 'ealgis/map/STORE_MAP_DATA'
const SEARCH_MAP = 'ealgis/map/SEARCH_MAP'
const GEOCODE_PLACE_RESULT = 'ealgis/map/GEOCODE_PLACE_RESULT'
const CLEAR_MAP_SEARCH = 'ealgis/map/CLEAR_MAP_SEARCH'

const initialState: Partial<IModule> = {
  search: null,
  geojson: {},
  place: undefined,
}

// Reducer
export default function reducer(state: Partial<IModule> = initialState, action: IAction) {
  switch (action.type) {
    case STORE_MAP_DATA:
      return dotProp.set(state, `geojson.${action.electionId}`, action.geojson)
    case SEARCH_MAP:
      return dotProp.set(state, 'search', action.searchParams)
    case CLEAR_MAP_SEARCH:
      return dotProp.set(state, 'search', null)
    case GEOCODE_PLACE_RESULT:
      return dotProp.set(state, 'place', action.place)
    default:
      return state
  }
}

// Action Creators

export function setMapToSearch(searchParams: IMapSearchResults) {
  return {
    type: SEARCH_MAP,
    searchParams,
  }
}

export function clearMapToSearch() {
  return {
    type: CLEAR_MAP_SEARCH,
  }
}

export function storeMapData(electionId: number, geojson: IGeoJSONFeatureCollection) {
  return {
    type: STORE_MAP_DATA,
    electionId,
    geojson,
  }
}

export function setSausageNearMeSearchGeocodePlaceResult(place: IGoogleGeocodeResult) {
  return {
    type: GEOCODE_PLACE_RESULT,
    place,
  }
}

// Models
export interface IModule {
  search: IMapSearchResults | null
  geojson: IMapGeoJSONStore
  place: IGoogleGeocodeResult | undefined
}

export interface IMapGeoJSONStore {
  [key: number]: IGeoJSONFeatureCollection
}

export interface IMapSearchResults {
  lon: number
  lat: number
  extent: [number, number, number, number] | null
  formattedAddress: string
  padding?: boolean
  animation?: boolean
}

export interface IMapFilterOptions {
  vego?: boolean
  halal?: boolean
  coffee?: boolean
  bacon_and_eggs?: boolean
}

export interface IAction {
  type: string
  searchParams?: IMapSearchResults
  electionId?: number
  geojson?: IGeoJSONFeatureCollection
  place?: IGoogleGeocodeResult
  meta?: {
    // analytics: IAnalyticsMeta
  }
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera

// Utilities
const spriteIconConfig = {
  // Core icons
  cake: { zIndex: 2, scale: 0.5 },
  cake_plus: { zIndex: 3, scale: 0.5 },
  cake_run_out: { zIndex: 1, scale: 0.5 },
  cake_tick: { zIndex: 3, scale: 0.5 },
  bbq_and_cake: { zIndex: 2, scale: 0.5 },
  bbq_and_cake_plus: { zIndex: 3, scale: 0.5 },
  bbq_and_cake_run_out: { zIndex: 1, scale: 0.5 },
  bbq_and_cake_tick: { zIndex: 3, scale: 0.5 },
  bbq: { zIndex: 2, scale: 0.5 },
  bbq_plus: { zIndex: 3, scale: 0.5 },
  bbq_run_out: { zIndex: 1, scale: 0.5 },
  bbq_tick: { zIndex: 3, scale: 0.5 },

  // Other icons
  unknown: { zIndex: 0, scale: 1, opacity: 0.4 },

  // Additional info icons
  tick: { zIndex: 2, scale: 0.5 },
  plus: { zIndex: 2, scale: 0.5 },
  run_out: { zIndex: 2, scale: 0.5 },
  red_cross_of_shame: { zIndex: 1, scale: 0.4 },

  // Other noms icons
  vego: { zIndex: 0, scale: 0.5 },
  bacon_and_eggs: { zIndex: 0, scale: 0.5 },
  coffee: { zIndex: 0, scale: 0.5 },
  halal: { zIndex: 0, scale: 0.5 },
}

const spriteIcons = {}
const spriteIconsDetailed = {}
Object.entries(spriteIconConfig).forEach(([iconName, iconConfig]: any) => {
  const spriteConfig = sprite.frames.find((config: any) => config.filename === `${iconName}.png`)

  if (spriteConfig !== undefined) {
    const iconAttributes = {
      src: `/icons/sprite_${sprite.meta.hash}.png`,
      offset: [Math.abs(spriteConfig.frame.x), Math.abs(spriteConfig.frame.y)],
      size: [spriteConfig.spriteSourceSize.w, spriteConfig.spriteSourceSize.h],
      scale: iconConfig.scale,
      opacity: 'opacity' in iconConfig ? iconConfig.opacity : undefined,
    } as any /* IconOptions */

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    spriteIcons[iconName] = new Style({
      image: new Icon(iconAttributes),
      zIndex: iconConfig.zIndex,
    })

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    spriteIconsDetailed[iconName] = new Style({
      image: new Icon({ ...iconAttributes, anchorXUnits: 'pixels', anchorYUnits: 'pixels' }),
      zIndex: 1,
    })
  }
})

export const hasFilterOptions = (mapFilterOptions: IMapFilterOptions) =>
  Object.values(mapFilterOptions).filter((enabled: boolean) => enabled === true).length > 0

export const isFilterEnabled = (option: string, mapFilterOptions: IMapFilterOptions) =>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-next-line
  option in mapFilterOptions && mapFilterOptions[option] === true

export const satisfiesMapFilter = (noms: NomsReader, mapFilterOptions: IMapFilterOptions) => {
  if (hasFilterOptions(mapFilterOptions) && noms.hasAnyNoms() === true) {
    for (const [option, enabled] of Object.entries(mapFilterOptions)) {
      if (enabled === true && noms.hasNomsOption(option) === false) {
        return false
      }
    }
    return true
  }

  return true
}

export const olStyleFunction = (
  feature: IMapPollingPlaceFeature,
  resolution: number,
  mapFilterOptions: IMapFilterOptions
) => {
  const nomsReader = new NomsReader(feature.get('noms'))

  if (nomsReader.hasAnyNoms() === true) {
    if (hasFilterOptions(mapFilterOptions) === true && satisfiesMapFilter(nomsReader, mapFilterOptions) === false) {
      return null
    }

    return resolution >= 7
      ? nomsReader.getIconForNoms(spriteIcons)
      : nomsReader.getDetailedIconsForNoms(spriteIcons, spriteIconsDetailed, feature, resolution)
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore-next-line
  return hasFilterOptions(mapFilterOptions) === false ? spriteIcons.unknown : null
}
