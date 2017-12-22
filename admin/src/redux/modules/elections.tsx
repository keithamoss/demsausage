import * as dotProp from "dot-prop-immutable"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { IEALGISApiClient } from "../../redux/modules/interfaces"
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
const LOAD_ELECTIONS = "ealgis/elections/LOAD_ELECTIONS"
const LOAD_ELECTION = "ealgis/elections/LOAD_ELECTION"
const SET_CURRENT_ELECTION = "ealgis/elections/SET_CURRENT_ELECTION"

const initialState: Partial<IModule> = {
  elections: {} as IElections,
}

// Reducer
export default function reducer(state: Partial<IModule> = initialState, action: IAction) {
  switch (action.type) {
    case LOAD_ELECTIONS:
      return dotProp.set(state, "elections", action.elections)
    case LOAD_ELECTION:
      let election: Partial<IElection>
      if (action.election.db_table_name! in state.elections!) {
        election = Object.assign({}, state.elections![action.election.db_table_name!], action.election)
      } else {
        election = Object.assign({}, action.election)
      }
      return dotProp.set(state, `elections.${action.election.db_table_name}`, election)
    case SET_CURRENT_ELECTION:
      return dotProp.set(state, "current_election_id", action.electionId)
    default:
      return state
  }
}

// Action Creators
export function loadElections(elections: IElections) {
  return {
    type: LOAD_ELECTIONS,
    elections,
  }
}

export function loadElection(election: Partial<IElection>) {
  return {
    type: LOAD_ELECTION,
    election,
  }
}

export function setCurrentElection(electionId: string) {
  return {
    type: SET_CURRENT_ELECTION,
    electionId,
  }
}

// Models
export interface IModule {
  elections: IElections
  current_election_id: string // election.db_table_name
}

export interface IAction {
  type: string
  elections: Array<IElection>
  election: Partial<IElection>
  electionId: string
  meta?: {
    // analytics: IAnalyticsMeta
  }
}

export interface IElections {
  [key: string]: IElection
}

export interface IElection {
  id: number
  lon: number
  lat: number
  name: string
  default_zoom_level: number
  has_division_boundaries: boolean
  db_table_name: string
  is_active: boolean
  hidden: boolean
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchElections() {
  return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
    const { response, json } = await ealapi.dsAPIGet({ "fetch-elections": 1 }, dispatch)
    if (response.status === 200) {
      // Map elections from an array of objects to a dict keyed by db_table_name
      const elections = Object.assign(
        {},
        ...json.map((election: IElection, index: number, array: Array<IElection>) => ({ [election.db_table_name]: election }))
      )
      dispatch(loadElections(elections))

      const activeElection = json.find((election: IElection) => election.is_active)
      dispatch(setCurrentElection(activeElection.db_table_name))
    }
  }
}

export function createElection(electionNew: Partial<IElection>) {
  return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
    const params = {
      "create-election": 1,
      election: electionNew,
    }

    const { response, json } = await ealapi.dsAPIGet(params, dispatch)

    if (response.status === 200) {
      dispatch(loadElection(json))
      dispatch(sendSnackbarNotification("Election created! 🌭🎉"))
      return json
    }
  }
}

export function updateElection(election: IElection, electionNew: Partial<IElection>) {
  return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
    const params = {
      "update-election": 1,
      electionId: election.id,
      election: electionNew,
    }

    const { response, json } = await ealapi.dsAPIGet(params, dispatch)

    if (response.status === 200) {
      dispatch(loadElection(electionNew))
      dispatch(sendSnackbarNotification("Election updated! 🌭🎉"))
      return json
    }
  }
}
