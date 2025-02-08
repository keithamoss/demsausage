import { ArrowBack } from '@mui/icons-material';
import { Box, Card, CardContent, IconButton, Tab, Tabs, Typography, useTheme } from '@mui/material';
import type Feature from 'ol/Feature';
import type { Election } from '../../app/services/elections';
import type { PollingPlaceWithPendingStall, UnofficialPollingPlaceWithPendingStall } from '../../app/services/stalls';
import { getAllFoodsAvailableOnStalls } from '../icons/iconHelpers';
import { getPollingPlaceNameForFormHeading } from './pollingPlaceFormHelpers';
import { type IPollingPlace, type IPollingPlaceNoms, PollingPlaceChanceOfSausage } from './pollingPlacesInterfaces';

export const getPollingPlaceSummaryCardForHeading = (
	pollingPlace: IPollingPlace | PollingPlaceWithPendingStall | UnofficialPollingPlaceWithPendingStall,
) => {
	const theme = useTheme();

	return (
		<Card variant="outlined">
			<CardContent sx={{ pb: `${theme.spacing(2)} !important` }}>
				<Box>
					<Typography
						variant="h5"
						component="div"
						sx={{
							fontSize: 16,
							fontWeight: 500,
						}}
					>
						{getPollingPlaceNameForFormHeading(pollingPlace.premises, pollingPlace.name)}
					</Typography>

					<Typography color="text.secondary" sx={{ fontSize: 15 }}>
						{pollingPlace.address}
					</Typography>
				</Box>
			</CardContent>
		</Card>
	);
};

export const getPollingPlaceNavTabs = (
	selectedTabName: string,
	onClickBack: () => void,
	onTabChange: (event: React.SyntheticEvent, newValue: number) => void,
) => {
	const selectedTabIndex = selectedTabName === 'Form' ? 0 : selectedTabName === 'History' ? 1 : 2;

	return (
		<Box sx={{ borderBottom: 0, borderColor: 'divider', display: 'flex' }}>
			<IconButton onClick={onClickBack}>
				<ArrowBack fontSize="inherit" />
			</IconButton>

			<Tabs value={selectedTabIndex} onChange={onTabChange}>
				<Tab label="Form" />
				<Tab label="History" />
				<Tab label="Stalls" />
			</Tabs>
		</Box>
	);
};

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

export const stallHasReportsOfNoms = (noms: IPollingPlaceNoms) => {
	for (const [key, value] of Object.entries(noms)) {
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

export const pollingPlaceHasReportsOfNoms = (pollingPlace: IPollingPlace) => {
	if (pollingPlace.stall === null || pollingPlace.stall.noms === null) {
		return false;
	}

	return stallHasReportsOfNoms(pollingPlace.stall.noms);
};

export function getFoodDescription(noms: IPollingPlaceNoms) {
	const foodLabels: Array<string> = [];
	const foodIcons = getAllFoodsAvailableOnStalls();

	for (const foodName of Object.keys(noms)) {
		const foodDefinition = foodIcons.find((i) => i.value === foodName);

		if (foodDefinition !== undefined) {
			foodLabels.push(foodDefinition.label);
		}
	}

	return foodLabels;
}

export function getFoodDescriptionFromPollingPlace(pollingPlace: IPollingPlace) {
	if (pollingPlace.stall === null || pollingPlace.stall.noms === null) {
		return [];
	}

	return getFoodDescription(pollingPlace.stall.noms);
}

export const getNomsDescriptiveText = (noms: IPollingPlaceNoms) => {
	let nomsList = getFoodDescription(noms);

	if (typeof noms.free_text === 'string' && noms.free_text.length >= 1) {
		nomsList.push(noms.free_text);
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

export const getPollingPlaceNomsDescriptiveText = (pollingPlace: IPollingPlace) => {
	if (pollingPlace.stall === null) {
		return '';
	}

	return getNomsDescriptiveText(pollingPlace.stall.noms);
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

	for (const f of features) {
		const id = f.getId();

		if (typeof id === 'number') {
			ids.push(id);
		}
	}

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
