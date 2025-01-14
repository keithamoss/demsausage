import { Download, Refresh, Upload } from '@mui/icons-material';
import { Alert, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Snackbar, styled } from '@mui/material';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from '../../NotFound';
import { useAppSelector } from '../../app/hooks';
import {
	navigateToElection,
	navigateToElectionLoadPollingPlaces,
	navigateToElectionStats,
	navigateToElections,
} from '../../app/routing/navigationHelpers/navigationHelpersElections';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import { type Election, useClearElectionMapDataCacheMutation } from '../../app/services/elections';
import { getAPIBaseURL } from '../../app/utils';
import { getElectionEditorNavTabs } from './electionHelpers';
import { selectAllElections } from './electionsSlice';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(2),
	paddingRight: theme.spacing(2),
}));

const ContentWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
}));

function ElectionEditorEntrypoint() {
	const params = useParams();
	const urlElectionName = getStringParamOrUndefined(params, 'election_name');

	const elections = useAppSelector(selectAllElections);
	const election = elections.find((e) => e.name_url_safe === urlElectionName);

	// Just in case the user loads the page directly via the URL and the UI renders before we get the API response
	if (election === undefined) {
		return <NotFound />;
	}

	return <ElectionEditorControls election={election} />;
}

interface Props {
	election: Election;
}

function ElectionEditorControls(props: Props) {
	const { election } = props;

	const navigate = useNavigate();

	// ######################
	// Controls
	// ######################
	const onClickLoadNewPollingPlacesFile = () => {
		navigateToElectionLoadPollingPlaces(navigate, election);
	};

	const onClickDownloadElectionData = () => {
		window.location.href = `${getAPIBaseURL()}/0.1/polling_places/?format=csv&election_id=${election.id}`;
	};

	const onClickRefreshMapData = () => {
		clearMapDataCache(election.id);
	};
	// ######################
	// Controls (End)
	// ######################

	// ######################
	// Map Data Cache Clearing
	// ######################
	const [clearMapDataCache, { isLoading: isMapDataCacheClearingLoading, isSuccess: isMapDataCacheClearingSuccessful }] =
		useClearElectionMapDataCacheMutation();

	// We need to use the useEffect approach, rather than the
	// naked if approach (below) because otherwise this will
	// call onDone(), which causes ElectionsManager to start to re-render
	// at the same time, which causes React to complain about
	// updating a component while another is being rendered.
	useEffect(() => {
		if (isMapDataCacheClearingSuccessful === true) {
			setIsMapDataClearingConfirmationSnackbarShown(true);
		}
	}, [isMapDataCacheClearingSuccessful]);

	const [isMapDataClearingConfirmationSnackbarShown, setIsMapDataClearingConfirmationSnackbarShown] = useState(false);

	const onSnackbarClose = useCallback(() => setIsMapDataClearingConfirmationSnackbarShown(false), []);
	// ######################
	// Map Data Cache Clearing (End)
	// ######################

	// ######################
	// Navigation
	// ######################
	const onClickBack = useCallback(() => {
		navigateToElections(navigate);
	}, [navigate]);

	const onClickGoToForm = useCallback(() => {
		navigateToElection(navigate, election);
	}, [navigate, election]);

	const onClickGoToStats = useCallback(() => {
		navigateToElectionStats(navigate, election);
	}, [navigate, election]);

	const onTabChange = (event: React.SyntheticEvent, newValue: number) => {
		if (newValue === 0) {
			onClickGoToForm();
		} else if (newValue === 2) {
			onClickGoToStats();
		}
	};
	// ######################
	// Navigation (End)
	// ######################

	return (
		<PageWrapper>
			{getElectionEditorNavTabs('Controls', onClickBack, onTabChange)}

			<ContentWrapper>
				<List disablePadding>
					<ListItem disablePadding onClick={onClickLoadNewPollingPlacesFile}>
						<ListItemButton>
							<ListItemIcon>
								<Upload />
							</ListItemIcon>
							<ListItemText primary="Load a new polling places file" />
						</ListItemButton>
					</ListItem>

					<ListItem disablePadding onClick={onClickDownloadElectionData}>
						<ListItemButton>
							<ListItemIcon>
								<Download />
							</ListItemIcon>
							<ListItemText primary="Download election data (XLS)" />
						</ListItemButton>
					</ListItem>

					<ListItem disablePadding onClick={onClickRefreshMapData}>
						<ListItemButton>
							<ListItemIcon>
								<Refresh />
							</ListItemIcon>
							<ListItemText primary="Refresh map data" />
						</ListItemButton>
					</ListItem>
				</List>
			</ContentWrapper>

			<Snackbar open={isMapDataClearingConfirmationSnackbarShown} autoHideDuration={6000} onClose={onSnackbarClose}>
				<Alert severity="success" variant="standard" sx={{ width: '100%' }}>
					Polling place data is being regenerated! 🌭🎉
				</Alert>
			</Snackbar>
		</PageWrapper>
	);
}

export default ElectionEditorEntrypoint;
