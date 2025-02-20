import {
	ArrowBack,
	Check,
	CheckCircle,
	Error as ErrorIcon,
	InfoOutlined,
	InsertDriveFile,
	Numbers,
	Upload,
} from '@mui/icons-material';
import {
	Box,
	Button,
	Checkbox,
	FormControlLabel,
	FormGroup,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	ListSubheader,
	TextField,
	styled,
} from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import React, { type ChangeEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NotFound from '../../NotFound';
import { useAppSelector } from '../../app/hooks';
import { navigateToElectionControls } from '../../app/routing/navigationHelpers/navigationHelpersElections';
import { getStringParamOrUndefined } from '../../app/routing/routingHelpers';
import {
	type Election,
	useGetPollingPlaceLoaderJobInfoQuery,
	useLoadPollingPlaceFileMutation,
} from '../../app/services/elections';
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

	return <ElectionEditorLoadPollingPlaces election={election} />;
}

interface Props {
	election: Election;
}

function ElectionEditorLoadPollingPlaces(props: Props) {
	const { election } = props;

	const navigate = useNavigate();

	const [jsonConfig, setJSONConfig] = useState<string | undefined>();
	const [isDryRun, setIsDryRun] = useState(true);
	const [file, setFile] = useState<File | undefined>();

	const [jobId, setJobId] = useState<string | undefined>();

	// ######################
	// Form Fields
	// ######################
	const onJSONConfigChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		setJSONConfig(e.target.value || undefined);
	};

	const onIsDryRunChange = (e: ChangeEvent<HTMLInputElement>, checked: boolean) => {
		setIsDryRun(checked);
	};

	const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.files === null || e.target.files[0] === undefined) {
			return;
		}

		uploadFile({
			electionId: election.id,
			jsonConfig,
			isDryRun,
			file: e.target.files[0],
		});

		setFile(e.target.files[0]);
	};
	// ######################
	// Form Fields (End)
	// ######################

	// ######################
	// Upload Polling Place CSV File
	// ######################
	const [uploadFile, { data: taskJob, isLoading: isUploadFileLoading, isSuccess: isUploadFileSuccessful }] =
		useLoadPollingPlaceFileMutation();

	useEffect(() => {
		if (isUploadFileSuccessful === true) {
			setJobId(taskJob.job_id);
			setIsPollingForJobInfo(true);
		}
	}, [isUploadFileSuccessful, taskJob?.job_id]);
	// ######################
	// Upload Polling Place CSV File (End)
	// ######################

	// ######################
	// Get Job Info
	// ######################
	const [isPollingForJobInfo, setIsPollingForJobInfo] = useState(false);

	const {
		data: jobInfo,
		isSuccess: isGetJobInfoSuccessful,
		isError: isGetJobInfoError,
	} = useGetPollingPlaceLoaderJobInfoQuery(
		jobId !== undefined
			? {
					electionId: election.id,
					jobId,
				}
			: skipToken,
		{
			pollingInterval: isPollingForJobInfo === true ? 3000 : 0,
			skipPollingIfUnfocused: true,
		},
	);

	useEffect(() => {
		if (isGetJobInfoSuccessful === true && jobInfo.status !== 'started') {
			setIsPollingForJobInfo(false);
		}
	}, [isGetJobInfoSuccessful, jobInfo]);
	// ######################
	// Get Job Info (End)
	// ######################

	// ######################
	// Navigation
	// ######################
	const onClickBack = useCallback(() => {
		navigateToElectionControls(navigate, election);
	}, [navigate, election]);
	// ######################
	// Navigation (End)
	// ######################

	return (
		<PageWrapper>
			<Box sx={{ borderBottom: 0, borderColor: 'divider', display: 'flex' }}>
				<IconButton onClick={onClickBack}>
					<ArrowBack fontSize="inherit" />
				</IconButton>
			</Box>

			<ContentWrapper>
				<TextField label="JSON config" multiline fullWidth onChange={onJSONConfigChange} />

				<FormGroup sx={{ mt: 2, mb: 2 }}>
					<FormControlLabel control={<Checkbox defaultChecked onChange={onIsDryRunChange} />} label="Dry run?" />
				</FormGroup>

				<Button variant="contained" component="label" startIcon={<Upload />}>
					Choose polling places CSV file to upload
					<input type="file" hidden accept=".csv" onChange={onFileChange} />
				</Button>

				{file !== undefined && (
					<List>
						<ListItem>
							<ListItemIcon>
								<InsertDriveFile />
							</ListItemIcon>

							<ListItemText
								primary={`${file.name} (${file.type})`}
								secondary={`${(file.size / 1048576).toFixed(3)}MB`}
							/>
						</ListItem>
					</List>
				)}

				{jobId !== undefined && (
					<List>
						<ListItem>
							<ListItemIcon>
								<Numbers />
							</ListItemIcon>

							<ListItemText primary={`Job ID: ${jobId}`} />
						</ListItem>

						{isGetJobInfoError === true && (
							<ListItem>
								<ListItemIcon>
									<ErrorIcon color="error" />
								</ListItemIcon>

								<ListItemText primary="There was a problem fetching information about the loader job." />
							</ListItem>
						)}

						{isGetJobInfoSuccessful === true && jobInfo !== undefined && (
							<React.Fragment>
								<ListItem>
									<ListItemIcon>
										<InfoOutlined />
									</ListItemIcon>

									<ListItemText primary={`Job status: ${jobInfo.status}`} sx={{ textTransform: 'capitalize' }} />
								</ListItem>

								{jobInfo.stages_log !== null &&
									jobInfo.stages_log.length > 0 &&
									jobInfo.stages_log.map((stageName: string) => (
										<ListItem key={stageName}>
											<ListItemIcon>
												<Check />
											</ListItemIcon>

											<ListItemText primary={stageName.replaceAll('_', ' ')} sx={{ textTransform: 'capitalize' }} />
										</ListItem>
									))}

								{jobInfo.response !== null && jobInfo.response.logs.errors.length > 0 && (
									<ListItem>
										<ListItemIcon>
											<ErrorIcon color="error" />
										</ListItemIcon>

										<ListItemText primary="There was a problem loading the polling places. Please review the logs below for further information." />
									</ListItem>
								)}

								{jobInfo.response !== null && jobInfo.response.logs.errors.length === 0 && (
									<ListItem>
										<ListItemIcon>
											<CheckCircle color="success" />
										</ListItemIcon>

										<ListItemText primary="Polling places have been loaded successfully." />
									</ListItem>
								)}

								{jobInfo.response !== null && jobInfo.response.logs.errors.length > 0 && (
									<React.Fragment>
										<ListSubheader sx={{ fontSize: 18, lineHeight: '28px', mt: 2, fontWeight: 500, color: 'black' }}>
											Errors
										</ListSubheader>

										{jobInfo.response.logs.errors.map((message: string, index: number) => (
											<ListItem key={`${index}.${message}`}>
												<ListItemText primary={message} sx={{ pl: 2 }} />
											</ListItem>
										))}
									</React.Fragment>
								)}

								{jobInfo.response !== null && jobInfo.response.logs.warnings.length > 0 && (
									<React.Fragment>
										<ListSubheader sx={{ fontSize: 18, lineHeight: '28px', mt: 2, fontWeight: 500, color: 'black' }}>
											Warnings
										</ListSubheader>

										{jobInfo.response.logs.warnings.map((message: string, index: number) => (
											<ListItem key={`${index}.${message}`}>
												<ListItemText primary={message} sx={{ pl: 2 }} />
											</ListItem>
										))}
									</React.Fragment>
								)}

								{jobInfo.response !== null && jobInfo.response.logs.info.length > 0 && (
									<React.Fragment>
										<ListSubheader sx={{ fontSize: 18, lineHeight: '28px', mt: 2, fontWeight: 500, color: 'black' }}>
											Info
										</ListSubheader>

										{jobInfo.response.logs.info.map((message: string, index: number) => (
											<ListItem key={`${index}.${message}`}>
												<ListItemText primary={message} sx={{ pl: 2 }} />
											</ListItem>
										))}
									</React.Fragment>
								)}
							</React.Fragment>
						)}
					</List>
				)}
			</ContentWrapper>
		</PageWrapper>
	);
}

export default ElectionEditorEntrypoint;
