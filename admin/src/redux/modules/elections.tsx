import * as dotProp from "dot-prop-immutable"
import { IEALGISApiClient } from "../../redux/modules/interfaces"
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
const LOAD_ELECTIONS = "ealgis/elections/LOAD_ELECTIONS"
const SET_CURRENT_ELECTION = "ealgis/elections/SET_CURRENT_ELECTION"

const initialState: Partial<IModule> = {
    elections: {} as IElections,
}

// Reducer
export default function reducer(state: Partial<IModule> = initialState, action: IAction) {
    switch (action.type) {
        case LOAD_ELECTIONS:
            return dotProp.set(state, "elections", action.elections)
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
    electionId: string
    meta?: {
        // analytics: IAnalyticsMeta
    }
}

export interface IElections {
    [key: number]: IElection
}

export interface IElection {
    cartodb_id: number
    the_geom: string // WKB
    the_geom_webmercator: string // WKB
    name: string
    default_zoom_level: number
    has_division_boundaries: boolean
    db_table_name: string
    cartodb_map_id: number | undefined
    is_active: boolean
    hidden: boolean
    lng: number
    lat: number
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchElections() {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const sql = "SELECT *, ST_X(the_geom) as lng, ST_Y(the_geom) as lat FROM elections WHERE hidden != true ORDER BY cartodb_id DESC"
        const { response, json } = await ealapi.cartoGetSQL(sql, dispatch)
        if (response.status === 200) {
            // Map elections from an array of objects to a dict keyed by db_table_name
            const elections = Object.assign(
                {},
                ...json.rows.map((election: IElection, index: number, array: Array<IElection>) => ({ [election.db_table_name]: election }))
            )
            dispatch(loadElections(elections))

            const activeElection = json.rows.find((election: IElection) => election.is_active)
            dispatch(setCurrentElection(activeElection.db_table_name))
        }
    }
}
