import * as dotProp from 'dot-prop-immutable'
import { purple200, purple300, purple400, purple500, purple600 } from 'material-ui/styles/colors'
import { IAPIClient } from '../../shared/api/APIClient'
import { getBaseURL } from './app'
import { getURLSafeElectionName, IElection } from './elections'
import { IGeoJSON } from './interfaces'
import { sendNotification, sendNotification as sendSnackbarNotification } from './snackbars'
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
const LOAD = 'ealgis/polling_places/LOAD'
const LOAD_TYPES = 'ealgis/polling_places/LOAD_TYPES'
const VALIDATION_ERRORS = 'ealgis/polling_places/VALIDATION_ERRORS'

const initialState: Partial<IModule> = {
  types: [],
  by_election: {},
}

// Reducer
export default function reducer(state: Partial<IModule> = initialState, action: IAction) {
  switch (action.type) {
    case LOAD:
      return dotProp.set(state, `by_election.${action.election.id}`, action.pollingPlaces)
    case LOAD_TYPES:
      return dotProp.set(state, 'types', action.pollingPlaceTypes)
    default:
      return state
  }
}

export const reduxFormReducer = (state: {}, action: any) => {
  switch (action.type) {
    case VALIDATION_ERRORS:
      // eslint-disable-next-line no-param-reassign
      state = dotProp.set(state, 'submitSucceeded', false)
      return dotProp.merge(state, 'syncErrors', action.errors)
    default:
      return state
  }
}

// Action Creators
export function loadPollingPlacesForElection(election: IElection, pollingPlaces: Array<IPollingPlace>) {
  return {
    type: LOAD,
    election,
    pollingPlaces,
  }
}

export function loadPollingPlaceTypes(pollingPlaceTypes: Array<string>) {
  return {
    type: LOAD_TYPES,
    pollingPlaceTypes,
  }
}

// Models
export interface IModule {
  types: Array<string>
  by_election: {
    [key: number]: Array<IPollingPlace>
  }
}

export interface IAction {
  type: string
  election: IElection
  pollingPlaces: Array<IPollingPlace>
  pollingPlaceTypes: Array<string>
  errors?: object
  meta?: {
    // analytics: IAnalyticsMeta
  }
}

// @FIXME Use the inbuilt OLFeature type when we upgrade
export interface IMapPollingPlaceFeature {
  getId: Function
  getProperties: Function
  get: Function
}

export interface IMapPollingPlaceGeoJSONProperties {
  name: string
  premises: string
  noms: IMapPollingGeoJSONNoms | null
  ec_id: number | null
}

export interface IMapPollingGeoJSONNoms {
  bbq?: boolean
  cake?: boolean
  nothing?: boolean
  run_out?: boolean
  bacon_and_eggs?: boolean
  halal?: boolean
  vego?: boolean
  coffee?: boolean
  free_text?: boolean // This is actually a boolean - Map GeoJSON returns summary info only
}

export interface INoms {
  bbq: boolean
  cake: boolean
  nothing?: boolean
  run_out?: boolean
  bacon_and_eggs: boolean
  halal: boolean
  vego: boolean
  coffee: boolean
  free_text: string | null
}

export interface IPollingPlaceStall {
  noms: INoms
  name: string
  description: string
  opening_hours: string
  favourited: boolean
  website: string
  extra_info: string
  first_report: string | null // Datetime
  latest_report: string | null // Datetime
  source: string
}

export enum PollingPlaceChanceOfSausage {
  NO_IDEA = 0,
  UNLIKELY = 1,
  MIXED = 2,
  FAIR = 3,
  STRONG = 4,
}

export interface IPollingPlace {
  id: number
  name: string
  geom: IGeoJSON
  facility_type: string | null
  booth_info: string
  wheelchair_access: string
  entrance_desc: string
  opening_hours: string
  premises: string
  address: string
  divisions: string[]
  state: string
  chance_of_sausage: PollingPlaceChanceOfSausage | null
  stall: IPollingPlaceStall | null
}

export interface IPollingPlaceSearchResult extends IPollingPlace {
  distance_km: number
}

export interface IPollingPlaceLoaderResponse {
  error: boolean
  messages: Array<IPollingPlaceLoaderResponseMessage>
  table_name: string
  dryrun: boolean
}

