import * as dotProp from "dot-prop-immutable"
import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"
import { IAPIClient } from "../../shared/api/APIClient"
import { fetchElections } from "./elections"

// Actions
const LOADING = "ealgis/app/LOADING"
const LOADED = "ealgis/app/LOADED"
const BEGIN_FETCH = "ealgis/app/BEGIN_FETCH"
const FINISH_FETCH = "ealgis/app/FINISH_FETCH"
const SET_LAST_PAGE = "ealgis/app/SET_LAST_PAGE"
const TOGGLE_SIDEBAR = "ealgis/app/TOGGLE_SIDEBAR"
const TOGGLE_MODAL = "ealgis/app/TOGGLE_MODAL"
const SET_POLLING_PLACE_FINDER_MODE = "ealgis/app/SET_POLLING_PLACE_FINDER_MODE"

export enum eAppEnv {
    DEV = 1,
    TEST = 2,
    PROD = 3,
}

export enum ePollingPlaceFinderInit {
    DO_NOTHING = 1,
    FOCUS_INPUT = 2,
    GEOLOCATION = 3,
}

const initialState: IModule = {
    loading: true,
    requestsInProgress: 0,
    sidebarOpen: false,
    previousPath: "",
    modals: new Map(),
    geolocationSupported: typeof navigator !== "undefined" && "geolocation" in navigator,
    pollingPlaceFinderMode: ePollingPlaceFinderInit.DO_NOTHING,
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
        case TOGGLE_SIDEBAR:
            return dotProp.toggle(state, "sidebarOpen")
        case TOGGLE_MODAL:
            const modals = dotProp.get(state, "modals")
            modals.set(action.modalId, !modals.get(action.modalId))
            return dotProp.set(state, "modals", modals)
        case SET_POLLING_PLACE_FINDER_MODE:
            return dotProp.set(state, "pollingPlaceFinderMode", action.pollingPlaceFinderMode)
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

export function toggleSidebarState(): IAction {
    return {
        type: TOGGLE_SIDEBAR,
        meta: {
            analytics: {
                category: "App",
            },
        },
    }
}

export function toggleModalState(modalId: string): IAction {
    return {
        type: TOGGLE_MODAL,
        modalId,
    }
}

export function setPollingPlaceFinderMode(mode: ePollingPlaceFinderInit): IAction {
    return {
        type: SET_POLLING_PLACE_FINDER_MODE,
        pollingPlaceFinderMode: mode,
    }
}

// Models
export interface IModule {
    loading: boolean
    requestsInProgress: number
    sidebarOpen: boolean
    previousPath: string
    modals: Map<string, boolean>
    geolocationSupported: boolean
    pollingPlaceFinderMode: ePollingPlaceFinderInit
}

export interface IAction {
    type: string
    previousPath?: string
    modalId?: string
    open?: boolean
    pollingPlaceFinderMode?: ePollingPlaceFinderInit
    meta?: {
        analytics: IAnalyticsMeta
    }
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function getEnvironment(): eAppEnv {
    return process.env.NODE_ENV === "development" ? eAppEnv.DEV : eAppEnv.PROD
}

export function isDevelopment(): boolean {
    return getEnvironment() !== eAppEnv.PROD
}

export function getAPIBaseURL(): string {
    return process.env.REACT_APP_API_BASE_URL!
}

export function getBaseURL(): string {
    return process.env.REACT_APP_SITE_BASE_URL!
}

export function getMapboxAPIKey(): any {
    return getEnvironment() === eAppEnv.DEV ? process.env.REACT_APP_MAPBOX_API_KEY_DEV : process.env.REACT_APP_MAPBOX_API_KEY_PROD
}

export function fetchInitialAppState(initialElectionName: string) {
    return async (dispatch: Function, getState: Function, api: IAPIClient) => {
        dispatch(loading())
        await Promise.all([dispatch(fetchElections())])
        dispatch(loaded())
    }
}
