import * as dotProp from 'dot-prop-immutable'
import { sendNotification as sendSnackbarNotification } from './snackbars'
import { IAPIClient } from '../../shared/api/APIClient'
import { getPublicSiteBaseURL } from './app'
import { getURLSafeElectionName, IElection } from './elections'
import { IGeoJSON } from './interfaces'
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

export function loadPollingPlaceTypes(pollingPlaceTypes: IPollingPlaceFacilityType[]) {
  return {
    type: LOAD_TYPES,
    pollingPlaceTypes,
  }
}

// Models
export interface IModule {
  types: IPollingPlaceFacilityType[]
  by_election: {
    [key: number]: Array<IPollingPlace>
  }
}

export interface IAction {
  type: string
  election: IElection
  pollingPlaces: Array<IPollingPlace>
  pollingPlaceTypes: IPollingPlaceFacilityType[]
  errors?: object
  meta?: {
    // analytics: IAnalyticsMeta
  }
}

export interface IPollingPlaceFacilityType {
  name: string
}

export interface INoms {
  bbq?: boolean
  cake?: boolean
  nothing?: boolean
  run_out?: boolean
  bacon_and_eggs?: boolean
  halal?: boolean
  vego?: boolean
  coffee?: boolean
  free_text?: string
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

export enum PollingPlaceLoaderResponseMessageStatus {
  ERROR = 'ERROR',
  CHECK = 'CHECK',
  INFO = 'INFO',
  WARNING = 'WARNING',
}

export interface IPollingPlaceLoaderResponseMessages {
  message: string
  logs: {
    errors: Array<string>
    warnings: Array<string>
    info: Array<string>
  }
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function searchPollingPlaces(election: IElection, searchTerm: string) {
  return async (dispatch: Function, getState: Function, api: IAPIClient) => {
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
  return async (dispatch: Function, getState: Function, api: IAPIClient) => {
    const { response, json } = await api.get('/0.1/polling_places/search/', dispatch, {
      election_id: election.id,
    })

    if (response.status === 200) {
      dispatch(loadPollingPlacesForElection(election, json))
    }
  }
}

export function fetchPollingPlacesByIds(election: IElection, pollingPlaceIds: Array<number>) {
  return async (dispatch: Function, getState: Function, api: IAPIClient) => {
    const { response, json } = await api.get('/0.1/polling_places/search/', dispatch, {
      election_id: election.id,
      ids: pollingPlaceIds.join(','),
    })

    if (response.status === 200) {
      return json
    }
  }
}

export function fetchPollingPlacesWithoutFacilityTypes(election: IElection) {
  return async (dispatch: Function, getState: Function, api: IAPIClient) => {
    const { response, json } = await api.get('/0.1/polling_places/without_facility_type/', dispatch, {
      election_id: election.id,
    })

    if (response.status === 200) {
      return json
    }
    return null
  }
}

export function fetchFavouritedPollingPlaces(election: IElection) {
  return async (dispatch: Function, getState: Function, api: IAPIClient) => {
    const { response, json } = await api.get('/0.1/polling_places/favourited/', dispatch, {
      election_id: election.id,
    })

    if (response.status === 200) {
      return json
    }
    return null
  }
}

export function updatePollingPlace(
  election: IElection,
  pollingPlace: IPollingPlace,
  pollingPlaceNew: any /* Partial<IPollingPlace> */
) {
  return async (dispatch: Function, getState: Function, api: IAPIClient) => {
    const { response, json } = await api.patch(`/0.1/polling_places/${pollingPlace.id}/`, pollingPlaceNew, dispatch)

    if (response.status === 200) {
      dispatch(sendSnackbarNotification('Polling place updated! 🌭🎉'))
      return json
    }
  }
}

export function loadPollingPlaces(election: IElection, file: File, config: string | undefined, dryRun: boolean) {
  return async (dispatch: Function, getState: Function, api: IAPIClient) => {
    const data = new FormData()
    data.append('file', file)
    data.append('dry_run', dryRun === true ? '1' : '0')
    if (config !== undefined) {
      data.append('config', config)
    }

    const { json } = await api.put(
      `/0.1/elections/${election.id}/polling_places/`,
      data,
      { 'Content-Disposition': 'attachment; filename=polling_places.csv' },
      dispatch
    )

    return json
  }
}

export function fetchPollingPlaceTypes() {
  return async (dispatch: Function, getState: Function, api: IAPIClient) => {
    const { response, json } = await api.get('/0.1/polling_places_facility_types/', dispatch)

    if (response.status === 200) {
      dispatch(loadPollingPlaceTypes(json))
    }
  }
}

export function regenerateMapDataForElection(election: IElection) {
  return async (dispatch: Function, getState: Function, api: IAPIClient) => {
    const response = await api.delete('/0.1/map/clear_cache/', dispatch, {
      election_id: election.id,
    })

    if (response.status !== 200) {
      dispatch(sendSnackbarNotification('Error clearing polling place data cache'))
    } else if (response.status === 200) {
      const { response } = await api.get('/0.1/map/', dispatch, {
        election_id: election.id,
      })

      if (response.status === 200) {
        dispatch(sendSnackbarNotification('Polling place data regenerated! 🌭🎉'))
      }
    }
  }
}

// Utilities
export const getPollingPlacePermalink = (election: IElection, pollingPlace: IPollingPlace) =>
  encodeURI(
    `${getPublicSiteBaseURL()}/${getURLSafeElectionName(election)}/polling_places/${pollingPlace.name}/${
      pollingPlace.premises
    }/${pollingPlace.state}/`.replace(/\s/g, '_')
  )

export function buildNomsObject(stallNoms: INoms | null) {
  if (stallNoms === null) {
    return {}
  }

  const noms = {}
  const keys = ['bbq', 'cake', 'nothing', 'run_out', 'coffee', 'vego', 'halal', 'bacon_and_eggs', 'free_text']

  keys.forEach((key: string) => {
    const value = stallNoms[key]

    if (key !== 'free_text') {
      if (value === true) {
        noms[key] = value
      }
    } else if (value !== '') {
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
    noms.push('vegetarian options')
  }
  if ('halal' in pollingPlace.stall.noms && pollingPlace.stall.noms.halal) {
    noms.push('halal options')
  }
  if ('coffee' in pollingPlace.stall.noms && pollingPlace.stall.noms.coffee) {
    noms.push('coffee')
  }
  return noms.join(', ')
}

export const getPollingPlaceLongName = (pollingPlace: IPollingPlace) => {
  if (pollingPlace.name === pollingPlace.premises) {
    return pollingPlace.name
  }
  return `${pollingPlace.name}, ${pollingPlace.premises}`
}

export function getWheelchairAccessDescription(pollingPlace: IPollingPlace) {
  if (pollingPlace.wheelchair_access === '' || pollingPlace.wheelchair_access === null) {
    return 'None'
  }
  return pollingPlace.wheelchair_access
}
