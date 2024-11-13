import { Alert, AlertTitle, styled } from '@mui/material';
import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorElement from '../../ErrorElement';
import { useAppSelector } from '../../app/hooks';
import {
	navigateToPollingPlaceSearch,
	navigateToPollingPlaceSearchResultsFromURLSearchTerm,
} from '../../app/routing/navigationHelpers/navigationHelpersPollingPlace';
import { getIntegerParamOrUndefined, getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import {
	useAddOrEditPollingBoothNomsMutation,
	useDeletePollingBoothNomsMutation,
	useGetPollingPlaceByIdsLookupQuery,
} from '../../app/services/pollingPlaces';
import { WholeScreenLoadingIndicator } from '../../app/ui/wholeScreenLoadingIndicator';
import { selectAllElections } from '../elections/electionsSlice';
import PollingPlaceNomsEditorForm from './PollingPlaceNomsEditorForm';
import type { IPollingPlace, IPollingPlaceStallModifiableProps } from './pollingPlacesInterfaces';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(1),
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
}));

function EntrypointLayer1() {
	const params = useParams();

	const urlElectionName = getStringParamOrUndefined(params, 'election_name');
	const urlPollingPlaceId = getIntegerParamOrUndefined(params, 'polling_place_id');

	let electionId: number | undefined;
	const elections = useAppSelector(selectAllElections);

	if (urlElectionName !== undefined && urlElectionName !== '') {
		electionId = elections.find((e) => e.name_url_safe === urlElectionName)?.id;
	}

	if (electionId === undefined || urlPollingPlaceId === undefined) {
		return <ErrorElement />;
	}

	return <EntrypointLayer2 electionId={electionId} pollingPlaceId={urlPollingPlaceId} />;
}

interface PropsEntrypointLayer2 {
	electionId: number;
	pollingPlaceId: number;
}

function EntrypointLayer2(props: PropsEntrypointLayer2) {
	const { electionId, pollingPlaceId } = props;

	const {
		data: pollingPlaces,
		isLoading: isGetPollingPlaceLoading,
		isSuccess: isGetPollingPlaceSuccessful,
		isError: isGetPollingPlaceErrored,
		error,
	} = useGetPollingPlaceByIdsLookupQuery({ electionId, pollingPlaceIds: [pollingPlaceId] });

	if (isGetPollingPlaceLoading === true) {
		return <WholeScreenLoadingIndicator />;
	}

	if (isGetPollingPlaceErrored === true || (isGetPollingPlaceSuccessful === true && pollingPlaces === undefined)) {
		return <ErrorElement />;
	}

	if (pollingPlaces === undefined || pollingPlaces.length !== 1) {
		return <ErrorElement />;
	}

	return <PollingPlaceNomsEditor pollingPlace={pollingPlaces[0]} />;
}

interface Props {
	pollingPlace: IPollingPlace;
}

function PollingPlaceNomsEditor(props: Props) {
	const { pollingPlace } = props;

	const params = useParams();
	const navigate = useNavigate();

	const urlSearchTerm = getStringParamOrUndefined(params, 'search_term');

	// ######################
	// Add / Edit Noms
	// ######################
	const [
		addOrEditPollingPlaceNoms,
		{
			isLoading: isAddingOrEditingPollingPlaceNomsLoading,
			isSuccess: isAddingOrEditingPollingPlaceNomsSuccessful,
			isError: isAddingOrEditingPollingPlaceNomsErrored,
		},
	] = useAddOrEditPollingBoothNomsMutation();

	useEffect(() => {
		if (isAddingOrEditingPollingPlaceNomsSuccessful === true) {
			navigateToPollingPlaceSearch(params, navigate);
		}
	}, [isAddingOrEditingPollingPlaceNomsSuccessful, navigate, params]);

	const onDoneCreatingOrEditing = useCallback(
		(pollingPlaceId: number, stall: Partial<IPollingPlaceStallModifiableProps>) => {
			addOrEditPollingPlaceNoms({ pollingPlaceId, stall });
		},
		[addOrEditPollingPlaceNoms],
	);
	// ######################
	// Add / Edit Noms (End)
	// ######################

	// ######################
	// Delete Noms
	// ######################
	const [
		deletePollingPlaceNoms,
		{
			isLoading: isDeletingPollingPlaceNomsLoading,
			isSuccess: isDeletingPollingPlaceNomsSuccessful,
			isError: isDeletingPollingPlaceNomsErrored,
		},
	] = useDeletePollingBoothNomsMutation();

	useEffect(() => {
		if (isDeletingPollingPlaceNomsSuccessful === true) {
			navigateToPollingPlaceSearch(params, navigate);
		}
	}, [isDeletingPollingPlaceNomsSuccessful, navigate, params]);

	const onDelete = useCallback(
		(pollingPlaceId: number) => {
			deletePollingPlaceNoms(pollingPlaceId);
		},
		[deletePollingPlaceNoms],
	);
	// ######################
	// Delete Noms (End)
	// ######################

	// ######################
	// Navigation
	// ######################
	const onClickBack = useCallback(() => {
		// If the user came directly here from the "Search for a polling place", then we can safely
		// just send them back to land them on their search results screen.
		if (urlSearchTerm !== undefined) {
			navigateToPollingPlaceSearchResultsFromURLSearchTerm(params, navigate);
		} else {
			// However if we've not, e.g. if the user has navigated here directly using a link, then we can't
			// be sure where we'll end up, so best just to send the user back to the start of selecting a polling place.
			navigateToPollingPlaceSearch(params, navigate);
		}
	}, [urlSearchTerm, params, navigate]);
	// ######################
	// Navigation (End)
	// ######################

	return (
		<PageWrapper>
			<PollingPlaceNomsEditorForm
				pollingPlace={pollingPlace}
				onClickBack={onClickBack}
				onDoneCreatingOrEditing={onDoneCreatingOrEditing}
				isSaving={isAddingOrEditingPollingPlaceNomsLoading}
				onDelete={onDelete}
				isDeleting={isDeletingPollingPlaceNomsLoading}
			/>

			{isAddingOrEditingPollingPlaceNomsErrored === true && (
				<Alert severity="error">
					<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
					Something went awry when we tried to submit your polling place noms changes.
				</Alert>
			)}

			{isDeletingPollingPlaceNomsErrored === true && (
				<Alert severity="error">
					<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
					Something went awry when we tried to delete these polling place noms.
				</Alert>
			)}
		</PageWrapper>
	);
}

export default EntrypointLayer1;
