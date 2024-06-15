import * as dotProp from 'dot-prop-immutable';
import { IAnalyticsMeta } from '../../shared/analytics/GoogleAnalytics';
import { IAPIClient } from '../../shared/api/APIClient';
import { fetchElections } from './elections';

// Actions
const LOADING = 'ealgis/app/LOADING';
const LOADED = 'ealgis/app/LOADED';
const BEGIN_FETCH = 'ealgis/app/BEGIN_FETCH';
const FINISH_FETCH = 'ealgis/app/FINISH_FETCH';
const SET_LAST_PAGE = 'ealgis/app/SET_LAST_PAGE';
const TOGGLE_SIDEBAR = 'ealgis/app/TOGGLE_SIDEBAR';
const TOGGLE_MODAL = 'ealgis/app/TOGGLE_MODAL';
const SET_POLLING_PLACE_FINDER_MODE = 'ealgis/app/SET_POLLING_PLACE_FINDER_MODE';
const SET_EMBED_MAP_FLAG = 'ealgis/app/SET_EMBED_MAP_FLAG';

export enum ePollingPlaceFinderInit {
	DO_NOTHING = 1,
	FOCUS_INPUT = 2,
	GEOLOCATION = 3,
}

const initialState: IModule = {
	loading: true,
	requestsInProgress: 0,
	sidebarOpen: false,
	previousPath: '',
	modals: new Map(),
	geolocationSupported: typeof navigator !== 'undefined' && 'geolocation' in navigator,
	pollingPlaceFinderMode: ePollingPlaceFinderInit.DO_NOTHING,
	embedded_map: false,
};

// Reducer
export default function reducer(state: IModule = initialState, action: IAction) {
	let requestsInProgress = dotProp.get(state, 'requestsInProgress');

	switch (action.type) {
		case LOADING:
			return dotProp.set(state, 'loading', true);
		case LOADED:
			return dotProp.set(state, 'loading', false);
		case BEGIN_FETCH:
			// eslint-disable-next-line no-return-assign
			return dotProp.set(state, 'requestsInProgress', (requestsInProgress += 1));
		case FINISH_FETCH:
			// eslint-disable-next-line no-return-assign
			return dotProp.set(state, 'requestsInProgress', (requestsInProgress -= 1));
		case SET_LAST_PAGE:
			return dotProp.set(state, 'previousPath', action.previousPath);
		case TOGGLE_SIDEBAR:
			return dotProp.toggle(state, 'sidebarOpen');
		case TOGGLE_MODAL:
			// eslint-disable-next-line no-case-declarations
			const modals = dotProp.get(state, 'modals');
			modals.set(action.modalId, !modals.get(action.modalId));
			return dotProp.set(state, 'modals', modals);
		case SET_POLLING_PLACE_FINDER_MODE:
			return dotProp.set(state, 'pollingPlaceFinderMode', action.pollingPlaceFinderMode);
		case SET_EMBED_MAP_FLAG:
			return dotProp.set(state, 'embedded_map', action.embedded_map);
		default:
			return state;
	}
}

// Action Creators
export function loading(): IAction {
	return {
		type: LOADING,
	};
}

export function loaded(): IAction {
	return {
		type: LOADED,
	};
}

export function beginFetch(): IAction {
	return {
		type: BEGIN_FETCH,
	};
}

export function finishFetch(): IAction {
	return {
		type: FINISH_FETCH,
	};
}

export function setLastPage(previousPath: string): IAction {
	return {
		type: SET_LAST_PAGE,
		previousPath,
	};
}

export function toggleSidebarState(): IAction {
	return {
		type: TOGGLE_SIDEBAR,
		meta: {
			analytics: {
				category: 'App',
			},
		},
	};
}

export function toggleModalState(modalId: string): IAction {
	return {
		type: TOGGLE_MODAL,
		modalId,
	};
}

export function setPollingPlaceFinderMode(mode: ePollingPlaceFinderInit): IAction {
	return {
		type: SET_POLLING_PLACE_FINDER_MODE,
		pollingPlaceFinderMode: mode,
	};
}

export function setEmbedMapFlag(embedded_map: boolean) {
	return {
		type: SET_EMBED_MAP_FLAG,
		embedded_map,
	};
}

// Models
export interface IModule {
	loading: boolean;
	requestsInProgress: number;
	sidebarOpen: boolean;
	previousPath: string;
	modals: Map<string, boolean>;
	geolocationSupported: boolean;
	pollingPlaceFinderMode: ePollingPlaceFinderInit;
	embedded_map: boolean;
}

export interface IAction {
	type: string;
	previousPath?: string;
	modalId?: string;
	open?: boolean;
	pollingPlaceFinderMode?: ePollingPlaceFinderInit;
	meta?: {
		analytics: IAnalyticsMeta;
	};
	embedded_map?: boolean;
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
	return import.meta.env.VITE_API_BASE_URL;
}

export function getBaseURL(): string {
	return import.meta.env.VITE_SITE_BASE_URL;
}

export function getMapboxAPIKey(): any {
	return getEnvironment() === eAppEnv.DEVELOPMENT
		? import.meta.env.VITE_MAPBOX_API_KEY_DEV
		: import.meta.env.VITE_MAPBOX_API_KEY_PROD;
}

export function fetchInitialAppState(_initialElectionName: string) {
	return async (dispatch: Function, _getState: Function, _api: IAPIClient) => {
		dispatch(loading());
		await Promise.all([dispatch(fetchElections())]);
		dispatch(loaded());
	};
}
