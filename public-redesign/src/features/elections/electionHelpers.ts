import { DateTime } from 'luxon';
import { Election } from '../../app/services/elections';

export const isElectionLive = (election: Election) =>
	DateTime.local().endOf('day') <= DateTime.fromISO(election.election_day).endOf('day');

export function getDefaultElection(elections: Election[]) {
	let defaultElection: Election | undefined;

	// If there's a primary election, that's our first choice
	const primaryElection = elections.find((election: Election) => election.is_primary);

	if (primaryElection !== undefined) {
		defaultElection = primaryElection;
	} else {
		// Failing that, just the first active election
		const firstLiveElection = elections.find((election: Election) => isElectionLive(election));
		if (firstLiveElection !== undefined) {
			defaultElection = firstLiveElection;
		} else if (elections.length >= 1) {
			// If there are no active elections at all just grab the most recent one
			// eslint-disable-next-line prefer-destructuring
			defaultElection = elections[0];
		}
	}

	return defaultElection;
}

// Yeah, sorry. Replace with fields in the database if we ditch short_name in the longer term
// "South Australian Election 2018" => "South Australia"
export const getElectionKindaShortName = (election: Election) =>
	election.name
		.replace('Election ', '')
		.replace(/\s[0-9]{4}$/, '')
		.replace(/ian$/, 'ia')
		.replace(/\sBy-election$/, '');

// "South Australian Election 2018" => "South Australia 2018"
export const getElectionKindaNotSoShortName = (election: Election) =>
	election.name
		.replace('Election ', '')
		.replace(/ian\s/, 'ia ')
		.replace(/\sBy-election\s/, ' ');

// "SA 2018" => "SA"
export const getElectionVeryShortName = (election: Election) => {
	const veryShortName = election.short_name.replace(/\s[0-9]{4}$/, '');
	return veryShortName.length <= 3 ? veryShortName : veryShortName.slice(0, 3);
};
