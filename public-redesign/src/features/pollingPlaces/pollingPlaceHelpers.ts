import { purple } from '@mui/material/colors';
import Feature from 'ol/Feature';
import { Election } from '../../app/services/elections';
import { NomsOptionsAvailable } from '../icons/noms';
import { IPollingPlace, PollingPlaceChanceOfSausage } from './pollingPlacesInterfaces';

export const getPollingPlacePermalinkFromElectionAndPollingPlace = (election: Election, pollingPlace: IPollingPlace) =>
	getPollingPlacePermalinkFromProps(
		election.name_url_safe,
		pollingPlace.name,
		pollingPlace.premises,
		pollingPlace.state,
	);

export const getPollingPlacePermalinkFromProps = (
	electionNameURLSafe: string,
	name: string,
	premises: string,
	state: string,
) => {
	const nameEncoded = encodeURIComponent(name.replace(/\s/g, '_'));
	const premisesEncoded = encodeURIComponent(premises.replace(/\s/g, '_'));

	// Occasionally some elections will have no premises names on polling places
	return premises !== ''
		? `/${electionNameURLSafe}/polling_places/${nameEncoded}/${premisesEncoded}/${state}/`
		: `/${electionNameURLSafe}/polling_places/${nameEncoded}/${state}/`;
};

export const getSausageChancColourIndicator = (pollingPlace: IPollingPlace) => {
	switch (pollingPlace.chance_of_sausage) {
		case PollingPlaceChanceOfSausage.STRONG:
			return purple[600];
		case PollingPlaceChanceOfSausage.FAIR:
			return purple[500];
		case PollingPlaceChanceOfSausage.MIXED:
			return purple[400];
		case PollingPlaceChanceOfSausage.UNLIKELY:
			return purple[300];
		case PollingPlaceChanceOfSausage.NO_IDEA:
		case null:
		default:
			return purple[200];
	}
};

export const getSausageChanceDescription = (pollingPlace: IPollingPlace) => {
	switch (pollingPlace.chance_of_sausage) {
		case PollingPlaceChanceOfSausage.STRONG:
			return 'This booth has a STRONG chance of having food.';
		case PollingPlaceChanceOfSausage.FAIR:
			return 'This booth has a FAIR chance of having food.';
		case PollingPlaceChanceOfSausage.MIXED:
			return 'This booth has a MIXED chance of having food.';
		case PollingPlaceChanceOfSausage.UNLIKELY:
			return 'This booth is UNLIKELY to have food.';
		case PollingPlaceChanceOfSausage.NO_IDEA:
		case null:
		default:
			return 'We have never had reports from this booth.';
	}
};

export const getSausageChanceDescriptionSubheader = (pollingPlace: IPollingPlace) => {
	switch (pollingPlace.chance_of_sausage) {
		case PollingPlaceChanceOfSausage.STRONG:
		case PollingPlaceChanceOfSausage.FAIR:
		case PollingPlaceChanceOfSausage.MIXED:
		case PollingPlaceChanceOfSausage.UNLIKELY:
			return 'Based on reports from past elections';
		case PollingPlaceChanceOfSausage.NO_IDEA:
		case null:
		default:
			return 'Let us know what you find!';
	}
};

export const pollingPlaceHasReports = (pollingPlace: IPollingPlace) => {
	if (pollingPlace.stall === null || pollingPlace.stall.noms === null) {
		return false;
	}

	for (const [key, value] of Object.entries(pollingPlace.stall.noms)) {
		if (key !== 'free_text') {
			if (value === true) {
				return true;
			}
		} else if (value !== '') {
			return true;
		}
	}
	return false;
};

export const pollingPlaceHasReportsOfNoms = (pollingPlace: IPollingPlace) => {
	if (pollingPlace.stall === null || pollingPlace.stall.noms === null) {
		return false;
	}

	for (const [key, value] of Object.entries(pollingPlace.stall.noms)) {
		if (key === 'run_out' || key === 'nothing') {
			// eslint-disable-next-line no-continue
			continue;
		}

		if (key !== 'free_text') {
			if (value === true) {
				return true;
			}
		} else if (value !== '') {
			return true;
		}
	}
	return false;
};

export function getFoodDescription(pollingPlace: IPollingPlace) {
	if (pollingPlace.stall === null || pollingPlace.stall.noms === null) {
		return [];
	}

	const noms: Array<string> = [];
	if (pollingPlace.stall.noms.bbq) {
		noms.push(NomsOptionsAvailable.bbq.label);
	}
	if (pollingPlace.stall.noms.cake) {
		noms.push(NomsOptionsAvailable.cake.label);
	}
	if ('bacon_and_eggs' in pollingPlace.stall.noms && pollingPlace.stall.noms.bacon_and_eggs) {
		noms.push(NomsOptionsAvailable.bacon_and_eggs.label);
	}
	if ('vego' in pollingPlace.stall.noms && pollingPlace.stall.noms.vego) {
		noms.push(NomsOptionsAvailable.vego.label);
	}
	if ('halal' in pollingPlace.stall.noms && pollingPlace.stall.noms.halal) {
		noms.push(NomsOptionsAvailable.halal.label);
	}
	if ('coffee' in pollingPlace.stall.noms && pollingPlace.stall.noms.coffee) {
		noms.push(NomsOptionsAvailable.coffee.label);
	}

	return noms;
}

export const getPollingPlaceNomsDescriptiveText = (pollingPlace: IPollingPlace) => {
	let nomsList = getFoodDescription(pollingPlace);

	if (pollingPlace.stall?.noms.free_text !== undefined) {
		nomsList.push(pollingPlace.stall.noms.free_text);
	}

	nomsList = nomsList.map((s) => s.toLowerCase());

	if (nomsList.length >= 3) {
		return `${nomsList.slice(0, -1).join(', ')}, and ${nomsList.pop()}`;
	} else if (nomsList.length === 2) {
		return nomsList.join(' and ');
	} else if (nomsList.length === 1) {
		return nomsList[0];
	} else {
		return '';
	}
};

export const getPollingPlaceDivisionsDescriptiveText = (pollingPlace: IPollingPlace) => {
	switch (pollingPlace.divisions.length) {
		case 0:
			return '';
		case 1:
			return pollingPlace.divisions[0];
		case 2:
			return `${pollingPlace.divisions[0]} and ${pollingPlace.divisions[1]}`;
		default: {
			const lastDivision = pollingPlace.divisions.slice(-1)[0];
			return `${pollingPlace.divisions.slice(0, -1).join(', ')}, and ${lastDivision}`;
		}
	}
};

export const getPollingPlaceIdsFromFeatures = (features: Feature[]) => {
	const ids: number[] = [];
	features.forEach((f) => {
		const id = f.getId();

		if (typeof id === 'number') {
			ids.push(id);
		}
	});

	return ids;
};
