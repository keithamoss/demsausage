import * as dotProp from 'dot-prop-immutable'
import { IAPIClient } from '../../shared/api/APIClient'
import { fetchElections } from './elections'
import { fetchPollingPlaceTypes } from './polling_places'
import { fetchPendingStalls } from './stalls'
import { fetchUser, ISelf } from './user'
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
const LOADING = 'ealgis/app/LOADING'
const LOADED = 'ealgis/app/LOADED'
const BEGIN_FETCH = 'ealgis/app/BEGIN_FETCH'
const FINISH_FETCH = 'ealgis/app/FINISH_FETCH'
const SET_LAST_PAGE = 'ealgis/app/SET_LAST_PAGE'
const TOGGLE_MODAL = 'ealgis/app/TOGGLE_MODAL'

const initialState: IModule = {
  loading: true,
  requestsInProgress: 0,
  previousPath: '',
  modals: new Map(),
}

// Reducer
export default function reducer(state: IModule = initialState, action: IAction) {
  let requestsInProgress = dotProp.get(state, 'requestsInProgress')

  switch (action.type) {
    case LOADING:
      return dotProp.set(state, 'loading', true)
    case LOADED:
      return dotProp.set(state, 'loading', false)
    case BEGIN_FETCH:
      // eslint-disable-next-line no-return-assign
      return dotProp.set(state, 'requestsInProgress', (requestsInProgress += 1))
    case FINISH_FETCH:
      // eslint-disable-next-line no-return-assign
      return dotProp.set(state, 'requestsInProgress', (requestsInProgress -= 1))
    case SET_LAST_PAGE:
      return dotProp.set(state, 'previousPath', action.previousPath)
    case TOGGLE_MODAL:
      // eslint-disable-next-line no-case-declarations
      const modals = dotProp.get(state, 'modals')
      modals.set(action.modalId, !modals.get(action.modalId))
      return dotProp.set(state, 'modals', modals)
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
export enum eAppEnv {
	DEVELOPMENT = 1,
	STAGING = 2,
	PRODUCTION = 3,
}

export function getEnvironment(): eAppEnv {
	switch (import.meta.env.VITE_ENVIRONMENT) {
		case 'DEVELOPMENT':
			return eAppEnv.DEVELOPMENT;
		case 'STAGING':
			return eAppEnv.STAGING;
		case 'PRODUCTION':
			return eAppEnv.PRODUCTION;
	}
}

export function isDevelopment(): boolean {
	return getEnvironment() === eAppEnv.DEVELOPMENT;
}

export function getAPIBaseURL(): string {
  return import.meta.env.VITE_API_BASE_URL
}

export function getBaseURL(): string {
  return import.meta.env.VITE_SITE_BASE_URL
}

export function getPublicSiteBaseURL(): string {
  return import.meta.env.VITE_PUBLIC_SITE_BASE_URL
}

export function fetchInitialAppState() {
  return async (dispatch: Function, _getState: Function, _api: IAPIClient) => {
    dispatch(loading())

    const self: ISelf = await dispatch(fetchUser())
    if (self && self.is_logged_in) {
      await Promise.all([
        dispatch(fetchElections()),
        dispatch(fetchPendingStalls()),
        dispatch(fetchPollingPlaceTypes()),
      ])
    }

    dispatch(loaded())
  }
}
