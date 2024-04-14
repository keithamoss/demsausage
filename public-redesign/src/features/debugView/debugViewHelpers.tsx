import { useAppSelector } from '../../app/hooks';
import { Election } from '../../app/services/elections';
import { useGetPollingPlaceByUniqueDetailsLookupQuery } from '../../app/services/pollingPlaces';
import { selectAllElections } from '../elections/electionsSlice';
import PollingPlaceSearchResultsCard from '../map/searchBar/pollingPlacesNearbySearchResults/pollingPlaceSearchResultsCard';
import PollingPlaceCard from '../pollingPlaces/pollingPlaceCard';

export const getPollingPlacePropsFromURL = (url: string) => {
	if ((url.match(/\//g) || []).length === 5) {
		const [
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			nowtOne,
			electionName,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			pollingPlaces,
			pollinPlaceName,
			pollingPlaceState,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			nowtTwo,
		] = url.split('/');

		return { electionName, pollinPlaceName, pollingPlacePremises: undefined, pollingPlaceState };
	}

	const [
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		nowtOne,
		electionName,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		pollingPlaces,
		pollinPlaceName,
		pollingPlacePremises,
		pollingPlaceState,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		nowtTwo,
	] = url.split('/');

	return { electionName, pollinPlaceName, pollingPlacePremises, pollingPlaceState };
};

interface PropsPollingPlaceCardDebugViewLayer1 {
	electionName: string;
	name: string;
	// Occasionally some elections will have no premises names on polling places
	premises: string | undefined;
	state: string;
}

export function PollingPlaceCardDebugViewEntrypointLayer1(props: PropsPollingPlaceCardDebugViewLayer1) {
	const { electionName, name, premises, state } = props;

	const elections = useAppSelector(selectAllElections);
	const election = elections.find((e) => e.name_url_safe === electionName);

	if (electionName === undefined || election === undefined) {
		return null;
	}

	if (name === undefined || state === undefined) {
		return null;
	}

	return (
		<PollingPlaceCardDebugViewEntrypointLayer2 election={election} name={name} premises={premises} state={state} />
	);
}

interface PropsPollingPlaceCardDebugViewLayer2 {
	election: Election;
	name: string;
	// Occasionally some elections will have no premises names on polling places
	premises: string | undefined;
	state: string;
}

function PollingPlaceCardDebugViewEntrypointLayer2(props: PropsPollingPlaceCardDebugViewLayer2) {
	const { election, name, premises, state } = props;

	const { data: pollingPlace } = useGetPollingPlaceByUniqueDetailsLookupQuery({
		electionId: election.id,
		name,
		premises,
		state,
	});

	if (pollingPlace === undefined) {
		return null;
	}

	return <PollingPlaceCard pollingPlace={pollingPlace} election={election} onClose={() => {}} />;
}

interface PropsPollingPlaceSearchResultsCardDebugViewLayer1 {
	electionName: string;
	name: string;
	// Occasionally some elections will have no premises names on polling places
	premises: string | undefined;
	state: string;
}

export function PollingPlaceSearchResultsCardDebugViewEntrypointLayer1(
	props: PropsPollingPlaceSearchResultsCardDebugViewLayer1,
) {
	const { electionName, name, premises, state } = props;

	const elections = useAppSelector(selectAllElections);
	const election = elections.find((e) => e.name_url_safe === electionName);

	if (electionName === undefined || election === undefined) {
		return null;
	}

	if (name === undefined || state === undefined) {
		return null;
	}

	return (
		<PollingPlaceSearchResultsCardDebugViewEntrypointLayer2
			election={election}
			name={name}
			premises={premises}
			state={state}
		/>
	);
}

interface PropsPollingPlaceSearchResultsCardDebugViewLayer2 {
	election: Election;
	name: string;
	// Occasionally some elections will have no premises names on polling places
	premises: string | undefined;
	state: string;
}

function PollingPlaceSearchResultsCardDebugViewEntrypointLayer2(
	props: PropsPollingPlaceSearchResultsCardDebugViewLayer2,
) {
	const { election, name, premises, state } = props;

	const { data: pollingPlace } = useGetPollingPlaceByUniqueDetailsLookupQuery({
		electionId: election.id,
		name,
		premises,
		state,
	});

	if (pollingPlace === undefined) {
		return null;
	}

	return <PollingPlaceSearchResultsCard pollingPlace={pollingPlace} />;
}
