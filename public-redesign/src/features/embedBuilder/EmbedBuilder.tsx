import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
	Alert,
	Box,
	Button,
	Divider,
	FormControl,
	IconButton,
	InputBase,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	SelectChangeEvent,
	Snackbar,
	Typography,
	styled,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAppSelector } from '../../app/hooks';
import { Election } from '../../app/services/elections';
import { getBaseURL } from '../../app/utils';
import { appBarHeight } from '../addStall/addStallHelpers';
import { getDefaultElection } from '../elections/electionHelpers';
import { selectAllElections } from '../elections/electionsSlice';
import {
	getEmbedInteractiveMapHTML,
	getEmbedInteractiveMapURL,
	getEmbedStaticMapImageURL,
} from './embedBuilderHelpers';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	overflowY: 'auto',
	height: `100dvh`,
	padding: theme.spacing(2),
	paddingTop: theme.spacing(4),
	paddingBottom: appBarHeight,
}));

const StyledElectionImage = styled('img')(({ theme }) => ({
	width: '100%',
	marginBottom: theme.spacing(1),
}));

const ElectionEmbedIframeCodePreview = styled('code')(({ theme }) => ({
	whiteSpace: 'pre-wrap',
	display: 'block',
	padding: theme.spacing(2),
	border: '1px solid',
	borderColor: theme.palette.mode === 'light' ? grey[300] : grey[800],
}));

function EmbedBuilderEntrypoint() {
	const elections = useAppSelector((state) => selectAllElections(state));

	if (elections.length === 0) {
		return null;
	}

	return <EmbedBuilder elections={elections} />;
}

interface Props {
	elections: Election[];
}

function EmbedBuilder(props: Props) {
	const { elections } = props;

	const [election, setElection] = useState<Election | undefined>(getDefaultElection(elections));

	const onChooseElection = (e: SelectChangeEvent<number | string>) => {
		const electionId = parseInt(`${e.target.value}`);
		if (Number.isNaN(electionId) === false) {
			const election = elections.find((e) => e.id === electionId);
			if (election !== undefined) {
				setElection(election);
			}
		}
	};

	// ######################
	// Embed Image
	// ######################
	const [isCopyStaticMapImageSnackbarShown, setIsCopyStaticMapImageSnackbarShown] = useState(false);

	const onCopyStaticMapImage = useCallback(async () => {
		if (election === undefined) {
			return;
		}

		try {
			await navigator.clipboard.writeText(getEmbedStaticMapImageURL(election));
			setIsCopyStaticMapImageSnackbarShown(true);
		} catch {
			/* empty */
		}
	}, [election]);

	const onCopyStaticMapImageSnackbarClose = useCallback(() => setIsCopyStaticMapImageSnackbarShown(false), []);
	// ######################
	// Embed Image (End)
	// ######################

	// ######################
	// Embed Interactive Map
	// ######################
	const [precannedMapBbox] = useState<{ name: string; extent: number[] } | undefined>(undefined);

	// const onChoosePrecannedMapBbox = (e: SelectChangeEvent<string>) => {
	// 	const bbox = embedPrecannedMapBboxes.find((v) => v.name === e.target.value);

	// 	if (bbox !== undefined) {
	// 		setPrecannedMapBbox(bbox);
	// 	}
	// };

	const [isCopyInteractiveMapSnackbarShown, setIsCopyInteractiveMapSnackbarShown] = useState(false);

	const onCopyInteractiveMap = useCallback(async () => {
		if (election === undefined) {
			return;
		}

		try {
			await navigator.clipboard.writeText(getEmbedInteractiveMapHTML(election, precannedMapBbox?.extent || undefined));
			setIsCopyInteractiveMapSnackbarShown(true);
		} catch {
			/* empty */
		}
	}, [election, precannedMapBbox?.extent]);

	const onCopyInteractiveMapSnackbarClose = useCallback(() => setIsCopyInteractiveMapSnackbarShown(false), []);
	// ######################
	// Embed Interactive Map (End)
	// ######################

	if (election === undefined) {
		return null;
	}

	return (
		<StyledInteractableBoxFullHeight>
			<Helmet>
				<title>Embed The Map | Democracy Sausage</title>

				{/* Open Graph: Facebook / Twitter */}
				<meta property="og:url" content={`${getBaseURL()}/embed/`} />
				<meta property="og:title" content="Embed The Map | Democracy Sausage" />
			</Helmet>

			<FormControl fullWidth sx={{ mb: 2 }}>
				<InputLabel id="choose-an-election">Choose an election</InputLabel>

				<Select labelId="choose-an-election" value={election.id} label="Choose an election" onChange={onChooseElection}>
					{elections.map((e) => (
						<MenuItem key={e.id} value={e.id}>
							{e.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			<Box sx={{ mb: 2 }}>
				<Typography variant="h6" sx={{ mb: 1 }}>
					Embed an image of the map
				</Typography>

				<StyledElectionImage src={getEmbedStaticMapImageURL(election)} />

				<Paper component="form" sx={{ display: 'flex', alignItems: 'center' }}>
					<InputBase sx={{ ml: 1, flex: 1 }} value={getEmbedStaticMapImageURL(election)} fullWidth />

					<Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

					<IconButton color="secondary" sx={{ p: '10px' }} onClick={onCopyStaticMapImage}>
						<ContentCopyIcon />
					</IconButton>
				</Paper>
			</Box>

			<Box sx={{ mb: 2 }}>
				<Typography variant="h6" sx={{ mb: 1 }}>
					Embed an interactive map
				</Typography>

				{/* <FormControl fullWidth sx={{ mb: 2 }}>
					<InputLabel id="choose-a-default-starting-point">Choose a default starting point</InputLabel>

					<Select
						labelId="choose-a-default-starting-point"
						value={precannedMapBbox?.name || ''}
						label="Choose a default starting point"
						onChange={onChoosePrecannedMapBbox}
					>
						{embedPrecannedMapBboxes.map((state) => (
							<MenuItem key={state.name} value={state.name}>
								{state.name}
							</MenuItem>
						))}
					</Select>
				</FormControl> */}

				<div style={{ height: '472.5px', marginBottom: '8px' }}>
					<iframe
						src={`${getEmbedInteractiveMapURL(election, precannedMapBbox?.extent || undefined)}`}
						title="Democracy Sausage"
						scrolling="no"
						loading="lazy"
						allowFullScreen={true}
						width="100%"
						height="472.5"
						style={{ border: 'none' }}
					/>
				</div>

				<ElectionEmbedIframeCodePreview>
					{getEmbedInteractiveMapHTML(election, precannedMapBbox?.extent || undefined)}
				</ElectionEmbedIframeCodePreview>

				<Button
					variant="contained"
					color="secondary"
					startIcon={<ContentCopyIcon />}
					sx={{ mt: 2 }}
					onClick={onCopyInteractiveMap}
				>
					Copy Code
				</Button>
			</Box>

			<Snackbar
				open={isCopyStaticMapImageSnackbarShown}
				autoHideDuration={6000}
				onClose={onCopyStaticMapImageSnackbarClose}
			>
				<Alert severity="info" variant="filled" sx={{ width: '100%' }}>
					Link copied
				</Alert>
			</Snackbar>

			<Snackbar
				open={isCopyInteractiveMapSnackbarShown}
				autoHideDuration={6000}
				onClose={onCopyInteractiveMapSnackbarClose}
			>
				<Alert severity="info" variant="filled" sx={{ width: '100%' }}>
					Code copied
				</Alert>
			</Snackbar>
		</StyledInteractableBoxFullHeight>
	);
}

export default EmbedBuilderEntrypoint;
