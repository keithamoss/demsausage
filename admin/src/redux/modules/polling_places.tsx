import * as dotProp from "dot-prop-immutable"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { EALGISApiClient } from "../../shared/api/EALGISApiClient"
import { IElection } from "./elections"
import { IGeoJSONPoint } from "./interfaces"
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

export interface IMapPollingPlace {
    id: number
    geometry: any
    has_bbq: boolean
    has_nothing: boolean
    has_caek: boolean
    has_run_out: boolean
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
    free_text: string
}

export interface IPollingPlace {
    id: number
    name: string
    geom: IGeoJSONPoint
    facility_type: string | null
    booth_info: string
    wheelchair_access: string
    entrance_desc: string
    opening_hours: string
    premises: string
    address: string
    divisions: string[]
    state: string
    noms: INoms
    chance_of_sausage: number | null
    stall_name: string | null
    stall_description: string | null
    stall_website: string | null
    stall_extra_info: string | null
    first_report: string | null // Datetime
    latest_report: string | null // Datetime
    source: string
}

export interface IPollingPlaceLoaderResponse {
    error: boolean
    messages: Array<IPollingPlaceLoaderResponseMessage>
    table_name: string
    dryrun: boolean
}

export enum PollingPlaceLoaderResponseMessageStatus {
    ERROR = "ERROR",
    CHECK = "CHECK",
    INFO = "INFO",
    WARNING = "WARNING",
}

export interface IPollingPlaceLoaderResponseMessage {
    level: PollingPlaceLoaderResponseMessageStatus
    message: string
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function searchPollingPlaces(election: IElection, searchTerm: string) {
    return async (dispatch: Function, getState: Function, api: EALGISApiClient) => {
        const params = { "search-polling-places": 1, searchTerm: searchTerm, electionId: election.id }
        const { response, json } = await api.dsAPIGet(params, dispatch)

        if (response.status === 200) {
            return json
        }
    }
}

export function fetchAllPollingPlaces(election: IElection) {
    return async (dispatch: Function, getState: Function, api: EALGISApiClient) => {
        const { response, json } = await api.get("https://localhost:8001/api/0.1/polling_places/", dispatch, { election_id: election.id })

        if (response.status === 200) {
            dispatch(loadPollingPlacesForElection(election, json))
        }
    }
}

export function fetchPollingPlacesByIds(election: IElection, pollingPlaceIds: Array<number>) {
    return async (dispatch: Function, getState: Function, api: EALGISApiClient) => {
        const params = { "fetch-polling-places": 1, pollingPlaceIds: pollingPlaceIds, electionId: election.id }
        const { response, json } = await api.dsAPIGet(params, dispatch)

        if (response.status === 200) {
            return json
        }
    }
}

export function updatePollingPlace(election: IElection, pollingPlace: IPollingPlace, pollingPlaceNew: Partial<IPollingPlace>) {
    return async (dispatch: Function, getState: Function, api: EALGISApiClient) => {
        const params = {
            "update-polling-place": 1,
            pollingPlaceId: pollingPlace.id,
            pollingPlace: pollingPlaceNew,
            electionId: election.id,
        }

        const { response, json } = await api.dsAPIGet(params, dispatch)

        if (response.status === 200) {
            dispatch(sendSnackbarNotification("Polling place updated! 🌭🎉"))
            return json
        }
    }
}

export function loadPollingPlaces(election: IElection, file: File) {
    return async (dispatch: Function, getState: Function, api: EALGISApiClient) => {
        const params = {
            "load-polling-places": 1,
            electionId: election.id,
            dryrun: false,
        }

        const { response, json } = await api.dsAPIPostFile(params, file, dispatch)

        if (response.status === 200) {
            return json
        }
    }
}

export function fetchPollingPlaceTypes() {
    return async (dispatch: Function, getState: Function, api: EALGISApiClient) => {
        const { response, json } = await api.get("https://localhost:8001/api/0.1/polling_places_facility_types/", dispatch)

        if (response.status === 200) {
            dispatch(loadPollingPlaceTypes(json))
        }
    }
}

export function regenerateElectionGeoJSON(election: IElection) {
    return async (dispatch: Function, getState: Function, api: EALGISApiClient) => {
        const params = { "regenerate-geojson": 1, electionId: election.id }
        const { response } = await api.dsAPIGet(params, dispatch)

        if (response.status === 200) {
            dispatch(sendSnackbarNotification("Polling place data regenerated! 🌭🎉"))
        }
    }
}

// Utilities
export function pollingPlaceHasReports(pollingPlace: IPollingPlace) {
    for (const [key, value] of Object.entries(pollingPlace.noms)) {
        if (key === "run_out") {
            continue
        }

        if (key !== "free_text") {
            if (value === true) {
                return true
            }
        } else {
            if (value !== "") {
                return true
            }
        }
    }
    return false
}

export function pollingPlaceHasReportsOfNoms(pollingPlace: IPollingPlace) {
    for (const [key, value] of Object.entries(pollingPlace.noms)) {
        if (key === "run_out" || key === "nothing") {
            continue
        }

        if (key !== "free_text") {
            if (value === true) {
                return true
            }
        } else {
            if (value !== "") {
                return true
            }
        }
    }
    return false
}

export function getSausageChanceDescription(pollingPlace: IPollingPlace) {
    if (pollingPlace.chance_of_sausage === null) {
        return "UNKNOWN"
    } else if (pollingPlace.chance_of_sausage >= 0.7) {
        return "HIGH"
    } else if (pollingPlace.chance_of_sausage >= 4) {
        return "MEDIUM"
    } else {
        return "LOW"
    }
}

export function getFoodDescription(pollingPlace: IPollingPlace) {
    const noms: Array<string> = []
    if (pollingPlace.noms.bbq) {
        noms.push("sausage sizzle")
    }
    if (pollingPlace.noms.cake) {
        noms.push("cake stall")
    }
    if ("bacon_and_eggs" in pollingPlace.noms && pollingPlace.noms.bacon_and_eggs) {
        noms.push("bacon and egg burgers")
    }
    if ("vego" in pollingPlace.noms && pollingPlace.noms.vego) {
        noms.push("vegetarian options")
    }
    if ("halal" in pollingPlace.noms && pollingPlace.noms.halal) {
        noms.push("halal options")
    }
    if ("coffee" in pollingPlace.noms && pollingPlace.noms.coffee) {
        noms.push("coffee")
    }
    return noms.join(", ")
}

export const getPollingPlaceLongName = (pollingPlace: IPollingPlace) => {
    if (pollingPlace.name === pollingPlace.premises) {
        return pollingPlace.name
    }
    return `${pollingPlace.name}, ${pollingPlace.premises}`
}
