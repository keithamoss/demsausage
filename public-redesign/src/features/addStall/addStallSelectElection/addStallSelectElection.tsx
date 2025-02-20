import {
	Avatar,
	Box,
	List,
	ListItem,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	MobileStepper,
	Paper,
	Typography,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks/store';
import { navigateToAddStallSelectPollingPlaceFromElection } from '../../../app/routing/navigationHelpers/navigationHelpersAddStall';
import type { Election } from '../../../app/services/elections';
import { appBarHeight } from '../../../app/ui/theme';
import { selectActiveElectionsSorted } from '../../elections/electionsSlice';
import { getJurisdictionCrestStandaloneReact } from '../../icons/jurisdictionHelpers';
import { getHiddenStepperButton, mobileStepperMinHeight } from '../../stalls/stallFormHelpers';
import AddStallIntroMessage from '../addStallIntroMessage';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'light' ? grey[100] : grey[800],
	// padding: theme.spacing(1),
	overflowY: 'auto',
	height: '100dvh',
	paddingBottom: appBarHeight + mobileStepperMinHeight,
}));

export default function AddStallSelectElection() {
	const navigate = useNavigate();

	const activeElections = useAppSelector((state) => selectActiveElectionsSorted(state));

	const onChooseElection = useCallback(
		(election: Election) => navigateToAddStallSelectPollingPlaceFromElection(navigate, election),
		[navigate],
	);

	return (
		<StyledInteractableBoxFullHeight>
			<AddStallIntroMessage />

			<Paper
				square
				elevation={0}
				sx={{
					display: 'flex',
					alignItems: 'center',
					height: 50,
					pl: 2,
					bgcolor: 'grey.200',
				}}
			>
				<Typography variant="h6">Select Election</Typography>
			</Paper>

			<Box sx={{ width: '100%', p: 2 }}>
				<List>
					{activeElections.map((election) => (
						<ListItem key={election.id} onClick={() => onChooseElection(election)}>
							<ListItemAvatar>
								<Avatar
									sx={{
										width: 58,
										height: 58,
										marginRight: 2,
										backgroundColor: 'transparent',
										// backgroundColor: undefined,
										'& svg': {
											width: 50,
										},
									}}
								>
									{getJurisdictionCrestStandaloneReact(election.jurisdiction)}
								</Avatar>
							</ListItemAvatar>

							<ListItemButton>
								<ListItemText
									// sx={{
									// 	// '& .MuiListItemText-primary': {
									// 	// 	fontSize: 15,
									// 	// 	fontWeight: 700,
									// 	// 	color: mapaThemePrimaryGrey,
									// 	// },
									// }}
									primary={election.name}
								/>
							</ListItemButton>
						</ListItem>
					))}
				</List>
			</Box>

			<MobileStepper
				position="bottom"
				variant="text"
				// So it's the same height as the bars that have a non-disabled and hidden button
				sx={{ minHeight: mobileStepperMinHeight }}
				steps={activeElections.length >= 2 ? 4 : 3}
				activeStep={0}
				backButton={getHiddenStepperButton()}
				nextButton={getHiddenStepperButton()}
			/>
		</StyledInteractableBoxFullHeight>
	);
}
