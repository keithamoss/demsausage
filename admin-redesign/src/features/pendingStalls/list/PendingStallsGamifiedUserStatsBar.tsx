import { Avatar, Badge, Box, Fab } from '@mui/material';
import type { ElectionPendingStallsGamifiedUserStats } from '../../../app/services/stalls';
import { mapaThemePrimaryPurple } from '../../../app/ui/theme';

interface Props {
	stats: ElectionPendingStallsGamifiedUserStats[];
}

export default function PendingStallsGamifiedUserStatsBar(props: Props) {
	const { stats } = props;

	if (stats.length === 0) {
		return undefined;
	}

	const userStatsGrandTotal = stats.map((item) => item.total).reduce((sum, item) => sum + item);
	const userStatsSingleUserTotal = stats.map((item) => item.total).reduce((max, item) => (item > max ? item : max));
	const avatarFabDiameter = 36;
	const maxPctWidth = 88;

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', mt: 0.5, ml: 1, pt: 1 }}>
			<Box
				sx={{
					width: `${Math.min(maxPctWidth, (userStatsSingleUserTotal / userStatsGrandTotal) * 100)}%`,
					height: 10,
					mt: `${(avatarFabDiameter - 10) / 2}px`,
					mb: `${(avatarFabDiameter - 10) / 2}px`,
					backgroundColor: mapaThemePrimaryPurple,
				}}
			/>

			<Box
				sx={{
					backgroundColor: 'orange',
					position: 'absolute',
					width: '100%',
					top: 0,
				}}
			>
				{stats.map((item) => (
					<Fab
						key={item.id}
						color="primary"
						sx={{
							position: 'absolute',
							width: avatarFabDiameter,
							height: avatarFabDiameter,
							// Take 3% off to (roughly) accommodate the width of 36px
							left: `${Math.max(0, Math.min(maxPctWidth, (item.total / userStatsGrandTotal) * 100 - 2))}%`,
							marginLeft: '-5px',
						}}
					>
						<Badge badgeContent={item.total} max={999} color="primary">
							<Avatar src={item.image_url} alt={item.initials} sx={{ width: 24, height: 24 }} />
						</Badge>
					</Fab>
				))}
			</Box>
		</Box>
	);
}
