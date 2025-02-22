import { Avatar, Badge, Box, Fab } from '@mui/material';
import { useState } from 'react';
import type { ElectionPendingStallsGamifiedUserStats } from '../../../app/services/stalls';
import { mapaThemePrimaryPurple } from '../../../app/ui/theme';

interface Props {
	stats: ElectionPendingStallsGamifiedUserStats[];
}

export default function PendingStallsGamifiedUserStatsBar(props: Props) {
	const { stats } = props;

	const userStatsGrandTotal = stats.map((item) => item.total).reduce((sum, item) => sum + item);
	const userStatsSingleUserTotal = stats.map((item) => item.total).reduce((max, item) => (item > max ? item : max));
	const avatarFabDiameter = 36;

	const [activeTooltipId, setActiveTooltipId] = useState<number | undefined>(undefined);

	const onClickFab = (id: number) => () => {
		if (activeTooltipId === id) {
			setActiveTooltipId(undefined);
		} else {
			setActiveTooltipId(id);
		}
	};

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', mt: 1 }}>
			<Box
				sx={{
					width: `${(userStatsSingleUserTotal / userStatsGrandTotal) * 100}%`,
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
				{stats.map((item) => {
					// console.log(item.id, 'is', tooltipsState.includes(item.id));
					return (
						// <Tooltip key={item.id} open={activeTooltipId === item.id} title={`${item.name}: ${item.total}`}>
						<Fab
							key={item.id}
							color="primary"
							sx={{
								position: 'absolute',
								width: avatarFabDiameter,
								height: avatarFabDiameter,
								// Take 3% off to (roughly) accommodate the width of 36px
								left: `${(item.total / userStatsGrandTotal) * 100 - 3}%`,
							}}
							onClick={onClickFab(item.id)}
						>
							<Badge badgeContent={item.total} max={999} color="primary">
								<Avatar src={item.image_url} alt={item.initial} sx={{ width: 24, height: 24 }} />
							</Badge>
						</Fab>
						// </Tooltip>
					);
				})}
			</Box>
		</Box>
	);
}
