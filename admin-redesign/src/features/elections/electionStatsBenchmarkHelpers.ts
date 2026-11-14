import type { ElectionStatsBenchmark } from '../../app/services/elections';

// Within half a percentage point we call it level rather than ahead or behind
const LEVEL_THRESHOLD_PTS = 0.5;

export type BenchmarkStatus = 'ahead' | 'behind' | 'level';

export const calcBenchmarkDelta = (currentPct: number, benchmarkPct: number) => {
	const delta = Math.round((currentPct - benchmarkPct) * 10) / 10;

	let status: BenchmarkStatus = 'level';
	if (delta > LEVEL_THRESHOLD_PTS) {
		status = 'ahead';
	} else if (delta < -LEVEL_THRESHOLD_PTS) {
		status = 'behind';
	}

	return { delta, status };
};

export const isBenchmarkOk = (
	benchmark: ElectionStatsBenchmark | null | undefined,
): benchmark is Extract<ElectionStatsBenchmark, { error: null }> => benchmark !== null && benchmark !== undefined && benchmark.error === null;
