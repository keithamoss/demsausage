import * as dotProp from "dot-prop-immutable"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { IEALGISApiClient, IElection } from "../../redux/modules/interfaces"
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
// const LOAD_SEARCH_RESULTS = "ealgis/polling_places/LOAD_SEARCH_RESULTS"
const VALIDATION_ERRORS = "ealgis/polling_places/VALIDATION_ERRORS"

const initialState: Partial<IModule> = {
  // searchResults: [] as Array<IPollingPlace>,
}

// Reducer
export default function reducer(state: Partial<IModule> = initialState, action: IAction) {
  switch (action.type) {
    default:
      return state
  }
}

export const reduxFormReducer = (state: {}, action: any) => {
  switch (action.type) {
    case VALIDATION_ERRORS:
      state = dotProp.set(state, "submitSucceeded", false)
      return dotProp.merge(state, "syncErrors", action.errors)
    default:
      return state
  }
}

// Action Creators
// export function loadSearchResults(pollingPlaces: Array<IPollingPlace>) {
//     return {
//         type: LOAD_SEARCH_RESULTS,
//         pollingPlaces,
//     }
// }

// Models
export interface IModule {
  // searchResults: Array<IPollingPlace>
}

export interface IAction {
  type: string
  // pollingPlaces: Array<IPollingPlace>
  errors?: object
  meta?: {
    // analytics: IAnalyticsMeta
  }
}

export interface IPollingPlace {
  id: number
  lon: number
  lat: number
  has_bbq: boolean
  has_nothing: boolean
  has_caek: boolean
  has_run_out: boolean
  has_other: object
  chance_of_sausage: number
  stall_name: string
  stall_description: string
  stall_website: string
  first_report: string // Datetime
  latest_report: string // Datetime
  polling_place_name: string
  polling_place_type: string
  extra_info: string
  booth_info: string
  wheelchairaccess: string
  opening_hours: string
  premises: string
  address: string
  division: string
  state: string
  source: string
  ess_stall_id: number
  ess_stall_url: string
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
  return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
    const params = { "search-polling-places": 1, searchTerm: searchTerm, electionName: election.db_table_name }
    const { response, json } = await ealapi.dsAPIGet(params, dispatch)

    if (response.status === 200) {
      return json
    }
  }
}

export function fetchPollingPlacesByIds(election: IElection, pollingPlaceIds: Array<number>) {
  return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
    const params = { "fetch-polling-places": 1, pollingPlaceIds: pollingPlaceIds, electionName: election.db_table_name }
    const { response, json } = await ealapi.dsAPIGet(params, dispatch)

    if (response.status === 200) {
      return json
    }
  }
}

export function updatePollingPlace(election: IElection, pollingPlace: IPollingPlace, pollingPlaceNew: Partial<IPollingPlace>) {
  return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
    if (pollingPlace.first_report === "") {
      pollingPlaceNew.first_report = "strftime('%Y-%m-%d %H:%M:%f','now') || '+00'"
    }
    pollingPlaceNew.latest_report = "strftime('%Y-%m-%d %H:%M:%f','now') || '+00'"

    const params = {
      "update-polling-place": 1,
      pollingPlaceId: pollingPlace.id,
      pollingPlace: pollingPlaceNew,
      electionName: election.db_table_name,
    }

    const { response, json } = await ealapi.dsAPIGet(params, dispatch)

    if (response.status === 200) {
      dispatch(sendSnackbarNotification("Polling place updated! 🌭🎉"))
      return json
    }
  }
}

export function loadPollingPlaces(election: IElection, file: File) {
  return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
    const params = {
      "load-polling-places": 1,
      electionId: election.id,
      dryrun: false,
    }

    const { response, json } = await ealapi.dsAPIPostFile(params, file, dispatch)

    if (response.status === 200) {
      return json
    }
  }
}
