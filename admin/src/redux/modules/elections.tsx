import * as dotProp from 'dot-prop-immutable';
import { orderBy } from 'lodash-es';
import { DateTime } from 'luxon';
import { createSelector } from 'reselect';
import { IAPIClient } from '../../shared/api/APIClient';
import { IGeoJSON } from './interfaces';
import { IStore } from './reducer';
import { sendNotification as sendSnackbarNotification } from './snackbars';
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
const LOAD_ELECTIONS = 'ealgis/elections/LOAD_ELECTIONS';
const LOAD_ELECTION = 'ealgis/elections/LOAD_ELECTION';
const SET_CURRENT_ELECTION = 'ealgis/elections/SET_CURRENT_ELECTION';
const SET_PRIMARY_ELECTION = 'ealgis/elections/SET_PRIMARY_ELECTION';

const initialState: Partial<IModule> = {
	elections: [],
};

// Reducer
export default function reducer(state: Partial<IModule> = initialState, action: IAction) {
	switch (action.type) {
		case LOAD_ELECTIONS:
			return dotProp.set(state, 'elections', action.elections);
		case LOAD_ELECTION:
			// eslint-disable-next-line no-case-declarations
			const electionIndex: number = state.elections!.findIndex(
				(election: IElection) => election.id === action.election.id,
			)!;

			// Adding a new election at the top
			if (electionIndex === -1) {
				return dotProp.set(state, 'elections', [action.election, ...state.elections!]);
			}
			// Updating an existing election
			return dotProp.set(state, `elections.${electionIndex}`, {
				...dotProp.get(state, `elections.${electionIndex}`),
				...action.election,
			});

		case SET_CURRENT_ELECTION:
			return dotProp.set(state, 'current_election_id', action.electionId);
		case SET_PRIMARY_ELECTION:
			state.elections!.forEach((election: IElection, index: number) => {
				// eslint-disable-next-line no-param-reassign
				state = dotProp.set(state, `elections.${index}.is_primary`, election.id === action.electionId);
			});
			return state;
		default:
			return state;
	}
}

// Selectors
const getElections = (state: IStore) => state.elections.elections;

export const getElectionsSortedByElectionDay = createSelector([getElections], (elections: IElection[]) => {
	return orderBy(elections, ['election_day'], ['desc']);
});

export const getLiveElections = createSelector([getElections], (elections: IElection[]): any => {
	return elections.filter((election: IElection) => isElectionLive(election));
});

// Action Creators
export function loadElections(elections: Array<IElection>) {
	return {
		type: LOAD_ELECTIONS,
		elections,
	};
}

export function loadElection(election: Partial<IElection>) {
	return {
		type: LOAD_ELECTION,
		election,
	};
}

export function setCurrentElection(electionId: number) {
	return {
		type: SET_CURRENT_ELECTION,
		electionId,
	};
}

export function togglePrimaryElection(electionId: number) {
	return {
		type: SET_PRIMARY_ELECTION,
		electionId,
	};
}

// Models
export interface IModule {
	elections: Array<IElection>;
	current_election_id: number; // election.id
}

export interface IAction {
	type: string;
	elections: Array<IElection>;
	election: Partial<IElection>;
	electionId: number;
	meta?: {
		// analytics: IAnalyticsMeta
	};
}

export interface IElection {
	id: number;
	geom: IGeoJSON;
	name: string;
	short_name: string;
	is_hidden: boolean;
	is_primary: boolean;
	is_federal: boolean;
	election_day: string; // Datetime
	polling_places_loaded: boolean;
	stats: IElectionStats;

	// stats: {
	//     ttl_booths: number
	//     ttl_bbq: number
	//     ttl_caek: number
	//     ttl_shame: number
	//     ttl_halal?: number
	//     ttl_coffee?: number
	//     ttl_bacon_and_eggs?: number
	//     ttl_free_text?: number
	//     ttl_vego?: number
	// }
}

export interface IElectionStats {
	with_data: number;
	total: number;
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchElections() {
	return async (dispatch: Function, getState: Function, api: IAPIClient) => {
		const { response, json } = await api.get('/0.1/elections/', dispatch);

		if (response.status === 200) {
			dispatch(loadElections(json));

			// If our route doesn't dictate that we're looking at an election, then just
			// grab the first election that's active
			if (getState().elections.current_election_id === undefined) {
				let activeElection: IElection | undefined;

				// If there's a primary election, that's our first choice
				const primaryElection: IElection = json.find((election: IElection) => election.is_primary);
				if (primaryElection !== undefined) {
					activeElection = primaryElection;
				} else {
					// Failing that, just the first active election
					const firstActiveElection = json.find((election: IElection) => isElectionLive(election));
					if (firstActiveElection !== undefined) {
						activeElection = firstActiveElection;
					} else {
						// If there are no active elections at all just grab the most recent one
						// eslint-disable-next-line prefer-destructuring
						activeElection = json[0];
					}
				}

				dispatch(setCurrentElection(activeElection!.id));
			}
		}
	};
}

export function createElection(electionNew: Partial<IElection>) {
	// eslint-disable-next-line consistent-return
	return async (dispatch: Function, _getState: Function, api: IAPIClient) => {
		const { response, json } = await api.post('/0.1/elections/', electionNew, dispatch);

		if (response.status === 201) {
			dispatch(loadElection(json));
			dispatch(sendSnackbarNotification('Election created! 🌭🎉'));
			return json;
		}
	};
}

export function updateElection(election: IElection, electionNew: Partial<IElection>) {
	// eslint-disable-next-line consistent-return
	return async (dispatch: Function, _getState: Function, api: IAPIClient) => {
		const { response, json } = await api.patch(`/0.1/elections/${election.id}/`, electionNew, dispatch);

		if (response.status === 200) {
			dispatch(loadElection(json));
			dispatch(sendSnackbarNotification('Election updated! 🌭🎉'));
			return json;
		}
	};
}

export function setPrimaryElection(electionId: number) {
	return async (dispatch: Function, _getState: Function, api: IAPIClient) => {
		const { response } = await api.post(`/0.1/elections/${electionId}/set_primary/`, {}, dispatch);

		if (response.status === 200) {
			dispatch(togglePrimaryElection(electionId));
			dispatch(sendSnackbarNotification('Primary election changed! 🌟🎉'));
		}
	};
}

// export function setElectionTableName(election: IElection, newDBTableName: string) {
//     return async (dispatch: Function, getState: Function, api: IAPIClient) => {
// dispatch(
//             loadElection({
//                 id: election.id,
//                 db_table_name: newDBTableName,
//             })
//         )
//     }
// }

// Utilities
export function getURLSafeElectionName(election: IElection) {
	return encodeURI(election.name.replace(/\s/g, '_').toLowerCase());
}

export function isItElectionDay(election: IElection) {
	const now = new Date();
	return (
		now >= new Date(election.election_day) &&
		now <= new Date(new Date(election.election_day).getTime() + 60 * 60 * 24 * 1000)
	);
}

export const isElectionLive = (election: IElection) =>
	DateTime.local().endOf('day') <= DateTime.fromISO(election.election_day).endOf('day');
