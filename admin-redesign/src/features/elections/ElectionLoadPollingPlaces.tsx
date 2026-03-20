import {
	Check,
	Close,
	Error as ErrorIcon,
	HourglassEmpty,
	InfoOutlined,
	InsertDriveFile,
	Numbers,
	Upload,
} from '@mui/icons-material';
import {
	AppBar,
	Button,
	Checkbox,
	FormControlLabel,
	FormGroup,
	IconButton,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Paper,
	TextField,
	Toolbar,
	Typography,
} from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import React, { type ChangeEvent, useEffect, useState } from 'react';
import {
	type Election,
	useGetPollingPlaceLoaderJobInfoQuery,
	useLoadPollingPlaceFileMutation,
} from '../../app/services/elections';
import { DialogWithTransition } from '../../app/ui/dialog';
import LoaderReport, { STAGE_LABELS } from './ElectionLoaderReport';

interface Props {
	election: Election;
	onClose: () => void;
}

export default function ElectionLoadPollingPlaces(props: Props) {
	const { election, onClose } = props;

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
		if (
			isGetJobInfoSuccessful === true &&
			['finished', 'failed', 'stopped', 'canceled', 'cancelled'].includes(jobInfo.status)
		) {
			setIsPollingForJobInfo(false);
		}
	}, [isGetJobInfoSuccessful, jobInfo]);
	// ######################
	// Get Job Info (End)
	// ######################

	return (
		<DialogWithTransition onClose={onClose}>
			<AppBar color="secondary" sx={{ position: 'sticky' }}>
				<Toolbar>
					<IconButton edge="start" color="inherit" onClick={onClose}>
						<Close />
					</IconButton>

					<Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
						Load Polling Place Data
					</Typography>
				</Toolbar>
			</AppBar>

			<Paper elevation={0} sx={{ p: 2 }}>
				<TextField label="JSON config" multiline maxRows={18} fullWidth onChange={onJSONConfigChange} />

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
					<React.Fragment>
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
									{/* Job status chip */}
									<ListItem>
										<ListItemIcon>
											{['finished', 'failed', 'stopped', 'canceled', 'cancelled'].includes(jobInfo.status) ? (
												<InfoOutlined />
											) : (
												<HourglassEmpty />
											)}
										</ListItemIcon>

										<ListItemText primary={`Job status: ${jobInfo.status}`} sx={{ textTransform: 'capitalize' }} />
									</ListItem>

									{/* Live stage ticker — shown while the job is running */}
									{jobInfo.response === null &&
										jobInfo.stages_log !== null &&
										jobInfo.stages_log.length > 0 &&
										jobInfo.stages_log.map((stageName: string) => (
											<ListItem key={stageName}>
												<ListItemIcon>
													<Check color="success" />
												</ListItemIcon>

												<ListItemText
													primary={STAGE_LABELS[stageName] ?? stageName.replaceAll('_', ' ')}
													sx={{ textTransform: 'capitalize' }}
												/>
											</ListItem>
										))}

									{/* Failed job (unhandled exception in the worker) */}
									{jobInfo.status === 'failed' && (
										<ListItem>
											<ListItemIcon>
												<ErrorIcon color="error" />
											</ListItemIcon>

											<ListItemText primary="The loader job failed with an internal error. Check the worker logs for details." />
										</ListItem>
									)}
								</React.Fragment>
							)}
						</List>

						{/* Structured report — rendered once the job finishes with a payload */}
						{isGetJobInfoSuccessful === true &&
							jobInfo !== undefined &&
							jobInfo.response !== null &&
							jobInfo.response.payload !== null && <LoaderReport payload={jobInfo.response.payload} />}
					</React.Fragment>
				)}
			</Paper>
		</DialogWithTransition>
	);
}
