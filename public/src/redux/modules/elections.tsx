import * as dotProp from 'dot-prop-immutable';
import { memoize } from 'lodash-es';
import { DateTime } from 'luxon';
import { createSelector } from 'reselect';
import { IAPIClient } from '../../shared/api/APIClient';
import { IGeoJSONPoylgon } from './interfaces';
import { IStore } from './reducer';
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
const LOAD_ELECTIONS = 'ealgis/elections/LOAD_ELECTIONS';
const LOAD_ELECTION = 'ealgis/elections/LOAD_ELECTION';
const SET_CURRENT_ELECTION = 'ealgis/elections/SET_CURRENT_ELECTION';
const SET_DEFAULT_ELECTION = 'ealgis/elections/SET_DEFAULT_ELECTION';
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
		case SET_DEFAULT_ELECTION:
			return dotProp.set(state, 'default_election_id', action.electionId);
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

export const getLiveElections = createSelector([getElections], (elections: IElection[]): any => {
	return elections.filter((election: IElection) => isElectionLive(election));
});

export const getElectionByURLSafeName = createSelector([getElections], (elections) =>
	memoize((electionName: string) => {
		return elections.find((election: IElection) => getURLSafeElectionName(election) === electionName);
	}),
);

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

export function setDefaultElection(electionId: number) {
	return {
		type: SET_DEFAULT_ELECTION,
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
	default_election_id: number; // election.id
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
	geom: IGeoJSONPoylgon;
	name: string;
	short_name: string;
	is_hidden: boolean;
	is_primary: boolean;
	is_federal: boolean;
	election_day: string; // Datetime
	polling_places_loaded: boolean;
}

export interface ISausagelyticsStats {
	australia: IElectionStats;
	states: IElectionStats[];
	divisions: {
		top: IElectionStats[];
		bottom: IElectionStats[];
	};
}

export interface IElectionStats {
	domain: string;
	metadata?: {
		state?: string;
		rank?: number;
	};
	data: IElectionStatsData;
}

export interface IElectionStatsData {
	all_booths: {
		booth_count: number;
		expected_voters: number;
	};
	all_booths_by_noms: {
		[key: string]: IElectionStatsNoms;
	};
}

export interface IElectionStatsNoms {
	booth_count: number;
	expected_voters: number;
}

export interface ISausagelyticsStateStats {
	state: IElectionStateStats;
}

export interface IElectionStateStats {
	domain: string;
	data: IElectionStateStatsData;
}

export interface IElectionStateStatsData {
	all_booths: {
		booth_count: number;
	};
	all_booths_by_noms: {
		[key: string]: IElectionStateStatsNoms;
	};
}

export interface IElectionStateStatsNoms {
	booth_count: number;
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function fetchElections() {
	return async (dispatch: Function, _getState: Function, api: IAPIClient) => {
		const { response, json } = await api.get('/0.1/elections/public/', dispatch);

		if (response.status === 200) {
			dispatch(loadElections(json));

			// Choose a default election to use when the route doesn't specify one
			const defaultElection = getDefaultElection(json);
			dispatch(setDefaultElection(defaultElection!.id));

			// Ensure there's always a current election set. Other components
			// will set this properly when they mount if needs be.
			dispatch(setCurrentElection(defaultElection!.id));
		}
	};
}

export function getDefaultElection(elections: Array<IElection>) {
	let defaultElection;

	// If there's a primary election, that's our first choice
	const primaryElection = elections.find((election: IElection) => election.is_primary);
	if (primaryElection !== undefined) {
		defaultElection = primaryElection;
	} else {
		// Failing that, just the first active election
		const firstLiveElection = elections.find((election: IElection) => isElectionLive(election));
		if (firstLiveElection !== undefined) {
			defaultElection = firstLiveElection;
		} else {
			// If there are no active elections at all just grab the most recent one
			// eslint-disable-next-line prefer-destructuring
			defaultElection = elections[0];
		}
	}

	return defaultElection;
}

export function fetchElectionStats(election: IElection) {
	return async (dispatch: Function, _getState: Function, api: IAPIClient) => {
		const { response, json } = await api.get(`/0.1/elections/${election.id}/stats/`, dispatch, {});

		if (response.status === 200) {
			return json;
		}
		return null;
	};
}

// export function setElectionTableName(election: IElection, newDBTableName: string) {
//     return async (dispatch: Function, getState: Function, api: IAPIClient) => {
//         dispatch(
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

// Yeah, sorry. Replace with fields in the database if we ditch short_name in the longer term
// "South Australian Election 2018" => "South Australia"
export const getElectionKindaShortName: any = (election: IElection) =>
	election.name
		.replace('Election ', '')
		.replace(/\s[0-9]{4}$/, '')
		.replace(/ian$/, 'ia')
		.replace(/\sBy-election$/, '');

// "South Australian Election 2018" => "South Australia 2018"
export const getElectionKindaNotSoShortName: any = (election: IElection) =>
	election.name
		.replace('Election ', '')
		.replace(/ian\s/, 'ia ')
		.replace(/\sBy-election\s/, ' ');

// "SA 2018" => "SA"
export const getElectionVeryShortName: any = (election: IElection) => election.short_name.replace(/\s[0-9]{4}$/, '');

export const getElectionLabel: any = (
	numberOfElectionTabsShowing: number,
	election: IElection,
	isHistoricalElectionShown: boolean,
	browserBreakpoint: string,
) => {
	if (isHistoricalElectionShown === false) {
		// e.g. FREO
		if (numberOfElectionTabsShowing > 3 && browserBreakpoint === 'extraSmall') {
			return getElectionVeryShortName(election);
		}
		if (numberOfElectionTabsShowing > 3) {
			// e.g. Fremantle
			return getElectionKindaShortName(election);
		}
		// e.g. Fremantle 2018
		return getElectionKindaNotSoShortName(election);
	}
	// e.g. Fremantle 2018
	return getElectionKindaNotSoShortName(election);
};

export function isItElectionDay(election: IElection) {
	const now = new Date();
	return (
		now >= new Date(election.election_day) &&
		now <= new Date(new Date(election.election_day).getTime() + 60 * 60 * 24 * 1000)
	);
}

export const isElectionLive = (election: IElection) =>
	DateTime.local().endOf('day') <= DateTime.fromISO(election.election_day).endOf('day');

export const getElectionsToShowInAppBar = (
	elections: IElection[],
	liveElections: IElection[],
	currentElection: IElection,
) => {
	let electionsToShow: IElection[];
	// Show our active elections
	if (liveElections.length > 0) {
		electionsToShow = liveElections;
	} else {
		// Show recent elections i.e. The last set of election(s) we did - may be weeks or months in the past
		electionsToShow = elections.filter(
			(election: IElection) => election.election_day === elections[0].election_day || election.is_primary,
		);
	}

	// or show an historical election
	let isHistoricalElectionShown = false;
	if (electionsToShow.includes(currentElection) === false) {
		isHistoricalElectionShown = true;
		electionsToShow = [currentElection];
	}

	return { electionsToShow, isHistoricalElectionShown };
};

// export function getElectionStatsDescription(election: IElection) {
//     const description: Array<string> = []

//     description.push(`Sausage Sizzles: ${election.stats.ttl_bbq}`)
//     description.push(`Cake Stalls: ${election.stats.ttl_caek}`)
//     description.push(`Red Crosses of Shame: ${election.stats.ttl_shame}`)

//     if ("ttl_coffee" in election.stats) {
//         description.push(`Coffee Vans: ${election.stats.ttl_coffee}`)
//     }

//     if ("ttl_bacon_and_eggs" in election.stats) {
//         description.push(`Bacon and Egg Rolls: ${election.stats.ttl_bacon_and_eggs}`)
//     }

//     if ("ttl_halal" in election.stats) {
//         description.push(`Halal Options: ${election.stats.ttl_halal}`)
//     }

//     if ("ttl_vego" in election.stats) {
//         description.push(`Savoury Vegetarian Options: ${election.stats.ttl_vego}`)
//     }

//     if ("ttl_free_text" in election.stats) {
//         description.push(`Drinks, icey poles, and other miscellaneous: ${election.stats.ttl_free_text}`)
//     }

//     return `${election.stats.ttl_booths} polling booths. ${description.join(", ")}`
// }

// export function renderElectionStats(election: IElection) {
//     const description: Array<any> = []

//     description.push(<FlatButton key={"booths"} label={`${election.stats.ttl_booths}`} icon={<ActionHome />} />)
//     description.push(<FlatButton key={"bbq"} label={`${election.stats.ttl_bbq}`} icon={<SausageIcon />} />)
//     description.push(<FlatButton key={"caek"} label={`${election.stats.ttl_caek}`} icon={<CakeIcon />} />)
//     description.push(<FlatButton key={"shame"} label={`${election.stats.ttl_shame}`} icon={<RedCrossofShameIcon />} />)

//     if ("ttl_coffee" in election.stats) {
//         description.push(<FlatButton key={"coffee"} label={`${election.stats.ttl_coffee}`} icon={<CoffeeIcon />} />)
//     }

//     if ("ttl_bacon_and_eggs" in election.stats) {
//         description.push(<FlatButton key={"baconandeggs"} label={`${election.stats.ttl_bacon_and_eggs}`} icon={<BaconandEggsIcon />} />)
//     }

//     if ("ttl_halal" in election.stats) {
//         description.push(<FlatButton key={"halal"} label={`${election.stats.ttl_halal}`} icon={<HalalIcon />} />)
//     }

//     if ("ttl_vego" in election.stats) {
//         description.push(<FlatButton key={"vego"} label={`${election.stats.ttl_vego}`} icon={<VegoIcon />} />)
//     }

//     if ("ttl_free_text" in election.stats) {
//         description.push(<FlatButton key={"free_text"} label={`${election.stats.ttl_free_text}`} icon={<MapsLocalDining />} />)
//     }

//     return description
// }

// https://en.wikipedia.org/wiki/Australian_state_colours
// export function getElectionColours(election: IElection) {
//     if (election.short_name.startsWith("SA ") === true) {
//         return { backgroundColor: "#FF0000", color: "white" }
//     } else if (election.short_name.startsWith("VIC ") === true || election.short_name.startsWith("BAT ") === true) {
//         return { backgroundColor: "#000075", color: "white" }
//     } else if (election.short_name.startsWith("WA ") === true) {
//         return { backgroundColor: "#FFD104", color: "white" }
//     } else if (election.short_name.startsWith("TAS ") === true) {
//         return { backgroundColor: "#005F45", color: "white" }
//     } else if (election.short_name.startsWith("QLD ") === true) {
//         return { backgroundColor: "#750000", color: "white" }
//     } else if (election.short_name.startsWith("NSW ") === true) {
//         return { backgroundColor: "#7CC7E8", color: "white" }
//     } else if (election.short_name.startsWith("ACT ") === true) {
//         return { backgroundColor: "#FFD104", color: "white" }
//     } else if (election.short_name.startsWith("NT ") === true) {
//         return { backgroundColor: "#E34F00", color: "white" }
//     }

//     return { backgroundColor: "#000000", color: "white" }
// }
