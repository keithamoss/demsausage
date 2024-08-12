import CloseIcon from '@mui/icons-material/Close';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import { Button, ListItemButton, useTheme } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import { styled } from '@mui/material/styles';
import { groupBy } from 'lodash-es';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';
import { navigateToElection } from '../../../app/routing/navigationHelpers/navigationHelpersMap';
import { Election } from '../../../app/services/elections';
import { mapaThemePrimaryPurple } from '../../../app/ui/theme';
import { getViewForElection, isElectionLive } from '../../elections/electionHelpers';
import { selectAllElections } from '../../elections/electionsSlice';
import { getJurisdictionCrestStandaloneReact } from '../../icons/jurisdictionHelpers';

const StyledInteractableBoxFullHeight = styled(Box)(({ theme }) => ({
	padding: theme.spacing(1),
	overflowY: 'auto',
	height: `90dvh`,
}));

const StyledCloseIconButton = styled(IconButton)(({ theme }) => ({
	position: 'absolute',
	right: '0px',
	marginRight: theme.spacing(1),
	zIndex: theme.zIndex.drawer + 1,
}));

interface Props {
	onToggleDrawer?: (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => void;
}

export default function ElectionsList(props: Props) {
	const { onToggleDrawer } = props;

	const theme = useTheme();

	const navigate = useNavigate();

	const elections = useAppSelector((state) => selectAllElections(state));
	const electionsByYear = groupBy(elections, (e) => new Date(e.election_day).getFullYear());

	const onClickElection = (election: Election) => () => {
		navigateToElection(navigate, election, getViewForElection(election));
	};

	return (
		<StyledInteractableBoxFullHeight
			sx={{ width: 'auto' }}
			role="presentation"
			onClick={onToggleDrawer !== undefined ? onToggleDrawer(false) : undefined}
			onKeyDown={onToggleDrawer !== undefined ? onToggleDrawer(false) : undefined}
		>
			{/* Only show the close button if we're using this in a <Drawer> in LayerSelector */}
			{onToggleDrawer !== undefined && (
				<StyledCloseIconButton
					aria-label="close-elections-list"
					onClick={onToggleDrawer !== undefined ? onToggleDrawer(false) : undefined}
				>
					<CloseIcon sx={{ color: mapaThemePrimaryPurple }} />
				</StyledCloseIconButton>
			)}

			<List
				sx={{
					width: '100%',
					bgcolor: 'background.paper',
					position: 'relative',
					overflow: 'auto',
					'& ul': { padding: 0 },
					// The first subheading doesn't need any top padding
					'& li.MuiListSubheader-root:not(:first-of-type)': { paddingTop: 2 },
					// This was when the "scroll and keep the subheading pinned" code was working. Left for posterity in case we ever revisti to fix that.
					'& li.MuiListSubheader-root': { zIndex: 2 },
					// The first election in each year doesn't need any top padding either
					'& li.MuiListSubheader-root + li.MuiListItem-root': { paddingTop: 0 },
				}}
			>
				{Object.keys(electionsByYear)
					.sort()
					.reverse()
					.map((year: string) => {
						return (
							<React.Fragment key={year}>
								<ListSubheader
									sx={{
										fontSize: 16,
										fontWeight: theme.typography.fontWeightMedium,
										color: theme.palette.text.primary,
									}}
								>
									{year}
								</ListSubheader>

								{electionsByYear[year].map((election) => {
									return (
										<ListItem
											key={election.id}
											secondaryAction={
												isElectionLive(election) === true ? (
													<Button
														startIcon={<LiveTvIcon />}
														aria-label="live election"
														disabled={true}
														sx={{ color: `${theme.palette.secondary.main} !important` }}
													>
														Live
													</Button>
												) : null
											}
										>
											<ListItemAvatar>
												<Avatar
													sx={{
														width: 58,
														height: 58,
														marginRight: 2,
														backgroundColor: 'transparent',
														'& svg': {
															width: 50,
														},
													}}
												>
													{getJurisdictionCrestStandaloneReact(election.jurisdiction)}
												</Avatar>
											</ListItemAvatar>

											<ListItemButton onClick={onClickElection(election)}>
												<ListItemText
													sx={{
														'& .MuiListItemText-primary': {
															fontSize: 15,
															fontWeight: theme.typography.fontWeightMedium,
															color: theme.palette.text.primary,
														},
													}}
													primary={election.name}
													secondary={new Date(election.election_day).toLocaleDateString('en-AU', {
														day: 'numeric',
														month: 'long',
														year: 'numeric',
													})}
												/>
											</ListItemButton>
										</ListItem>
									);
								})}
							</React.Fragment>
						);
					})}
			</List>
		</StyledInteractableBoxFullHeight>
	);
}
