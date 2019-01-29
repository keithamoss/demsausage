import * as dotProp from "dot-prop-immutable"
import { memoize } from "lodash-es"
import { createSelector } from "reselect"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { EALGISApiClient } from "../../shared/api/EALGISApiClient"
import { IGeoJSONPoint } from "./interfaces"
import { INoms } from "./polling_places"
import { IStore } from "./reducer"
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
const LOAD_PENDING = "ealgis/stalls/LOAD_PENDING"
const REMOVE = "ealgis/stalls/REMOVE"

const initialState: Partial<IModule> = {
    pending: [] as Array<IStall>,
}

// Reducer
export default function reducer(state: Partial<IModule> = initialState, action: IAction) {
    switch (action.type) {
        case LOAD_PENDING:
            return dotProp.set(state, "pending", action.stalls)
        case REMOVE:
            const pending = state.pending!.filter((stall: IStall) => stall.id !== action.stallId)
            return dotProp.set(state, "pending", pending)
        default:
            return state
    }
}

// Selectors
const getPendingStalls = (state: IStore) => state.stalls.pending

export const getPendingStallsForCurrentElection = createSelector(
    [getPendingStalls],
    stalls =>
        memoize((electionId: number) => {
            return stalls.filter((stall: IStall) => stall.election_id === electionId)
        })
)

// Action Creators
export function loadPendingStalls(stalls: Array<IStall>) {
    return {
        type: LOAD_PENDING,
        stalls,
    }
}
export function removePendingStall(stallId: number) {
    return {
        type: REMOVE,
        stallId,
    }
}

// Models
export interface IModule {
    pending: Array<IStall>
}

export interface IAction {
    type: string
    stalls: Array<IStall>
    stallId: number
    errors?: object
    meta?: {
        // analytics: IAnalyticsMeta
    }
}

export interface IStallLocationInfo {
    id?: number // An id is present if election.polling_places_loaded is True
    geom: IGeoJSONPoint
    name: string
    address: string
    state: string
}

export interface IStallPollingPlaceInfo {
    id: number
    name: string
    premises: string
    address: string
    state: string
}

export enum StallStatus {
    PENDING = 0,
    APPROVED = 1,
    DECLINED = 2,
}

export interface IStall {
    id: number
    name: string
    description: string
    website: string
    noms: INoms
    email: string
    election_id: number
    location_info: IStallLocationInfo | null
    polling_place: IStallPollingPlaceInfo | null
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchPendingStalls() {
    return async (dispatch: Function, getState: Function, api: EALGISApiClient) => {
        const { response, json } = await api.get("https://localhost:8001/api/0.1/stalls/pending/", dispatch)

        if (response.status === 200) {
            dispatch(loadPendingStalls(json))
            return json.rows
        }
    }
}

export function markStallAsRead(id: number) {
    return async (dispatch: Function, getState: Function, api: EALGISApiClient) => {
        const params = {
            "mark-read-pending-stall": 1,
            id: id,
        }
        const { response, json } = await api.dsAPIGet(params, dispatch)

        if (response.status === 200) {
            dispatch(sendSnackbarNotification("Pending stall updated! 🍽🎉"))
            // dispatch(removePendingStall(id))
            dispatch(fetchPendingStalls()) // @FIXME Deal with dupes in the queue of unofficial polling places. Backend fakes the polling_place_id.
            return json
        }
    }
}

export function markStallAsReadAndAddPollingPlace(id: number) {
    return async (dispatch: Function, getState: Function, api: EALGISApiClient) => {
        const params = {
            "mark-read-pending-stall-and-add-polling-place": 1,
            id: id,
        }
        const { response, json } = await api.dsAPIGet(params, dispatch)

        if (response.status === 200) {
            dispatch(sendSnackbarNotification("Pending stall updated and new polling place added! 🍽🎉"))
            // dispatch(removePendingStall(id))
            dispatch(fetchPendingStalls()) // @FIXME Deal with dupes in the queue of unofficial polling places. Backend fakes the polling_place_id.
            return json
        }
    }
}

export function markStallAsDeclined(id: number) {
    return async (dispatch: Function, getState: Function, api: EALGISApiClient) => {
        const params = {
            "mark-declined-pending-stall": 1,
            id: id,
        }
        const { response, json } = await api.dsAPIGet(params, dispatch)

        if (response.status === 200) {
            dispatch(sendSnackbarNotification("Pending stall declined! 🍽🎉"))
            // dispatch(removePendingStall(id))
            dispatch(fetchPendingStalls()) // @FIXME Deal with dupes in the queue of unofficial polling places. Backend fakes the polling_place_id.
            return json
        }
    }
}

// Utilities
export const getStallLocationName = (stall: IStall) => {
    if (stall.polling_place !== null) {
        return stall.polling_place.premises
    }

    if (stall.location_info !== null) {
        return stall.location_info.name
    }

    return "Error: Couldn't get stall location name"
}
export const getStallLocationAddress = (stall: IStall) => {
    if (stall.polling_place !== null) {
        return stall.polling_place.address
    }

    if (stall.location_info !== null) {
        return stall.location_info.address
    }

    return "Error: Couldn't get stall location address"
}