export interface IPollingPlaceLoaderResponseMessage {
  level: string
  message: string
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function searchPollingPlaces(election: IElection, searchTerm: string) {
  // eslint-disable-next-line consistent-return
  return async (dispatch: Function, _getState: Function, api: IAPIClient) => {
    const { response, json } = await api.get('/0.1/polling_places/search/', dispatch, {
      election_id: election.id,
      search_term: searchTerm,
    })
    if (response.status === 200) {
      return json
    }
  }
}

export function fetchAllPollingPlaces(election: IElection) {
  // eslint-disable-next-line consistent-return
  return async (dispatch: Function, _getState: Function, api: IAPIClient) => {
    const { response, json } = await api.get('/0.1/polling_places/search/', dispatch, {
      election_id: election.id,
    })

    if (response.status === 200) {
      dispatch(loadPollingPlacesForElection(election, json))
    }
  }
}

export function fetchPollingPlacesByIds(election: IElection, pollingPlaceIds: Array<number>) {
  // eslint-disable-next-line consistent-return
  return async (dispatch: Function, _getState: Function, api: IAPIClient) => {
    const { response, json } = await api.get('/0.1/polling_places/search/', dispatch, {
      election_id: election.id,
      ids: pollingPlaceIds.join(','),
    })

    if (response.status === 200) {
      return json
    }
  }
}

export function updatePollingPlace(
  _election: IElection,
  pollingPlace: IPollingPlace,
  pollingPlaceNew: any /* Partial<IPollingPlace> */
) {
  // eslint-disable-next-line consistent-return
  return async (dispatch: Function, _getState: Function, api: IAPIClient) => {
    const { response, json } = await api.patch(`/0.1/polling_places/${pollingPlace.id}/`, pollingPlaceNew, dispatch)

    if (response.status === 200) {
      dispatch(sendSnackbarNotification('Polling place updated! 🌭🎉'))
      return json
    }
  }
}

export function fetchNearbyPollingPlaces(election: IElection, lat: number, lon: number) {
  // eslint-disable-next-line consistent-return
  return async (dispatch: Function, _getState: Function, api: IAPIClient) => {
    const { response, json } = await api.get('/0.1/polling_places/nearby/', dispatch, {
      election_id: election.id,
      lonlat: `${lon},${lat}`,
    })

    if (response.status === 200) {
      return json
    }
  }
}

export function fetchNearbyPollingPlacesBBOX(election: IElection, lat: number, lon: number) {
  // eslint-disable-next-line consistent-return
  return async (dispatch: Function, _getState: Function, api: IAPIClient) => {
    const { response, json } = await api.get('/0.1/polling_places/nearby_bbox/', dispatch, {
      election_id: election.id,
      lonlat: `${lon},${lat}`,
    })

    if (response.status === 200) {
      if (json.extent_wgs84 !== null) {
        return json.extent_wgs84
      }
      dispatch(sendNotification("There aren't any polling places near here :("))
      return null
    }
  }
}

export function lookupPollingPlaces(election: IElection, name: string, premises: string, state: string) {
  return async (dispatch: Function, _getState: Function, api: IAPIClient) => {
    const { response, json } = await api.get('/0.1/polling_places/lookup/', dispatch, {
      election_id: election.id,
      name,
      premises,
      state,
    })

    if (response.status === 200) {
      return json
    }
    return null
  }
}

export function lookupPollingPlacesByECId(election: IElection, ecId: string) {
  return async (dispatch: Function, _getState: Function, api: IAPIClient) => {
    const { response, json } = await api.get('/0.1/polling_places/lookup/', dispatch, {
      election_id: election.id,
      ec_id: ecId,
    })

    if (response.status === 200) {
      return json
    }
    return null
  }
}

export function lookupPollingPlacesByStallId(election: IElection, stallId: string) {
  return async (dispatch: Function, _getState: Function, api: IAPIClient) => {
    const { response, json } = await api.get('/0.1/polling_places/stall_lookup/', dispatch, {
      election_id: election.id,
      stall_id: stallId,
    })

    if (response.status === 200) {
      return json
    }
    return null
  }
}

// Utilities
export const getPollingPlacePermalink = (election: IElection, pollingPlace: IPollingPlace) =>
  encodeURI(
    `${getBaseURL()}/${getURLSafeElectionName(election)}/polling_places/${pollingPlace.name}/${pollingPlace.premises}/${
      pollingPlace.state
    }/`.replace(/\s/g, '_')
  )

export function buildNomsObject(stallNoms: INoms | null) {
  if (stallNoms === null) {
    return {}
  }

  const noms = {}
  const keys = ['bbq', 'cake', 'nothing', 'run_out', 'coffee', 'vego', 'halal', 'bacon_and_eggs', 'free_text']

  keys.forEach((key: string) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    const value = stallNoms[key]

    if (key !== 'free_text') {
      if (value === true) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore-next-line
        noms[key] = value
      }
    } else if (value !== '') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore-next-line
      noms[key] = value
    }
  })

  return noms
}
export function pollingPlaceHasReports(pollingPlace: IPollingPlace) {
  if (pollingPlace.stall === null || pollingPlace.stall.noms === null) {
    return false
  }

  for (const [key, value] of Object.entries(pollingPlace.stall.noms)) {
    if (key !== 'free_text') {
      if (value === true) {
        return true
      }
    } else if (value !== '') {
      return true
    }
  }
  return false
}

