import * as dotProp from "dot-prop-immutable"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { IEALGISApiClient } from "../../redux/modules/interfaces"
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
const LOAD_ELECTIONS = "ealgis/elections/LOAD_ELECTIONS"
const LOAD_ELECTION = "ealgis/elections/LOAD_ELECTION"
const SET_CURRENT_ELECTION = "ealgis/elections/SET_CURRENT_ELECTION"

const initialState: Partial<IModule> = {
    elections: [],
}

// Reducer
export default function reducer(state: Partial<IModule> = initialState, action: IAction) {
    switch (action.type) {
        case LOAD_ELECTIONS:
            return dotProp.set(state, "elections", action.elections)
        case LOAD_ELECTION:
            let election: Partial<IElection>
            if (action.election.id! in state.elections!) {
                election = Object.assign({}, state.elections![action.election.id!], action.election)
            } else {
                election = Object.assign({}, action.election)
            }
            return dotProp.set(state, `elections.${action.election.id}`, election)
        case SET_CURRENT_ELECTION:
            return dotProp.set(state, "current_election_id", action.electionId)
        default:
            return state
    }
}

// Action Creators
export function loadElections(elections: Array<IElection>) {
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

export function setCurrentElection(electionId: number) {
    return {
        type: SET_CURRENT_ELECTION,
        electionId,
    }
}

// Models
export interface IModule {
    elections: Array<IElection>
    current_election_id: number // election.id
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

export interface IElection {
    id: number
    lon: number
    lat: number
    name: string
    short_name: string
    default_zoom_level: number
    has_division_boundaries: boolean
    db_table_name: string
    is_active: boolean
    hidden: boolean
    election_day: string // Datetime
    polling_places_loaded: boolean
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchElections() {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.dsAPIGet({ "fetch-all-elections": 1 }, dispatch)
        if (response.status === 200) {
            dispatch(loadElections(json))

            // If our route doesn't dictate that we're looking at an election, then just grab the
            // first election that's active
            if (getState().elections.current_election_id === undefined) {
                const activeElection = json.find((election: IElection) => election.is_active)
                dispatch(setCurrentElection(activeElection.id))
            }
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
            electionNew.id = election.id
            dispatch(loadElection(electionNew))
            dispatch(sendSnackbarNotification("Election updated! 🌭🎉"))
            return json
        }
    }
}

export function setElectionTableName(election: IElection, newDBTableName: string) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(
            loadElection({
                id: election.id,
                db_table_name: newDBTableName,
            })
        )
    }
}
