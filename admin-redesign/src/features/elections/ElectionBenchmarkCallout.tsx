import { ArrowDownward, ArrowUpward, TrendingFlat } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import type { ElectionStatsBenchmark } from '../../app/services/elections';
import { calcBenchmarkDelta, isBenchmarkOk } from './electionStatsBenchmarkHelpers';

interface Props {
	currentPct: number;
	benchmark: ElectionStatsBenchmark;
}

const styles = {
	ahead: { Icon: ArrowUpward, color: 'success.dark', bgcolor: 'success.light' },
	behind: { Icon: ArrowDownward, color: 'error.dark', bgcolor: 'error.light' },
	level: { Icon: TrendingFlat, color: 'text.primary', bgcolor: 'action.hover' },
} as const;

const wording = { ahead: 'ahead of', behind: 'behind', level: 'level with' } as const;

// How the current election is tracking against the best previous one at the same number of days out
export default function ElectionBenchmarkCallout(props: Props) {
	const { currentPct, benchmark } = props;

	if (isBenchmarkOk(benchmark) === false) {
		return (
			<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} data-testid="benchmark-error">
				{`We couldn't work out how we're tracking against our best previous election: ${benchmark.error}`}
			</Typography>
		);
	}

	const { delta, status } = calcBenchmarkDelta(currentPct, benchmark.pct);
	const { Icon, color, bgcolor } = styles[status];

	return (
		<Box
			role="status"
			data-testid="benchmark-callout"
			sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, mb: 2, borderRadius: 2, color, bgcolor }}
		>
			<Icon sx={{ fontSize: 32 }} />

			<div>
				<Typography variant="h6" component="p" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
					{status === 'level' ? 'Level with' : `${Math.abs(delta).toFixed(1)} pts ${wording[status]}`} {benchmark.election_name}
				</Typography>

				<Typography variant="body2" sx={{ color: 'text.primary' }}>
					{`${currentPct}% with data now, vs ${benchmark.pct}% at this point (${benchmark.days_out} days out)`}
				</Typography>
			</div>
		</Box>
	);
}
