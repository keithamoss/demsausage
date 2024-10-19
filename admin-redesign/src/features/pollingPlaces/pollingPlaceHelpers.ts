import type Feature from 'ol/Feature';
import type { Election } from '../../app/services/elections';
import { getAllFoodsAvailableOnStalls } from '../icons/iconHelpers';
import { type IPollingPlace, PollingPlaceChanceOfSausage } from './pollingPlacesInterfaces';

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
		default:
			return 'Let us know what you find!';
	}
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

	const foodLabels: Array<string> = [];
	const foodIcons = getAllFoodsAvailableOnStalls();

	Object.keys(pollingPlace.stall.noms).forEach((foodName) => {
		const foodDefinition = foodIcons.find((i) => i.value === foodName);

		if (foodDefinition !== undefined) {
			foodLabels.push(foodDefinition.label);
		}
	});

	return foodLabels;
}

export const getPollingPlaceNomsDescriptiveText = (pollingPlace: IPollingPlace) => {
	let nomsList = getFoodDescription(pollingPlace);

	if (typeof pollingPlace.stall?.noms.free_text === 'string' && pollingPlace.stall?.noms.free_text.length >= 1) {
		nomsList.push(pollingPlace.stall.noms.free_text);
	}

	nomsList = nomsList.map((s) => s.toLowerCase());

	if (nomsList.length >= 3) {
		return `${nomsList.slice(0, -1).join(', ')}, and ${nomsList.pop()}`;
	}
	if (nomsList.length === 2) {
		return nomsList.join(' and ');
	}
	if (nomsList.length === 1) {
		return nomsList[0];
	}
	return '';
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

export const isStallWebsiteValid = (website: string | undefined) => {
	if (typeof website === 'string' && website !== '') {
		const url = getStallWebsiteWithProtocol(website);
		return url !== undefined && URL.canParse(url) === true;
	}
	return false;
};

export const getStallWebsiteWithProtocol = (website: string | undefined) => {
	if (website === undefined || (typeof website === 'string' && website === '')) {
		return undefined;
	}

	// Assume that everything supports https these days
	return website.startsWith('http') === true ? website : `https://${website}`;
};

export const getStallWebsiteDomainName = (website: string | undefined) => {
	const url = getStallWebsiteWithProtocol(website);

	if (url !== undefined && URL.canParse(url) === true) {
		return new URL(url).host;
	}
	return undefined;
};
