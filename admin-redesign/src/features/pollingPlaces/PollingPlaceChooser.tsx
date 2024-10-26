import { Close } from '@mui/icons-material';
import {
	Alert,
	AlertTitle,
	FormControl,
	IconButton,
	InputAdornment,
	InputLabel,
	LinearProgress,
	ListItemIcon,
	ListItemText,
	MenuItem,
	OutlinedInput,
	Select,
	type SelectChangeEvent,
	Stack,
	debounce,
	useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import NotFound from '../../NotFound';
import { useAppSelector } from '../../app/hooks';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import type { Election } from '../../app/services/elections';
import { useLazyGetPollingPlaceBySearchTermQuery } from '../../app/services/pollingPlaces';
import { navigateToPollingPlaceEdit } from '../app/routing/navigationHelpers/navigationHelpersPollingPlace';
import { getDefaultElection } from '../elections/electionHelpers';
import { selectAllElections, selectElectionById } from '../elections/electionsSlice';
import { getJurisdictionCrestCircleReact } from '../icons/jurisdictionHelpers';
import { isSearchingYet } from './pollingPlaceSearchHelpers';
import type { IPollingPlace } from './pollingPlacesInterfaces';
import SearchResultsPollingPlaceCard from './searchResultsPollingPlaceCard';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
	'& h3:first-of-type': {
		marginTop: theme.spacing(1),
	},
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
			navigate(`/polling-places/${defaultElection.name_url_safe}/`);
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

interface Props {
	elections: Election[];
	election: Election;
}

function PollingPlaceChooser(props: Props) {
	const { elections, election } = props;

	const theme = useTheme();

	const params = useParams();
	const navigate = useNavigate();

	const onChooseElection = useCallback(
		() => (e: SelectChangeEvent<number | string>) => {
			const electionId = Number.parseInt(`${e.target.value}`);
			if (Number.isNaN(electionId) === false) {
				const election = elections.find((e) => e.id === electionId);
				if (election !== undefined) {
					navigate(`/polling-places/${election.name_url_safe}/`);
				}
			}
		},
		[navigate, elections],
	);

	// ######################
	// Polling Place Query
	// ######################
	const [
		trigger,
		{
			isFetching: isFetchingPollingPlacesBySearchTerm,
			isSuccess: isSuccessFetchingPollingPlacesBySearchTerm,
			error: errorFetchingPollingPlacesBySearchTerm,
			data: pollingPlaceBySearchTermResult,
		},
	] = useLazyGetPollingPlaceBySearchTermQuery();

	const onChoosePollingPlace = useCallback(
		(pollingPlace: IPollingPlace) => navigateToPollingPlaceEdit(params, navigate, pollingPlace),
		[navigate, params],
	);
	// ######################
	// Polling Place Query (End)
	// ######################

	// ######################
	// Search Field
	// ######################
	const [localSearchTerm, setLocalSearchTerm] = useState('');

	const searchFieldRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

	const debouncedNavigateOnSearchTermChange = useMemo(
		() =>
			debounce((searchTerm: string) => {
				if (isSearchingYet(searchTerm) === false) {
					return;
				}

				trigger({ electionId: election.id, searchTerm });
			}, 400),
		[trigger, election.id],
	);

	const onChangeSearchField = useCallback(
		(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
			debouncedNavigateOnSearchTermChange(event.target.value);
			setLocalSearchTerm(event.target.value);
		},
		[debouncedNavigateOnSearchTermChange],
	);

	const onKeyUpSearchField = useCallback(
		(event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			if (
				event.key === 'Enter' &&
				(event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement)
			) {
				event.target.blur();

				if (isSearchingYet(event.target.value) === true) {
					trigger({ electionId: election.id, searchTerm: event.target.value });
				}
			}
		},
		[trigger, election.id],
	);

	const onClearSearchBar = useCallback(() => {
		setLocalSearchTerm('');

		if (searchFieldRef.current !== null && document.activeElement !== searchFieldRef.current) {
			searchFieldRef.current.focus();
		}
	}, []);
	// ######################
	// Search Field (End)
	// ######################

	return (
		<React.Fragment>
			<Helmet>
				<title>Polling Places | Democracy Sausage</title>
			</Helmet>

			<PageWrapper>
				<FormControl fullWidth sx={{ mb: 3 }}>
					<InputLabel id="choose-an-election">Choose an election</InputLabel>

					<Select
						labelId="choose-an-election"
						value={election.id}
						label="Choose an election"
						onChange={onChooseElection}
					>
						{elections.map((e) => (
							<MenuItem key={e.id} value={e.id}>
								<div style={{ display: 'flex', alignItems: 'center' }}>
									<ListItemIcon sx={{ minWidth: 36 }}>
										{getJurisdictionCrestCircleReact(e.jurisdiction, {
											width: 36,
											height: 36,
											paddingRight: theme.spacing(1),
										})}
									</ListItemIcon>
									<ListItemText primary={e.name} />
								</div>
							</MenuItem>
						))}
					</Select>
				</FormControl>

				<FormControl fullWidth sx={{ mb: 2 }}>
					<InputLabel htmlFor="input-search-for-polling-place">Search for a polling place</InputLabel>

					<OutlinedInput
						id="input-search-for-polling-place"
						inputRef={searchFieldRef}
						value={localSearchTerm}
						onChange={onChangeSearchField}
						onKeyUp={onKeyUpSearchField}
						autoFocus={true}
						endAdornment={
							localSearchTerm.length > 0 ? (
								<InputAdornment position="end">
									<IconButton edge="end" onClick={onClearSearchBar}>
										<Close />
									</IconButton>
								</InputAdornment>
							) : undefined
						}
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
					pollingPlaceBySearchTermResult !== undefined && (
						<Stack spacing={1}>
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
		</React.Fragment>
	);
}

export default EntrypointLayer1;
