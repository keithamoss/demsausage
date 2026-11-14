import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ElectionStatsBenchmark } from '../../../app/services/elections';
import ElectionBenchmarkCallout from '../ElectionBenchmarkCallout';
import { calcBenchmarkDelta } from '../electionStatsBenchmarkHelpers';

const benchmark: ElectionStatsBenchmark = {
	error: null,
	election_id: 2,
	election_name: 'Federal Election 2022',
	days_out: 14,
	pct: 33.4,
	with_data: 2310,
	total: 6916,
};

describe('calcBenchmarkDelta', () => {
	it('classifies ahead, behind and level, treating +/-0.5 pts as level', () => {
		expect(calcBenchmarkDelta(38.3, 33.4)).toEqual({ delta: 4.9, status: 'ahead' });
		expect(calcBenchmarkDelta(19.6, 33.4)).toEqual({ delta: -13.8, status: 'behind' });
		expect(calcBenchmarkDelta(33.9, 33.4).status).toBe('level');
		expect(calcBenchmarkDelta(32.9, 33.4).status).toBe('level');
	});
});

describe('ElectionBenchmarkCallout', () => {
	it('says how far ahead we are', () => {
		render(<ElectionBenchmarkCallout currentPct={38.3} benchmark={benchmark} />);

		expect(screen.getByText('4.9 pts ahead of Federal Election 2022')).toBeInTheDocument();
		expect(screen.getByText('38.3% with data now, vs 33.4% at this point (14 days out)')).toBeInTheDocument();
	});

	it('says how far behind we are', () => {
		render(<ElectionBenchmarkCallout currentPct={19.6} benchmark={benchmark} />);

		expect(screen.getByText('13.8 pts behind Federal Election 2022')).toBeInTheDocument();
	});

	it('says we are level when within half a point', () => {
		render(<ElectionBenchmarkCallout currentPct={33.6} benchmark={benchmark} />);

		expect(screen.getByText('Level with Federal Election 2022')).toBeInTheDocument();
	});

	it('shows a note instead when the benchmark could not be worked out', () => {
		render(<ElectionBenchmarkCallout currentPct={38.3} benchmark={{ error: 'The history looks incomplete.' }} />);

		expect(screen.getByTestId('benchmark-error')).toHaveTextContent('The history looks incomplete.');
		expect(screen.queryByTestId('benchmark-callout')).not.toBeInTheDocument();
	});
});
