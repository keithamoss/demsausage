import { AccessTimeFilled, Description, Edit, Email, FiberNew, Restaurant, Title, Web } from '@mui/icons-material';
import { Card, CardActions, CardContent, List, ListItem, ListItemIcon, ListItemText, styled } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { type PendingStall, getStallSourceDescriptionFromAdminPOV } from '../../app/services/stalls';
import { mapaThemePrimaryGrey } from '../../app/ui/theme';
import StallSubmitterTypeOwner from '../../assets/stalls/submit_mystall.svg?react';
import StallSubmitterTypeTipOff from '../../assets/stalls/submit_tipoff.svg?react';
import { IconsFlexboxHorizontalSummaryRow, supportingIcons } from '../icons/iconHelpers';
import {
	getNomsDescriptiveText,
	isStallWebsiteValid,
	stallHasReportsOfNoms,
} from '../pollingPlaces/pollingPlaceHelpers';
import { isStallATipOff } from '../pollingPlaces/pollingPlaceStallsHelpers';
import { getNomsIconsForPendingStall } from './pendingStallsHelpers';

const StyledCardContent = styled(CardContent)(() => ({
	paddingBottom: 0,
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
	paddingTop: theme.spacing(0.5),
}));

const StyledListItem = styled(ListItem)(() => ({ alignItems: 'start' }));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
	marginTop: theme.spacing(0.25),
	paddingLeft: theme.spacing(1),
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
	marginTop: theme.spacing(0),
	'& .MuiListItemText-primary': {
		color: mapaThemePrimaryGrey,
		fontWeight: 700,
	},
}));

type Props = {
	stalls: PendingStall[];
};

