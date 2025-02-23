import {
	Approval,
	DoNotDisturb,
	Edit,
	EmailOutlined,
	FiberNew,
	Person,
	PunchClockOutlined,
	Storefront,
} from '@mui/icons-material';
import {
	Avatar,
	Card,
	CardContent,
	CardHeader,
	Chip,
	Divider,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import { styled } from '@mui/system';
import dayjs from 'dayjs';
import React from 'react';
import {
	type PendingStall,
	type PollingPlaceWithPendingStall,
	StallStatus,
	StallSubmitterType,
	getStallSubmitterTypeTipOffName,
	getStallTipOffSourceDescriptionFromAdminPOV,
} from '../../../app/services/stalls';
import { mapaThemePrimaryGrey, mapaThemePrimaryPurple } from '../../../app/ui/theme';
import StallSubmitterTypeOwner from '../../../assets/stalls/submit_mystall.svg?react';
import StallSubmitterTypeTipOff from '../../../assets/stalls/submit_tipoff.svg?react';
import { IconsFlexboxHorizontalSummaryRow, supportingIcons } from '../../icons/iconHelpers';
import { doesStallHaveNomsToShowOnOffer, isStallATipOff } from '../../pollingPlaces/pollingPlaceStallsHelpers';
import { getNomsIconsForPendingStall } from '../pendingStallsHelpers';
import PendingStallsPollingPlaceStallFieldListItem from './PendingStallsPollingPlaceStallFieldListItem';
import {
	getWhyApproveAndMergeAutomaticallyNotAllowed,
	isApproveAndMergeAutomaticallyAllowed,
} from './pendingStallsPollingPlaceStallsListHelpers';

const StyledCardContent = styled(CardContent)(() => ({
	paddingBottom: 0,
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

const StyledSectionHeadingDivider = styled(Divider)(({ theme }) => ({
	paddingTop: theme.spacing(1),
	paddingBottom: theme.spacing(1),
}));

const StyledSectionHeadingChip = styled(Chip)(() => ({ fontWeight: 700, color: mapaThemePrimaryGrey }));

type Props = {
	pollingPlace: PollingPlaceWithPendingStall;
	stalls: PendingStall[];
	onApproveAndMergeAutomatically: (stall: PendingStall) => () => void;
	onApproveAndMergeByHand: (stall: PendingStall) => () => void;
	onDecline: (stall: PendingStall) => () => void;
};

export default function PendingStallsPollingPlaceStallsList(props: Props) {
	const { pollingPlace, stalls, onApproveAndMergeAutomatically, onApproveAndMergeByHand, onDecline } = props;

	return (
		<React.Fragment>
			{stalls.map((stall) => (
				<Card
					key={stall.id}
					variant="outlined"
					sx={{
						mt: 2, // To accommodate <PollingPlaceSummaryCardForHeading /> above this element
						mb: 2,
					}}
				>
					<CardHeader
						sx={{
							p: 1,
							pb: 0,
							'& .MuiCardHeader-title': {
								fontSize: 18,
								fontWeight: 700,
							},
						}}
						avatar={
							<Avatar sx={{ bgcolor: mapaThemePrimaryPurple }} variant="rounded">
								<Storefront />
							</Avatar>
						}
						title={`Stall #${stall.id}`}
					/>

					<StyledCardContent sx={{ pt: 1 }}>
						<List dense sx={{ paddingBottom: 0, paddingTop: 0, marginBottom: 0 }}>
							{/* 
              // ######################
              // Stall Summary Panel
              // ###################### 
              */}
							{stall.triaged_on === null && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<FiberNew sx={{ color: mapaThemePrimaryGrey }} />
									</StyledListItemIcon>

									<StyledListItemText primary="New Submission" secondary="This is a brand new submission" />
								</StyledListItem>
							)}

							{stall.triaged_on !== null && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<Edit sx={{ color: mapaThemePrimaryGrey }} />
									</StyledListItemIcon>

									<StyledListItemText
										primary="Edited Submission"
										secondary={`This submission was previously ${stall.previous_status === StallStatus.Approved ? 'approved' : stall.previous_status === StallStatus.Declined ? 'declined' : 'INVALID_STATUS'}`}
									/>
								</StyledListItem>
							)}

							{isStallATipOff(stall) === false && (
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

							{isStallATipOff(stall) === true && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<StallSubmitterTypeTipOff style={{ width: 24, height: 24 }} />
									</StyledListItemIcon>

									<StyledListItemText
										primary={getStallSubmitterTypeTipOffName(stall.submitter_type)}
										secondary={
											stall.tipoff_source !== undefined
												? getStallTipOffSourceDescriptionFromAdminPOV(
														stall.submitter_type,
														stall.tipoff_source,
														stall.tipoff_source_other,
													)
												: 'INVALID_TIPOFF_SOURCE'
										}
										sx={{
											'& .MuiListItemText-secondary:first-letter': { textTransform: 'capitalize' },
										}}
									/>
								</StyledListItem>
							)}
							{/* 
              // ######################
              // Stall Summary Panel (End)
              // ###################### 
              */}

							<StyledSectionHeadingDivider>
								<StyledSectionHeadingChip label="SUBMISSION" />
							</StyledSectionHeadingDivider>

							{/* 
              // ######################
              // Noms Information
              // ###################### 
              */}
							<IconsFlexboxHorizontalSummaryRow>
								{getNomsIconsForPendingStall(stall, false, false)}
							</IconsFlexboxHorizontalSummaryRow>

							{stall.noms.nothing === true && (
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

							{stall.noms.run_out === true && (
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

							{doesStallHaveNomsToShowOnOffer(stall) === true && (
								<PendingStallsPollingPlaceStallFieldListItem fieldName="noms" fieldLabel="On Offer" stall={stall} />
							)}
							{/* 
              // ######################
              // Noms Information (End)
              // ###################### 
              */}

							{/* 
              // ######################
              // Stall Owner Fields
              // ###################### 
              */}
							{stall.submitter_type === StallSubmitterType.Owner && (
								<React.Fragment>
									<PendingStallsPollingPlaceStallFieldListItem fieldName="name" fieldLabel="Stall Name" stall={stall} />

									<PendingStallsPollingPlaceStallFieldListItem
										fieldName="description"
										fieldLabel="Stall Description"
										stall={stall}
									/>

									<PendingStallsPollingPlaceStallFieldListItem
										fieldName="opening_hours"
										fieldLabel="Stall Open"
										stall={stall}
									/>

									<PendingStallsPollingPlaceStallFieldListItem
										fieldName="website"
										fieldLabel="Stall Website"
										stall={stall}
									/>
								</React.Fragment>
							)}
							{/* 
              // ######################
              // Stall Owner Fields (End)
              // ###################### 
              */}

							{/* 
              // ######################
              // Submitter Details Metadata
              // ###################### 
              */}
							<StyledSectionHeadingDivider>
								<StyledSectionHeadingChip label="METADATA" />
							</StyledSectionHeadingDivider>

							<StyledListItem disableGutters>
								<StyledListItemIcon>
									<EmailOutlined sx={{ color: mapaThemePrimaryGrey }} />
								</StyledListItemIcon>

								<StyledListItemText primary="Email" secondary={stall.email} />
							</StyledListItem>

							<StyledListItem disableGutters>
								<StyledListItemIcon>
									<PunchClockOutlined sx={{ color: mapaThemePrimaryGrey }} />
								</StyledListItemIcon>
								<StyledListItemText
									primary="First Submitted On"
									secondary={`${dayjs(stall.reported_timestamp).format('D MMMM YYYY')} at ${dayjs(stall.reported_timestamp).format('HH:mm')}`}
								/>
							</StyledListItem>

							{stall.triaged_by !== null && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<Person sx={{ color: mapaThemePrimaryGrey }} />
									</StyledListItemIcon>

									<StyledListItemText primary={`Last ${stall.previous_status} By`} secondary={stall.triaged_by} />
								</StyledListItem>
							)}

							{stall.owner_edit_timestamp !== null && (
								<StyledListItem disableGutters>
									<StyledListItemIcon>
										<PunchClockOutlined sx={{ color: mapaThemePrimaryGrey }} />
									</StyledListItemIcon>

									<StyledListItemText
										primary="Last Edited On"
										secondary={`${dayjs(stall.owner_edit_timestamp).format('D MMMM YYYY')} at ${dayjs(stall.owner_edit_timestamp).format('HH:mm')}`}
									/>
								</StyledListItem>
							)}
							{/* 
              // ######################
              // Submitter Details Metadata (End)
              // ###################### 
              */}
						</List>

						{/* 
						// ######################
						// Actions
						// ###################### 
						*/}
						<StyledSectionHeadingDivider>
							<StyledSectionHeadingChip label="ACTIONS" />
						</StyledSectionHeadingDivider>

						<List
							sx={{
								pt: 0,
								'& .MuiListItemText-primary': {
									fontWeight: 500,
								},
							}}
							disablePadding
						>
							<ListItem disablePadding>
								<ListItemButton
									onClick={onApproveAndMergeAutomatically(stall)}
									disabled={isApproveAndMergeAutomaticallyAllowed(stall, pollingPlace) === false}
								>
									<ListItemIcon>
										<Approval sx={{ color: mapaThemePrimaryPurple }} />
									</ListItemIcon>

									<ListItemText
										primary="Approve and merge automatically"
										secondary="Approve the submission and automatically apply its changes to the polling place. The submitter is notified."
									/>
								</ListItemButton>
							</ListItem>

							{isApproveAndMergeAutomaticallyAllowed(stall, pollingPlace) === false && (
								<ListItem disablePadding>
									<ListItemButton sx={{ pt: 0 }}>
										<ListItemIcon />

										<ListItemText
											primary="Automatic merging has been disabled"
											secondary={`...because ${getWhyApproveAndMergeAutomaticallyNotAllowed(stall, pollingPlace)}`}
											sx={{ mt: 0 }}
										/>
									</ListItemButton>
								</ListItem>
							)}

							<ListItem disablePadding>
								<ListItemButton onClick={onApproveAndMergeByHand(stall)}>
									<ListItemIcon>
										<Edit sx={{ color: mapaThemePrimaryPurple }} />
									</ListItemIcon>

									<ListItemText
										primary="Approve and merge by hand"
										secondary="Approve the submission, but first you will have manually applied its changes to the polling place. The submitter is notified."
									/>
								</ListItemButton>
							</ListItem>

							<ListItem disablePadding>
								<ListItemButton onClick={onDecline(stall)}>
									<ListItemIcon>
										<DoNotDisturb sx={{ color: mapaThemePrimaryPurple }} />
									</ListItemIcon>

									<ListItemText
										primary="Decline"
										secondary="Decline the submission and don't make any changes to the polling place. The submitter is not notified."
									/>
								</ListItemButton>
							</ListItem>
						</List>
						{/* 
						// ######################
						// Actions (End)
						// ###################### 
						*/}
					</StyledCardContent>
				</Card>
			))}
		</React.Fragment>
	);
}
