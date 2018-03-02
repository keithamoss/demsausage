import * as dotProp from "dot-prop-immutable"
import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { IEALGISApiClient, IElection } from "../../redux/modules/interfaces"
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
    lon: number
    lat: number
    polling_place_name: string
    address: string
    state: string
}

export interface IStallPollingPlacInfo {
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
    stall_description: string
    stall_name: string
    stall_website: string
    stall_location_info: IStallLocationInfo | null
    contact_email: string
    has_bbq: boolean
    has_caek: boolean
    has_vego: boolean
    has_halal: boolean
    has_coffee: boolean
    has_bacon_and_eggs: boolean
    polling_place_id: number
    elections_id: number
    active: boolean
    status: StallStatus
    reported_timestamp: string // Datetime
    polling_place_info: IStallPollingPlacInfo
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchPendingStalls() {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.dsAPIGet({ "fetch-pending-stalls": 1 }, dispatch)

        if (response.status === 200) {
            dispatch(loadPendingStalls(json))
            return json.rows
        }
    }
}

export function markStallAsRead(id: number) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const params = {
            "mark-read-pending-stall": 1,
            id: id,
        }
        const { response, json } = await ealapi.dsAPIGet(params, dispatch)

        if (response.status === 200) {
            dispatch(sendSnackbarNotification("Pending stall updated! 🍽🎉"))
            dispatch(removePendingStall(id))
            return json
        }
    }
}

export function createStall(election: IElection, stall: Partial<IStall>) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const params = {
            "add-stall": 1,
            stall: stall,
            electionId: election.id,
        }

        const { /*response,*/ json } = await ealapi.dsAPIGet(params, dispatch)
        return json
    }
}
