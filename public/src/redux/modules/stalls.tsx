import { IStallFormInfo } from "../../add-stall/AddStallForm/AddStallFormContainer"
import { IAPIClient } from "../../shared/api/APIClient"
import { IGeoJSONPoint } from "./interfaces"
import { INoms } from "./polling_places"
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions

const initialState: Partial<IModule> = {}

// Reducer
export default function reducer(state: Partial<IModule> = initialState, action: IAction) {
    switch (action.type) {
        default:
            return state
    }
}

// Action Creators

// Models
export interface IModule {}

export interface IAction {
    type: string
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
    PENDING = "Pending",
    APPROVED = "Approved",
    DECLINED = "Declined",
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
export function createStall(stall: IStallFormInfo) {
    return async (dispatch: Function, getState: Function, api: IAPIClient) => {
        return await api.post("/0.1/stalls/", stall, dispatch)
    }
}
export function updateStallWithCredentials(stallId: number, stall: Partial<IStallFormInfo>, token: string, signature: string) {
    return async (dispatch: Function, getState: Function, api: IAPIClient) => {
        return await api.patch(`/0.1/stalls/${stallId}/update_and_resubmit/`, { ...stall, ...{ token, signature } }, dispatch)
    }
}

export function fetchStallWithCredentials(stallId: string, token: string, signature: string) {
    return async (dispatch: Function, getState: Function, api: IAPIClient) => {
        return await api.get(`/0.1/stalls/${stallId}/`, dispatch, { token, signature })
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
