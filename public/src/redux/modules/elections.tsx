import * as dotProp from "dot-prop-immutable"
import { DateTime } from "luxon"
import { createSelector } from "reselect"
import { IAPIClient } from "../../shared/api/APIClient"
import { IGeoJSONPoint } from "./interfaces"
import { IStore } from "./reducer"
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
                return dotProp.set(state, `elections.${electionIndex}`, {
                    ...dotProp.get(state, `elections.${electionIndex}`),
                    ...action.election,
                })
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

// Selectors
const getElections = (state: IStore) => state.elections.elections

export const getLiveElections = createSelector(
    [getElections],
    (elections: IElection[]): any => {
        return elections.filter((election: IElection) => isElectionLive(election))
    }
)

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
    name: string
    short_name: string
    geom: IGeoJSONPoint
    default_zoom_level: number
    is_hidden: boolean
    is_primary: boolean
    election_day: string // Datetime
    polling_places_loaded: boolean
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
export function fetchElections(includeHidden: boolean = false) {
    return async (dispatch: Function, getState: Function, api: IAPIClient) => {
        const { response, json } = await api.get("/api/0.1/elections/", dispatch, { includeHidden: includeHidden })

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
        const firstLiveElection = elections.find((election: IElection) => isElectionLive(election))
        if (firstLiveElection !== undefined) {
            defaultElection = firstLiveElection
        } else {
            // If there are no active elections at all just grab the most recent one
            defaultElection = elections[0]
        }
    }

    return defaultElection
}

// export function setElectionTableName(election: IElection, newDBTableName: string) {
//     return async (dispatch: Function, getState: Function, api: IAPIClient) => {
//         dispatch(
//             loadElection({
//                 id: election.id,
//                 db_table_name: newDBTableName,
//             })
//         )
//     }
// }

// Utilities
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

export function isItElectionDay(election: IElection) {
    const now = new Date()
    return now >= new Date(election.election_day) && now <= new Date(new Date(election.election_day).getTime() + 60 * 60 * 24 * 1000)
}

export const isElectionLive = (election: IElection) => DateTime.local().plus({ hours: 20 }) <= DateTime.fromISO(election.election_day)
