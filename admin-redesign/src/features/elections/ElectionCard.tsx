import { Card, CardContent, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import type { Election } from '../../app/services/elections';
import { theme } from '../../app/ui/theme';
import { getJurisdictionCrestStandaloneReactAvatar } from '../icons/jurisdictionHelpers';

interface Props {
	election: Election;
}

export default function ElectionCard(props: Props) {
	const { election } = props;

	return (
		<Card variant="outlined" sx={{ mb: 1 }}>
			<CardContent sx={{ p: 1, pb: '8px !important' }}>
				<ListItem sx={{ p: 0 }}>
					<ListItemAvatar>{getJurisdictionCrestStandaloneReactAvatar(election.jurisdiction)}</ListItemAvatar>

					<ListItemText
						sx={{
							'& .MuiListItemText-primary': {
								fontSize: 15,
								fontWeight: theme.typography.fontWeightMedium,
								color: theme.palette.text.primary,
							},
							pl: 2,
							pr: 2,
							pt: 1,
							pb: 1,
						}}
						primary={election.name}
						secondary={new Date(election.election_day).toLocaleDateString('en-AU', {
							day: 'numeric',
							month: 'long',
							year: 'numeric',
						})}
					/>
				</ListItem>
			</CardContent>
		</Card>
	);
}
