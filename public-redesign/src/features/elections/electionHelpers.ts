import { DateTime } from 'luxon';
import { View } from 'ol';
import { Polygon } from 'ol/geom';
import { Election } from '../../app/services/elections';
import { getStandardViewPadding } from '../map/mapHelpers';

export const isElectionLive = (election: Election) => {
	// return true;

	if (window.location.pathname === '/debug/' && window.location.search === '?live=true') {
		return true;
	}

	return DateTime.local().endOf('day') <= DateTime.fromISO(election.election_day).endOf('day');
};

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

export const getViewForElection = (election: Election) => {
	// Determine the size of the map.
	// Fallback to the window if for some weird reason we can't get the size of the OpenLayers Map.
	// It won't be exatly the same size (because of the header), but it'll do.
	const olMapDOMRect = document.getElementById('openlayers-map')?.getBoundingClientRect();
	const size =
		olMapDOMRect !== undefined ? [olMapDOMRect.width, olMapDOMRect.height] : [window.innerWidth, window.innerHeight];

	const view = new View();
	const polygon = new Polygon(election.geom.coordinates).transform('EPSG:4326', 'EPSG:3857');

	view.fit(polygon.getExtent(), {
		size,
		padding: getStandardViewPadding(),
	});

	return view;
};
