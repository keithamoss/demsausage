import { Box, Typography } from '@mui/material';

interface LegendItemProps {
	color: string;
	label: string;
}

function LegendItem(props: LegendItemProps) {
	const { color, label } = props;

	return (
		<Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
			<Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color }} />
			<Typography variant="caption" color="text.secondary">
				{label}
			</Typography>
		</Box>
	);
}

interface Props {
	taskMppColor: string;
	attachedPpColor: string;
	nearbyMppColor: string;
}

export default function MetaPollingPlaceLocationLegend(props: Props) {
	const { taskMppColor, attachedPpColor, nearbyMppColor } = props;

	return (
		<Box sx={{ mt: 1 }}>
			<Typography variant="caption" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
				Map key
			</Typography>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
				<LegendItem color={taskMppColor} label="This MPP" />
				<LegendItem color={attachedPpColor} label="Attached polling places" />
				<LegendItem color={nearbyMppColor} label="Nearby MPPs" />
			</Box>
		</Box>
	);
}
