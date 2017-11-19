// import * as dotProp from "dot-prop-immutable"
import { IEALGISApiClient, IElection } from "../../redux/modules/interfaces"
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
// const LOAD_SEARCH_RESULTS = "ealgis/polling_places/LOAD_SEARCH_RESULTS"

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
    meta?: {
        // analytics: IAnalyticsMeta
    }
}

export interface IPollingPlace {
    cartodb_id: number
    the_geom: string // WKB
    the_geom_webmercator: string // WKB
    division: string
    extra_info: string
    polling_place_name: string
    address: string
    state: string
    booth_info: string
    premises: string
    opening_hours: string
    polling_place_type: string
    has_bbq: boolean
    has_nothing: boolean
    has_caek: boolean
    has_run_out: boolean
    has_other: string // JSON
    source: string
    stall_name: string
    stall_description: string
    stall_website: string
    first_report: string // Datetime
    latest_report: string // Datetime
    ess_stall_id: string
    ess_stall_url: string
    lng: number
    lat: number
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera

export function fetchPollingPlaces(election: IElection, searchTerm: string) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const sql = `SELECT 
          *, ST_X(the_geom) as lng, ST_Y(the_geom) as lat 
          FROM ${election.db_table_name} 
          WHERE premises ILIKE '%${searchTerm}%' OR polling_place_name ILIKE '%${searchTerm}%' OR address ILIKE '%${searchTerm}%'`

        const { response, json } = await ealapi.cartoGet(sql, dispatch)
        if (response.status === 200) {
            return json.rows
        }
    }
}
