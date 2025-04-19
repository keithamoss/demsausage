import { Campaign, Casino, Radar } from '@mui/icons-material';
import {
	Alert,
	Card,
	CardContent,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	type SxProps,
	styled,
	useTheme,
} from '@mui/material';
import { mapaThemePrimaryGrey } from '../../../app/ui/theme';
import { pluralise } from '../../../app/utils';
import { supportingIcons } from '../../icons/iconHelpers';
import { getSausageChanceLabel } from '../../pollingPlaces/pollingPlaceHelpers';
import type {
	IMetaPollingPlace,
	IPollingPlaceAttachedToMetaPollingPlace,
} from '../interfaces/metaPollingPlaceInterfaces';

const StyledCardContent = styled(CardContent)(({ theme }) => ({
	padding: theme.spacing(1),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({ paddingLeft: theme.spacing(1) }));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
	marginTop: theme.spacing(0.25),
	paddingLeft: theme.spacing(1),
}));

interface Props {
	metaPollingPlace: IMetaPollingPlace;
	pollingPlaceForActiveElection?: IPollingPlaceAttachedToMetaPollingPlace;
	cardSxProps: SxProps;
}

function MetaPollingPlaceHistorySummaryCard(props: Props) {
	const { cardSxProps, pollingPlaceForActiveElection, metaPollingPlace } = props;

	const theme = useTheme();

	if (pollingPlaceForActiveElection === undefined) {
		return null;
	}

	return (
		<Card variant="outlined" sx={cardSxProps}>
			<CardContent sx={{ pb: `${theme.spacing(2)} !important` }}>
				{pollingPlaceForActiveElection !== undefined && pollingPlaceForActiveElection.stall !== null && (
					<Alert severity="success" icon={<Radar />} sx={{ mb: 1 }}>
						This polling place already has some stall data.
					</Alert>
				)}

				<List dense sx={{ pt: 0, pb: 0 }}>
					<StyledListItem>
						<StyledListItemIcon>
							<Casino sx={{ color: mapaThemePrimaryGrey }} />
						</StyledListItemIcon>

						<ListItemText
							primary={`${getSausageChanceLabel(pollingPlaceForActiveElection.chance_of_sausage)} chance of sausage`}
						/>
					</StyledListItem>

					{pollingPlaceForActiveElection.chance_of_sausage_stats.count_of_previous_reports_with_noms !== undefined && (
						<StyledListItem>
							<StyledListItemIcon>
								<Campaign sx={{ color: mapaThemePrimaryGrey }} />
							</StyledListItemIcon>

							<ListItemText
								primary={`${pollingPlaceForActiveElection.chance_of_sausage_stats.count_of_previous_reports_with_noms} previous ${pluralise('report', pollingPlaceForActiveElection.chance_of_sausage_stats.count_of_previous_reports_with_noms)} of noms`}
							/>
						</StyledListItem>
					)}

					{pollingPlaceForActiveElection.chance_of_sausage_stats.count_of_previous_reports_with_rcos !== undefined && (
						<StyledListItem>
							<StyledListItemIcon>
								{/* <FiberNew sx={{ color: mapaThemePrimaryGrey }} /> */}
								{supportingIcons.red_cross.icon.react}
							</StyledListItemIcon>

							<ListItemText
								primary={`${pollingPlaceForActiveElection.chance_of_sausage_stats.count_of_previous_reports_with_rcos} previous ${pluralise('report', pollingPlaceForActiveElection.chance_of_sausage_stats.count_of_previous_reports_with_rcos)} of Red Cross of Shame`}
							/>
						</StyledListItem>
					)}
				</List>
			</CardContent>
		</Card>
	);
}

export default MetaPollingPlaceHistorySummaryCard;
