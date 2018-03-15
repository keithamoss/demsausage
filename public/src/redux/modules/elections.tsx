import * as dotProp from "dot-prop-immutable"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { IEALGISApiClient } from "../../redux/modules/interfaces"
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
const LOAD_ELECTIONS = "ealgis/elections/LOAD_ELECTIONS"
const LOAD_ELECTION = "ealgis/elections/LOAD_ELECTION"
const SET_CURRENT_ELECTION = "ealgis/elections/SET_CURRENT_ELECTION"
const SET_DEFAULT_ELECTION = "ealgis/elections/SET_DEFAULT_ELECTION"
const SET_PRIMARY_ELECTION = "ealgis/elections/SET_PRIMARY_ELECTION"

const initialState: Partial<IModule> = {
    elections: [],
}

// Reducer
export default function reducer(state: Partial<IModule> = initialState, action: IAction) {
    switch (action.type) {
        case LOAD_ELECTIONS:
            return dotProp.set(state, "elections", action.elections)
        case LOAD_ELECTION:
            const electionIndex: number = state.elections!.findIndex((election: IElection) => election.id === action.election.id)!

            // Adding a new election at the top
            if (electionIndex === -1) {
                return dotProp.set(state, "elections", [action.election, ...state.elections!])
            } else {
                // Updating an existing election
                return dotProp.set(
                    state,
                    `elections.${electionIndex}`,
                    Object.assign(dotProp.get(state, `elections.${electionIndex}`), action.election)
                )
            }
        case SET_CURRENT_ELECTION:
            return dotProp.set(state, "current_election_id", action.electionId)
        case SET_DEFAULT_ELECTION:
            return dotProp.set(state, "default_election_id", action.electionId)
        case SET_PRIMARY_ELECTION:
            state.elections!.map((election: IElection, index: number) => {
                state = dotProp.set(state, `elections.${index}.is_primary`, election.id === action.electionId ? true : false)
            })
            return state
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

export function setDefaultElection(electionId: number) {
    return {
        type: SET_DEFAULT_ELECTION,
        electionId,
    }
}

export function togglePrimaryElection(electionId: number) {
    return {
        type: SET_PRIMARY_ELECTION,
        electionId,
    }
}

// Models
export interface IModule {
    elections: Array<IElection>
    current_election_id: number // election.id
    default_election_id: number // election.id
}

export interface IAction {
    type: string
    elections: Array<IElection>
    election: Partial<IElection>
    electionId: number
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
    is_primary: boolean
    // stats: {
    //     ttl_booths: number
    //     ttl_bbq: number
    //     ttl_caek: number
    //     ttl_shame: number
    //     ttl_halal?: number
    //     ttl_coffee?: number
    //     ttl_bacon_and_eggs?: number
    //     ttl_free_text?: number
    //     ttl_vego?: number
    // }
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchElections(initialElectionName: string) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.dsAPIGet({ "fetch-elections": 1 }, dispatch)
        if (response.status === 200) {
            dispatch(loadElections(json))

            // Choose a default election to use when the route doesn't specify one
            const defaultElection = getDefaultElection(json)
            dispatch(setDefaultElection(defaultElection!.id))

            // Ensure there's always a current election set. Other components
            // will set this properly when they mount if needs be.
            dispatch(setCurrentElection(defaultElection!.id))
        }
    }
}

export function getDefaultElection(elections: Array<IElection>) {
    let defaultElection

    // If there's a primary election, that's our first choice
    const primaryElection = elections.find((election: IElection) => election.is_primary)
    if (primaryElection !== undefined) {
        defaultElection = primaryElection
    } else {
        // Failing that, just the first active election
        const firstActiveElection = elections.find((election: IElection) => election.is_active)
        if (firstActiveElection !== undefined) {
            defaultElection = firstActiveElection
        } else {
            // If there are no active elections at all just grab the most recent one
            defaultElection = elections[0]
        }
    }

    return defaultElection
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

export function setPrimaryElection(electionId: number) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const params = {
            "set-primary-election": 1,
            electionId: electionId,
        }

        const { response } = await ealapi.dsAPIGet(params, dispatch)

        if (response.status === 200) {
            dispatch(togglePrimaryElection(electionId))
            dispatch(sendSnackbarNotification("Primary election changed! 🌟🎉"))
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

export function getURLSafeElectionName(election: IElection) {
    return encodeURI(election.name.replace(/\s/g, "_").toLowerCase())
}

// export function getElectionStatsDescription(election: IElection) {
//     const description: Array<string> = []

//     description.push(`Sausage Sizzles: ${election.stats.ttl_bbq}`)
//     description.push(`Cake Stalls: ${election.stats.ttl_caek}`)
//     description.push(`Red Crosses of Shame: ${election.stats.ttl_shame}`)

//     if ("ttl_coffee" in election.stats) {
//         description.push(`Coffee Vans: ${election.stats.ttl_coffee}`)
//     }

//     if ("ttl_bacon_and_eggs" in election.stats) {
//         description.push(`Bacon and Egg Rolls: ${election.stats.ttl_bacon_and_eggs}`)
//     }

//     if ("ttl_halal" in election.stats) {
//         description.push(`Halal Options: ${election.stats.ttl_halal}`)
//     }

//     if ("ttl_vego" in election.stats) {
//         description.push(`Vegetarian Options: ${election.stats.ttl_vego}`)
//     }

//     if ("ttl_free_text" in election.stats) {
//         description.push(`Drinks, icey poles, and other miscellaneous: ${election.stats.ttl_free_text}`)
//     }

//     return `${election.stats.ttl_booths} polling booths. ${description.join(", ")}`
// }
