import { IStallFormInfo } from "../../add-stall/AddStallForm/AddStallFormContainer"
import { IEALGISApiClient } from "../../shared/api/EALGISApiClient"
import { IGeoJSONPoint } from "./interfaces"
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

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function createStall(stall: IStallFormInfo) {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        const { response, json } = await ealapi.post("https://localhost:8001/api/0.1/stalls/", stall, dispatch)

        if (response.status === 201) {
            return json
        }
    }
}
