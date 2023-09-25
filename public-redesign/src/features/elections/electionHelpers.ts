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
