import * as dotProp from "dot-prop-immutable"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { IEALGISApiClient, IElection, IGoogleGeocodeResult } from "../../redux/modules/interfaces"
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
const LOAD = "ealgis/polling_places/LOAD"
const LOAD_TYPES = "ealgis/polling_places/LOAD_TYPES"
const VALIDATION_ERRORS = "ealgis/polling_places/VALIDATION_ERRORS"

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
            return dotProp.set(state, "types", action.pollingPlaceTypes)
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

export interface IMapPollingPlace {
    id: number
    geometry: any
    has_bbq: boolean
    has_nothing: boolean
    has_caek: boolean
    has_run_out: boolean
}

export interface IPollingPlace {
    id: number
    lon: number
    lat: number
    has_bbq: boolean
    has_nothing: boolean
    has_caek: boolean
    has_run_out: boolean
    has_other: {
        has_coffee?: boolean
        has_vego?: boolean
        has_halal?: boolean
        has_baconandeggs?: boolean
        has_freetext?: string
    }
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

export interface IPollingPlaceSearchResult extends IPollingPlace {
    distance_metres: number
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
        const params = { "search-polling-places": 1, searchTerm: searchTerm, electionId: election.id }
        const { response, json } = await ealapi.dsAPIGet(params, dispatch)

        if (response.status === 200) {
            return json
        }
    }
}

export function fetchAllPollingPlaces(election: IElection) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const params = { "fetch-all-polling-places": 1, electionId: election.id }
        const { response, json } = await ealapi.dsAPIGet(params, dispatch)

        if (response.status === 200) {
            dispatch(loadPollingPlacesForElection(election, json))
        }
    }
}

export function fetchPollingPlacesByIds(election: IElection, pollingPlaceIds: Array<number>) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const params = { "fetch-polling-places": 1, pollingPlaceIds: pollingPlaceIds, electionId: election.id }
        const { response, json } = await ealapi.dsAPIGet(params, dispatch)

        if (response.status === 200) {
            return json
        }
    }
}

export function updatePollingPlace(election: IElection, pollingPlace: IPollingPlace, pollingPlaceNew: Partial<IPollingPlace>) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const params = {
            "update-polling-place": 1,
            pollingPlaceId: pollingPlace.id,
            pollingPlace: pollingPlaceNew,
            electionId: election.id,
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

export function fetchPollingPlaceTypes() {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const params = { "fetch-polling-place-types": 1, electionId: null }
        const { response, json } = await ealapi.dsAPIGet(params, dispatch)

        if (response.status === 200) {
            dispatch(loadPollingPlaceTypes(json))
        }
    }
}

export function fetchNearbyPollingPlaces(election: IElection, geocoderResult: IGoogleGeocodeResult) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const params = {
            "fetch-nearby-polling-places": 1,
            electionId: election.id,
            lat: geocoderResult.geometry.location.lat(),
            lon: geocoderResult.geometry.location.lng(),
        }

        const { response, json } = await ealapi.dsAPIGet(params, dispatch)

        if (response.status === 200) {
            return json
        }
    }
}

export function pollingPlaceHasReports(pollingPlace: IPollingPlace) {
    return (
        pollingPlace.has_bbq === true ||
        pollingPlace.has_caek === true ||
        pollingPlace.has_nothing === true ||
        (pollingPlace.has_other !== null && Object.keys(pollingPlace.has_other).length > 0)
    )
}

export function pollingPlaceHasReportsOfNoms(pollingPlace: IPollingPlace) {
    return pollingPlace.has_bbq === true || pollingPlace.has_caek === true || (pollingPlace.has_other !== null && Object.keys(pollingPlace.has_other).length > 0)
}

export function getSausageChanceDescription(pollingPlace: IPollingPlace) {
    if (pollingPlace.chance_of_sausage >= 0.7) {
        return "HIGH"
    } else if (pollingPlace.chance_of_sausage >= 4) {
        return "MEDIUM"
    } else {
        return "LOW"
    }
}

export function getFoodDescription(pollingPlace: IPollingPlace) {
    const noms: Array<string> = []
    if (pollingPlace.has_bbq) {
        noms.push("sausage sizzle")
    }
    if (pollingPlace.has_caek) {
        noms.push("cake stall")
    }
    if ("has_baconandeggs" in pollingPlace.has_other && pollingPlace.has_other.has_baconandeggs) {
        noms.push("bacon and egg burgers")
    }
    if ("has_vego" in pollingPlace.has_other && pollingPlace.has_other.has_vego) {
        noms.push("vegetarian options")
    }
    if ("has_halal" in pollingPlace.has_other && pollingPlace.has_other.has_halal) {
        noms.push("halal options")
    }
    if ("has_coffee" in pollingPlace.has_other && pollingPlace.has_other.has_coffee) {
        noms.push("coffee")
    }
    return noms.join(", ")
}