export function pollingPlaceHasReportsOfNoms(pollingPlace: IPollingPlace) {
  if (pollingPlace.stall === null || pollingPlace.stall.noms === null) {
    return false
  }

  for (const [key, value] of Object.entries(pollingPlace.stall.noms)) {
    if (key === 'run_out' || key === 'nothing') {
      // eslint-disable-next-line no-continue
      continue
    }

    if (key !== 'free_text') {
      if (value === true) {
        return true
      }
    } else if (value !== '') {
      return true
    }
  }
  return false
}

export function getSausageChanceNumericIndicator(pollingPlace: IPollingPlace) {
  switch (pollingPlace.chance_of_sausage) {
    case PollingPlaceChanceOfSausage.STRONG:
      return 4
    case PollingPlaceChanceOfSausage.FAIR:
      return 3
    case PollingPlaceChanceOfSausage.MIXED:
      return 2
    case PollingPlaceChanceOfSausage.UNLIKELY:
      return 1
    case PollingPlaceChanceOfSausage.NO_IDEA:
      return 0
    default:
      return 0
  }
}

export function getSausageChancColourIndicator(pollingPlace: IPollingPlace) {
  switch (pollingPlace.chance_of_sausage) {
    case PollingPlaceChanceOfSausage.STRONG:
      return purple600
    case PollingPlaceChanceOfSausage.FAIR:
      return purple500
    case PollingPlaceChanceOfSausage.MIXED:
      return purple400
    case PollingPlaceChanceOfSausage.UNLIKELY:
      return purple300
    case PollingPlaceChanceOfSausage.NO_IDEA:
      return purple200
    default:
      return purple200
  }
}

export function getSausageChanceDescription(pollingPlace: IPollingPlace) {
  switch (pollingPlace.chance_of_sausage) {
    case PollingPlaceChanceOfSausage.STRONG:
      return 'Based on past elections this booth has a STRONG chance of having food.'
    case PollingPlaceChanceOfSausage.FAIR:
      return 'Based on past elections this booth has a FAIR chance of having food.'
    case PollingPlaceChanceOfSausage.MIXED:
      return 'Based on past elections this booth has a MIXED chance of having food.'
    case PollingPlaceChanceOfSausage.UNLIKELY:
      return 'Based on past elections this booth is UNLIKELY to have food.'
    case PollingPlaceChanceOfSausage.NO_IDEA:
      return 'We have never had reports from this booth. Let us know what you find!'
    default:
      return 'We have never had reports from this booth. Let us know what you find!'
  }
}

export function getFoodDescription(pollingPlace: IPollingPlace) {
  if (pollingPlace.stall === null || pollingPlace.stall.noms === null) {
    return ''
  }

  const noms: Array<string> = []
  if (pollingPlace.stall.noms.bbq) {
    noms.push('sausage sizzle')
  }
  if (pollingPlace.stall.noms.cake) {
    noms.push('cake stall')
  }
  if ('bacon_and_eggs' in pollingPlace.stall.noms && pollingPlace.stall.noms.bacon_and_eggs) {
    noms.push('bacon and egg burgers')
  }
  if ('vego' in pollingPlace.stall.noms && pollingPlace.stall.noms.vego) {
    noms.push('savoury vegetarian options')
  }
  if ('halal' in pollingPlace.stall.noms && pollingPlace.stall.noms.halal) {
    noms.push('halal options')
  }
  if ('coffee' in pollingPlace.stall.noms && pollingPlace.stall.noms.coffee) {
    noms.push('coffee')
  }
  return noms.join(', ')
}

export function hasAnyWheelchairAccess(pollingPlace: IPollingPlace) {
  return !(
    pollingPlace.wheelchair_access === '' ||
    pollingPlace.wheelchair_access === 'None' ||
    pollingPlace.wheelchair_access === 'No wheelchair access' ||
    pollingPlace.wheelchair_access === 'No Access' ||
    pollingPlace.wheelchair_access === null
  )
}

export function getWheelchairAccessDescription(pollingPlace: IPollingPlace) {
  return hasAnyWheelchairAccess(pollingPlace) === true ? pollingPlace.wheelchair_access : 'None'
}

export const getBBoxFromPollingPlaces = (pollingPlaces: IPollingPlace[]) => {
  return {
    lat_top: Math.max(...pollingPlaces.map((p) => p.geom.coordinates[1])),
    lat_bottom: Math.min(...pollingPlaces.map((p) => p.geom.coordinates[1])),
    lon_left: Math.min(...pollingPlaces.map((p) => p.geom.coordinates[0])),
    lon_right: Math.max(...pollingPlaces.map((p) => p.geom.coordinates[0])),
  }
}
