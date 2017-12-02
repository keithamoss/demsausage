import * as dotProp from "dot-prop-immutable"
// import { sendNotification as sendSnackbarNotification } from "../../redux/modules/snackbars"
import { IEALGISApiClient } from "../../redux/modules/interfaces"
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
const LOAD_PENDING = "ealgis/polling_places/LOAD_PENDING"

const initialState: Partial<IModule> = {
    pending: [] as Array<IStall>,
}

// Reducer
export default function reducer(state: Partial<IModule> = initialState, action: IAction) {
    switch (action.type) {
        case LOAD_PENDING:
            return dotProp.set(state, "pending", action.stalls)
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

// Models
export interface IModule {
    pending: Array<IStall>
}

export interface IAction {
    type: string
    stalls: Array<IStall>
    errors?: object
    meta?: {
        // analytics: IAnalyticsMeta
    }
}

export interface IStall {
    id: number
    stall_description: string
    stall_name: string
    stall_website: string
    contact_email: string
    has_bbq: boolean
    has_caek: boolean
    has_vego: boolean
    has_halal: boolean
    polling_place_id: number
    polling_place_premises: string
    elections_id: number
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
