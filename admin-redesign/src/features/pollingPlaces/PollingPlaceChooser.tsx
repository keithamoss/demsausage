import { Close } from '@mui/icons-material';
import {
	Alert,
	AlertTitle,
	FormControl,
	IconButton,
	InputAdornment,
	InputLabel,
	LinearProgress,
	List,
	ListItem,
	ListItemText,
	OutlinedInput,
	Stack,
	debounce,
	styled,
} from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import NotFound from '../../NotFound';
import { useAppSelector } from '../../app/hooks';
import {
	navigateToPollingPlaceEditorForm,
	navigateToPollingPlaceSearch,
	navigateToPollingPlaceSearchFromElection,
	navigateToPollingPlaceSearchResults,
} from '../../app/routing/navigationHelpers/navigationHelpersPollingPlace';
import { getStringParamOrEmptyString, getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import type { Election } from '../../app/services/elections';
import { useGetPollingPlaceBySearchTermQuery } from '../../app/services/pollingPlaces';
import { SelectElection } from '../../app/ui/selectElection';
import { getDefaultElection } from '../elections/electionHelpers';
import { selectAllElections, selectElectionById } from '../elections/electionsSlice';
import { isSearchingYet } from './pollingPlaceSearchHelpers';
import type { IPollingPlace } from './pollingPlacesInterfaces';
import SearchResultsPollingPlaceCard from './searchResultsPollingPlaceCard';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
}));

// The entrypoint handles determining the election that should be displayed based on route changes.
function EntrypointLayer1() {
	const navigate = useNavigate();

	// Fallback to our default election if the route hasn't specified an election
	const elections = useAppSelector(selectAllElections);
	const defaultElection = getDefaultElection(elections);
	let electionId = defaultElection?.id;

	// Otherwise, set the election the route wants to use
	const urlElectionName = getStringParamOrUndefined(useParams(), 'election_name');
	if (urlElectionName !== undefined && urlElectionName !== '' && urlElectionName !== defaultElection?.name_url_safe) {
		electionId = elections.find((e) => e.name_url_safe === urlElectionName)?.id;
	}

	// Force users coming into the root of the page (/polling-places/) over to the unique URL for the current default election
	useEffect(() => {
		if (urlElectionName === undefined && defaultElection !== undefined) {
			navigateToPollingPlaceSearchFromElection(navigate, defaultElection);
		}
	}, [defaultElection, navigate, urlElectionName]);

	if (electionId === undefined) {
		return null;
	}

	return <EntrypointLayer2 electionId={electionId} />;
}

interface PropsEntrypointLayer2 {
	electionId: number;
}

function EntrypointLayer2(props: PropsEntrypointLayer2) {
	const { electionId } = props;

	const location = useLocation();

	const elections = useAppSelector((state) => selectAllElections(state));
	const election = useAppSelector((state) => selectElectionById(state, electionId));

	if (election === undefined) {
		return <NotFound />;
	}

	if (location.pathname.startsWith(`/polling-places/${election.name_url_safe}`) === true) {
		return <PollingPlaceChooser elections={elections} election={election} />;
	}
}

interface LocationState {
	disableAutoFocus?: boolean;
}

interface Props {
	elections: Election[];
	election: Election;
}

