import * as dotProp from "dot-prop-immutable"
import { IEALGISApiClient } from "../../shared/api/EALGISApiClient"
import { fetchElections, fetchElectionStats } from "./elections"
import { fetchPollingPlaceTypes } from "./polling_places"
import { fetchPendingStalls } from "./stalls"
import { fetchUser } from "./user"
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
const LOADING = "ealgis/app/LOADING"
const LOADED = "ealgis/app/LOADED"
const BEGIN_FETCH = "ealgis/app/BEGIN_FETCH"
const FINISH_FETCH = "ealgis/app/FINISH_FETCH"
const SET_LAST_PAGE = "ealgis/app/SET_LAST_PAGE"
const TOGGLE_MODAL = "ealgis/app/TOGGLE_MODAL"

export enum eAppEnv {
    DEV = 1,
    TEST = 2,
    PROD = 3,
}

const initialState: IModule = {
    loading: true,
    requestsInProgress: 0,
    previousPath: "",
    modals: new Map(),
}

// Reducer
export default function reducer(state: IModule = initialState, action: IAction) {
    let requestsInProgress = dotProp.get(state, "requestsInProgress")

    switch (action.type) {
        case LOADING:
            return dotProp.set(state, "loading", true)
        case LOADED:
            return dotProp.set(state, "loading", false)
        case BEGIN_FETCH:
            return dotProp.set(state, "requestsInProgress", ++requestsInProgress)
        case FINISH_FETCH:
            return dotProp.set(state, "requestsInProgress", --requestsInProgress)
        case SET_LAST_PAGE:
            return dotProp.set(state, "previousPath", action.previousPath)
        case TOGGLE_MODAL:
            const modals = dotProp.get(state, "modals")
            modals.set(action.modalId, !modals.get(action.modalId))
            return dotProp.set(state, "modals", modals)
        default:
            return state
    }
}

// Action Creators
export function loading(): IAction {
    return {
        type: LOADING,
    }
}

export function loaded(): IAction {
    return {
        type: LOADED,
    }
}

export function beginFetch(): IAction {
    return {
        type: BEGIN_FETCH,
    }
}

export function finishFetch(): IAction {
    return {
        type: FINISH_FETCH,
    }
}

export function setLastPage(previousPath: string): IAction {
    return {
        type: SET_LAST_PAGE,
        previousPath,
    }
}

export function toggleModalState(modalId: string): IAction {
    return {
        type: TOGGLE_MODAL,
        modalId,
    }
}

// Models
export interface IModule {
    loading: boolean
    requestsInProgress: number
    previousPath: string
    modals: Map<string, boolean>
}

export interface IAction {
    type: string
    previousPath?: string
    modalId?: string
    open?: boolean
    meta?: {
        // analytics: IAnalyticsMeta
    }
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function getEnvironment(): eAppEnv {
    return process.env.NODE_ENV === "development" ? eAppEnv.DEV : eAppEnv.PROD
}

export function getAPIBaseURL(): string {
    return process.env.REACT_APP_API_BASE_URL!
}

export function getBaseURL(): string {
    return process.env.REACT_APP_SITE_BASE_URL!
}

export function fetchInitialAppState() {
    return async (dispatch: Function, getState: Function, ealapi: IEALGISApiClient) => {
        dispatch(loading())

        await Promise.all([
            dispatch(fetchUser()),
            dispatch(fetchElections()),
            dispatch(fetchPendingStalls()),
            dispatch(fetchPollingPlaceTypes()),
        ])
        await dispatch(fetchElectionStats())

        // const self: ISelf = await dispatch(fetchUser())
        // if (self && self.success) {
        //     await Promise.all([
        //         dispatch(fetchElections()),
        //         //     dispatch(fetchGeomInfo()),
        //         //     dispatch(fetchColourInfo()),
        //         //     dispatch(fetchSchemaInfo()),
        //         //     dispatch(fetchTablesIfUncached([...self.user.favourite_tables, ...self.user.recent_tables])),
        //     ])
        //     // await dispatch(fetchColumnsForMaps())
        // }

        dispatch(loaded())
    }
}
