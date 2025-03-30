import { Close, Download, Refresh, Upload } from '@mui/icons-material';
import {
	AppBar,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Paper,
	Toolbar,
	Typography,
} from '@mui/material';
import { useNotifications } from '@toolpad/core';
import React, { useCallback, useEffect, useState } from 'react';
import { type Election, useClearElectionMapDataCacheMutation } from '../../app/services/elections';
import { DialogWithTransition } from '../../app/ui/dialog';
import { getAPIBaseURL } from '../../app/utils';
import ElectionLoadPollingPlaces from './ElectionLoadPollingPlaces';

interface Props {
	election: Election;
	onClose: () => void;
}

export default function ElectionControls(props: Props) {
	const { election, onClose } = props;

	const notifications = useNotifications();

	// ######################
	// Load Polling Places
	// ######################
	const [isLoadPollingPlacesDialogOpen, setIsLoadPollingPlacesDialogOpen] = useState(false);
	const onOpenLoadPollingPlacesDialog = useCallback(() => setIsLoadPollingPlacesDialogOpen(true), []);
	const onCloseLoadPollingPlacesDialog = useCallback(() => setIsLoadPollingPlacesDialogOpen(false), []);
	// ######################
	// Load Polling Places (End)
	// ######################

	// ######################
	// Download Data
	// ######################
	const onClickDownloadElectionData = () => {
		window.location.href = `${getAPIBaseURL()}/0.1/polling_places/?format=csv&election_id=${election.id}`;
	};
	// ######################
	// Download Data (End)
	// ######################

	// ######################
	// Download Vollie Research Data
	// ######################
	const onClickDownloadVollieResearchData = () => {
		window.location.href = `${getAPIBaseURL()}/0.1/polling_places/vollie_cos_task/?format=csv&election_id=${election.id}`;
	};
	// ######################
	// Download Vollie Research Data (End)
	// ######################

	// ######################
	// Map Data Cache Clearing
	// ######################
	const onClickRefreshMapData = () => {
		clearMapDataCache(election.id);
	};

	const [clearMapDataCache, { isLoading: isMapDataCacheClearingLoading, isSuccess: isMapDataCacheClearingSuccessful }] =
		useClearElectionMapDataCacheMutation();

	// We need to use the useEffect approach, rather than the
	// naked if approach (below) because otherwise this will
	// call onDone(), which causes ElectionsManager to start to re-render
	// at the same time, which causes React to complain about
	// updating a component while another is being rendered.
	useEffect(() => {
		if (isMapDataCacheClearingSuccessful === true) {
			notifications.show('Polling place data is being regenerated! 🌭🎉', {
				severity: 'success',
				autoHideDuration: 6000,
			});
		}
	}, [isMapDataCacheClearingSuccessful, notifications.show]);
	// ######################
	// Map Data Cache Clearing (End)
	// ######################

	return (
		<React.Fragment>
			<DialogWithTransition onClose={onClose}>
				<AppBar color="secondary" sx={{ position: 'sticky' }}>
					<Toolbar>
						<IconButton edge="start" color="inherit" onClick={onClose}>
							<Close />
						</IconButton>

						<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
							Election Controls
						</Typography>
					</Toolbar>
				</AppBar>

				<Paper elevation={0} sx={{ p: 2 }}>
					<List disablePadding>
						<ListItem disablePadding onClick={onOpenLoadPollingPlacesDialog}>
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

						<ListItem disablePadding onClick={onClickDownloadVollieResearchData}>
							<ListItemButton>
								<ListItemIcon>
									<Download />
								</ListItemIcon>
								<ListItemText primary="Download volunteer research data (XLS)" />
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
				</Paper>
			</DialogWithTransition>

			{isLoadPollingPlacesDialogOpen === true && (
				<ElectionLoadPollingPlaces election={election} onClose={onCloseLoadPollingPlacesDialog} />
			)}
		</React.Fragment>
	);
}