function PollingPlaceChooser(props: Props) {
	const { elections, election } = props;

	const params = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const [localSearchTerm, setLocalSearchTerm] = useState('');

	const urlSearchTerm = getStringParamOrEmptyString(params, 'search_term');

	const disableAutoFocus = (location.state as LocationState)?.disableAutoFocus === true;

	// When the URL search term changes from the user navigating back/forward,
	// or reloading the page, we just need to handle setting the search term
	// based on what's in the URL of the page.
	useEffect(() => {
		setLocalSearchTerm(urlSearchTerm);
	}, [urlSearchTerm]);

	const onChooseElection = (election: Election) => navigateToPollingPlaceSearchFromElection(navigate, election);

	// ######################
	// Search Field
	// ######################
	const searchFieldRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

	const debouncedNavigateOnSearchTermChange = useMemo(
		() =>
			debounce((searchTerm: string) => {
				if (isSearchingYet(searchTerm) === false) {
					return;
				}

				navigateToPollingPlaceSearchResults(params, navigate, searchTerm);
			}, 800),
		[params, navigate],
	);
	const onChangeSearchField = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			debouncedNavigateOnSearchTermChange(event.target.value);
			setLocalSearchTerm(event.target.value);
		},
		[debouncedNavigateOnSearchTermChange],
	);

	// Pretty sure there's no need to trigger a search query here, as that's taken care of with the logic elsewhere in this component. So all we need to do is blur (i.e. take focus away from the input) to meet user expectations on how search boxes behave.
	const onKeyUpSearchField = useCallback((event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		if (
			event.key === 'Enter' &&
			(event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement)
		) {
			event.target.blur();
		}
	}, []);

	const onClearSearchBar = useCallback(() => {
		navigateToPollingPlaceSearch(params, navigate);

		if (searchFieldRef.current !== null && document.activeElement !== searchFieldRef.current) {
			searchFieldRef.current.focus();
		}
	}, [params, navigate]);
	// ######################
	// Search Field (End)
	// ######################

	// ######################
	// Polling Place Query
	// ######################
	const {
		data: pollingPlaceBySearchTermResult,
		error: errorFetchingPollingPlacesBySearchTerm,
		isFetching: isFetchingPollingPlacesBySearchTerm,
		isSuccess: isSuccessFetchingPollingPlacesBySearchTerm,
	} = useGetPollingPlaceBySearchTermQuery(
		isSearchingYet(urlSearchTerm) === true ? { electionId: election.id, searchTerm: urlSearchTerm } : skipToken,
	);

	const onChoosePollingPlace = useCallback(
		(pollingPlace: IPollingPlace) => navigateToPollingPlaceEditorForm(params, navigate, pollingPlace),
		[navigate, params],
	);
	// ######################
	// Polling Place Query (End)
	// ######################

	return (
		<PageWrapper>
			<SelectElection
				election={election}
				label="Choose an election"
				elections={elections}
				onChooseElection={onChooseElection}
			/>

			<FormControl fullWidth sx={{ mb: 2 }}>
				<InputLabel htmlFor="input-search-for-polling-place">Search for a polling place</InputLabel>

				<OutlinedInput
					id="input-search-for-polling-place"
					inputRef={searchFieldRef}
					value={localSearchTerm}
					onChange={onChangeSearchField}
					onKeyUp={onKeyUpSearchField}
					autoFocus={disableAutoFocus !== true}
					endAdornment={
						localSearchTerm.length > 0 ? (
							<InputAdornment position="end">
								<IconButton edge="end" onClick={onClearSearchBar}>
									<Close />
								</IconButton>
							</InputAdornment>
						) : undefined
					}
					inputProps={{ spellCheck: false }}
					label="Search for a polling place"
				/>

				{isFetchingPollingPlacesBySearchTerm === true && <LinearProgress color="secondary" />}
			</FormControl>

			{/* Handles not found and all other types of error */}
			{errorFetchingPollingPlacesBySearchTerm !== undefined && (
				<Alert severity="error">
					<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
					Something went awry while searching for polling places.
				</Alert>
			)}

			{isFetchingPollingPlacesBySearchTerm === false &&
				isSuccessFetchingPollingPlacesBySearchTerm === true &&
				pollingPlaceBySearchTermResult !== undefined &&
				isSearchingYet(urlSearchTerm) === true && (
					<Stack spacing={1}>
						{pollingPlaceBySearchTermResult.length === 0 && (
							<List disablePadding>
								<ListItem>
									<ListItemText primary="No results found" />
								</ListItem>
							</List>
						)}

						{pollingPlaceBySearchTermResult.map((pollingPlace) => (
							<SearchResultsPollingPlaceCard
								key={pollingPlace.id}
								pollingPlace={pollingPlace}
								searchTerm={localSearchTerm}
								onChoosePollingPlaceLabel="Select Polling Place"
								onChoosePollingPlace={onChoosePollingPlace}
							/>
						))}
					</Stack>
				)}
		</PageWrapper>
	);
}

export default EntrypointLayer1;