export default function PendingStallsPollingPlaceStallsList(props: Props) {
	const { stalls } = props;

	const navigate = useNavigate();

	console.log(stalls);

	return (
		<React.Fragment>
			{stalls.map((s) => (
				<Card
					key={s.id}
					variant="outlined"
					sx={{
						mt: 2, // To accommodate the getPollingPlaceSummaryCardForHeading() above this element
						mb: 2,
					}}
				>
					<StyledCardContent>
						<IconsFlexboxHorizontalSummaryRow>
							{getNomsIconsForPendingStall(s, false, false)}
						</IconsFlexboxHorizontalSummaryRow>

						<List dense sx={{ paddingBottom: 0, paddingTop: 0, marginBottom: 0 }}>
							{/* 
              // ######################
              // Noms
              // ###################### 
              */}
							{s.noms.nothing === true && (
								<StyledListItem disableGutters>
									<StyledListItemIcon
										sx={{
											'& svg': {
												// 10px larger than the standard MUI SvgIcon size of 24px
												// to account for the padding around our 'circle' icons.
												width: 34,
												height: 34,
												position: 'relative',
												top: '-5px',
												left: '-5px',
											},
										}}
									>
										{supportingIcons.red_cross.icon.react}
									</StyledListItemIcon>

									<StyledListItemText
										primary="Sausageless!"
										secondary="Our roving reporters have informed us that there's no stall here."
									/>
								</StyledListItem>
							)}

							{s.noms.run_out === true && (
								<StyledListItem disableGutters>
									<StyledListItemIcon
										sx={{
											'& svg': {
												// 10px larger than the standard MUI SvgIcon size of 24px
												// to account for the padding around our 'circle' icons.
												width: 34,
												height: 34,
												position: 'relative',
												top: '-5px',
												left: '-5px',
											},
										}}
									>
										{supportingIcons.yellow_minus.icon.react}
									</StyledListItemIcon>

									<StyledListItemText
										primary="Sold out!"
										secondary="Our roving reporters have informed us that they've run out of food here."
									/>
								</StyledListItem>
							)}

							{stallHasReportsOfNoms(s.noms) === true && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<Restaurant sx={{ color: mapaThemePrimaryGrey }} />
									</StyledListItemIcon>

									<StyledListItemText
										primary="On Offer"
										secondary={getNomsDescriptiveText(s.noms)}
										sx={{
											'& .MuiListItemText-secondary:first-letter': { textTransform: 'capitalize' },
										}}
									/>
								</StyledListItem>
							)}
							{/* 
              // ######################
              // Noms (End)
              // ###################### 
              */}

							{/* 
              // ######################
              // Stall Submission Type
              // ###################### 
              */}
							{s.approved_on === null && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<FiberNew sx={{ color: mapaThemePrimaryGrey }} />
									</StyledListItemIcon>

									<StyledListItemText primary="New Submission" secondary="This is a brand new submission" />
								</StyledListItem>
							)}

							{s.approved_on !== null && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<Edit sx={{ color: mapaThemePrimaryGrey }} />
									</StyledListItemIcon>

									<StyledListItemText
										primary="Edited Submission"
										secondary="This submission was previously apprroved"
									/>
								</StyledListItem>
							)}

							{isStallATipOff(s) === true && s.tipoff_source !== undefined && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<StallSubmitterTypeTipOff style={{ width: 24, height: 24 }} />
									</StyledListItemIcon>

									<StyledListItemText
										primary="Tip-off"
										secondary={getStallSourceDescriptionFromAdminPOV(s.tipoff_source, s.tipoff_source_other)}
										sx={{
											'& .MuiListItemText-secondary:first-letter': { textTransform: 'capitalize' },
										}}
									/>
								</StyledListItem>
							)}

							{isStallATipOff(s) === false && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<StallSubmitterTypeOwner style={{ width: 24, height: 24 }} />
									</StyledListItemIcon>

									<StyledListItemText
										primary="Owner Submission"
										secondary="Submitted by someone involved in running the stall"
									/>
								</StyledListItem>
							)}
							{/* 
              // ######################
              // Stall Submission Type (End)
              // ###################### 
              */}

							{/* 
              // ######################
              // Stall Owner Submission
              // ###################### 
              */}
							{s.name !== '' && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<Title sx={{ color: mapaThemePrimaryGrey }} />
									</StyledListItemIcon>

									<StyledListItemText primary="Stall Name" secondary={s.name} />
								</StyledListItem>
							)}

							{s.description !== '' && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<Description sx={{ color: mapaThemePrimaryGrey }} />
									</StyledListItemIcon>

									<StyledListItemText primary="Stall Description" secondary={s.description} />
								</StyledListItem>
							)}

							{s.opening_hours !== '' && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<AccessTimeFilled sx={{ color: mapaThemePrimaryGrey }} />
									</StyledListItemIcon>

									<StyledListItemText primary="Stall Open" secondary={s.opening_hours} />
								</StyledListItem>
							)}

							{isStallWebsiteValid(s.website) && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<Web sx={{ color: mapaThemePrimaryGrey }} />
									</StyledListItemIcon>

									<StyledListItemText
										primary="Stall Website"
										secondary={
											<a href={s.website} target="blank" style={{ color: 'blue' }}>
												{s.website}
											</a>
										}
									/>
								</StyledListItem>
							)}
							{/* 
              // ######################
              // Stall Owner Submission (End)
              // ###################### 
              */}

							{/* 
              // ######################
              // Submitter Details
              // ###################### 
              */}
							<StyledListItem disableGutters>
								<StyledListItemIcon>
									<Email sx={{ color: mapaThemePrimaryGrey }} />
								</StyledListItemIcon>

								<StyledListItemText primary="Email" secondary={s.email} />
							</StyledListItem>
							{/* 
              // ######################
              // Submitter Details (End)
              // ###################### 
              */}
						</List>
					</StyledCardContent>

					<StyledCardActions>
						{/* {countOfNewPendingStalls > 0 && (
							<Button
								size="small"
								variant="contained"
								disabled={true}
								sx={{
									color: 'white !important',
									backgroundColor: '#0389d1 !important',
								}}
							>
								{countOfNewPendingStalls} New {countOfNewPendingStalls > 1 ? 'Subs' : 'Sub'}
							</Button>
						)}

						{countOfEditedPendingStalls > 0 && (
							<Button
								size="small"
								variant="contained"
								disabled={true}
								sx={{
									color: 'white !important',
									backgroundColor: '#0389d1 !important',
								}}
							>
								{countOfEditedPendingStalls} New {countOfEditedPendingStalls > 1 ? 'Edits' : 'Edit'}
							</Button>
						)}

						<Box
							sx={{
								flex: 1,
								justifyContent: 'flex-start',
							}}
						/>

						{pollingPlace.stall === null && (
							<Button
								size="small"
								disabled={true}
								startIcon={<FiberNewOutlined />}
								sx={{
									color: `${blueGrey.A700} !important`,
									ml: '0px !important',
								}}
							>
								First {pollingPlace.pending_stalls.length > 1 ? 'Subs' : 'Sub'}
							</Button>
						)}

						{pollingPlace.stall !== null && (
							<Button
								size="small"
								disabled={true}
								startIcon={getCountOfExistingStallsIcon(pollingPlace.previous_subs_count)}
								sx={{
									color: `${blueGrey.A700} !important`,
									ml: '0px !important',
								}}
							>
								Previous {pollingPlace.previous_subs_count > 1 ? 'Subs' : 'Sub'}
							</Button>
						)} */}
					</StyledCardActions>
				</Card>
			))}
		</React.Fragment>
	);
}
