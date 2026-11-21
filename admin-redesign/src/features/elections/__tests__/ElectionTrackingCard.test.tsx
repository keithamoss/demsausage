import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { ElectionStatsBenchmark } from '../../../app/services/elections';
import ElectionTrackingCard from '../ElectionTrackingCard';

const notifications = vi.hoisted(() => ({
	show: vi.fn((_message: ReactNode, _options: { severity: string; autoHideDuration: number }) => 'notice'),
	close: vi.fn(),
}));
const chart = vi.hoisted(() => ({
	svgRef: { current: null as SVGSVGElement | null },
}));

vi.mock('@toolpad/core', () => ({ useNotifications: () => notifications }));

vi.mock('@mui/x-charts', () => ({
	ChartsAxisHighlight: () => <g data-axis-highlight="" />,
	ChartsGrid: () => null,
	ChartsReferenceLine: ({ x }: { x: number }) => <g data-reference-x={x} />,
	ChartsTooltip: () => null,
	ChartsXAxis: () => null,
	ChartsYAxis: () => null,
	LinePlot: () => null,
	ResponsiveChartContainer: ({
		children,
		xAxis,
		yAxis,
	}: {
		children: ReactNode;
		xAxis: { label: string; valueFormatter: (value: number, context: { location: 'tick' | 'tooltip' }) => string }[];
		yAxis: { min: number; max?: number }[];
	}) => (
		<svg
			ref={chart.svgRef}
			data-testid="tracking-chart"
			data-y-min={yAxis[0].min}
			data-y-max={yAxis[0].max ?? 'auto'}
			data-zero-tick={xAxis[0].valueFormatter(0, { location: 'tick' })}
			data-tooltip={xAxis[0].valueFormatter(-10, { location: 'tooltip' })}
			data-one-day-tooltip={xAxis[0].valueFormatter(-1, { location: 'tooltip' })}
			data-election-day-tooltip={xAxis[0].valueFormatter(0, { location: 'tooltip' })}
		>
			<title>Chart</title>
			<text>{xAxis[0].label}</text>
			{children}
		</svg>
	),
	useDrawingArea: () => ({
		left: 0,
		top: 0,
		width: 100,
		height: 100,
		isPointInside: ({ x, y }: { x: number; y: number }) => x >= 0 && x <= 100 && y >= 0 && y <= 100,
	}),
	useSvgRef: () => chart.svgRef,
	useXScale: () => Object.assign((value: number) => value, { invert: (value: number) => value / 100 - 1 }),
	useYScale: () => (value: number) => value,
}));

function clickChart(clientX: number, clientY = 110) {
	const svg = screen.getByTestId('tracking-chart');
	Object.defineProperty(svg, 'getScreenCTM', { configurable: true, value: () => ({ inverse: () => ({}) }) });
	Object.defineProperty(svg, 'createSVGPoint', {
		configurable: true,
		value: () => {
			const point = { x: 0, y: 0, matrixTransform: () => ({ x: (point.x - 20) / 2, y: (point.y - 10) / 2 }) };
			return point;
		},
	});
	fireEvent.click(svg, { clientX, clientY });
}

const benchmark: Exclude<ElectionStatsBenchmark, null | { error: true }> = {
	error: false,
	election_id: 2,
	election_name: 'Previous election',
	current_total: 10,
	total: 20,
	today_days_out: 1,
	is_active: true,
	points: [
		{ days_out: 1, current: 50, current_count: 5, reference: 40, reference_count: 8 },
		{ days_out: 0, current: null, current_count: null, reference: 80, reference_count: 16 },
	],
};

describe('ElectionTrackingCard', () => {
	it('shows a labelled comparison without predicting future reports', () => {
		const { container } = render(<ElectionTrackingCard electionName="This election" benchmark={benchmark} />);

		expect(screen.getByRole('heading', { name: "How we're tracking" })).toBeInTheDocument();
		expect(screen.getByText('Days before election day').closest('svg')).toBe(screen.getByTestId('tracking-chart'));
		expect(screen.queryByRole('table')).not.toBeInTheDocument();
		const todayNote = screen.getByText(/Today's figure only includes reports received so far/);
		const historyNote = screen.getByText(/Past figures use information still held today/);
		expect(todayNote.tagName).toBe('P');
		expect(historyNote.tagName).toBe('P');
		expect(todayNote).not.toBe(historyNote);
		expect(screen.getByText('Today')).toBeInTheDocument();
		expect(
			container.querySelector('svg[data-zero-tick="0"][data-tooltip="10 days before election day"]'),
		).toBeInTheDocument();
		expect(screen.getByTestId('tracking-chart')).toHaveAttribute('data-one-day-tooltip', '1 day before election day');
		expect(screen.getByTestId('tracking-chart')).toHaveAttribute('data-election-day-tooltip', 'Election day');
		expect(container.querySelector('[data-reference-x="-1"]')).toBeInTheDocument();
	});

	it('shows the selected day and both election values when the chart is clicked', () => {
		notifications.show.mockClear();
		notifications.close.mockClear();
		const { container } = render(<ElectionTrackingCard electionName="This election" benchmark={benchmark} />);
		expect(container.querySelector('[data-chart-selection]')).not.toBeInTheDocument();

		clickChart(18);
		expect(notifications.show).not.toHaveBeenCalled();
		expect(container.querySelector('[data-chart-selection]')).not.toBeInTheDocument();
		clickChart(20);
		expect(container.querySelector('[data-reference-x="-1"]')).toBeInTheDocument();
		expect(container.querySelector('[data-chart-selection] line')).not.toBeInTheDocument();
		expect(container.querySelector('[data-axis-highlight] ~ [data-reference-x="-1"]')).toBeInTheDocument();
		expect(container.querySelectorAll('[data-chart-selection] circle')).toHaveLength(2);
		expect(notifications.show).toHaveBeenCalledWith(expect.anything(), { severity: 'success', autoHideDuration: 8000 });
		const firstNotice = notifications.show.mock.calls[0][0];
		const { unmount } = render(firstNotice);
		expect(screen.getByText('1 day before election day')).toBeInTheDocument();
		expect(screen.getByText('This election: 50% (5 of 10)')).toBeInTheDocument();
		expect(screen.getByText('Previous election: 40% (8 of 20)')).toBeInTheDocument();
		unmount();

		clickChart(200);
		expect(notifications.close).toHaveBeenCalledWith('notice');
		expect(container.querySelector('[data-chart-selection] line')).toHaveAttribute('x1', '0');
		expect(container.querySelectorAll('[data-chart-selection] circle')).toHaveLength(1);
		render(notifications.show.mock.calls[1][0]);
		expect(screen.getByText('Election day')).toBeInTheDocument();
		expect(screen.getByText('This election: Not yet available')).toBeInTheDocument();
		expect(screen.getByText('Previous election: 80% (16 of 20)')).toBeInTheDocument();
	});

	it('keeps the same day selected when the timeline changes', () => {
		const { container, rerender } = render(<ElectionTrackingCard electionName="This election" benchmark={benchmark} />);
		clickChart(220);
		expect(container.querySelector('[data-chart-selection] line')).toHaveAttribute('x1', '0');

		rerender(
			<ElectionTrackingCard
				electionName="This election"
				benchmark={{
					...benchmark,
					points: [
						{ days_out: 2, current: 0, current_count: 0, reference: 0, reference_count: 0 },
						...benchmark.points,
					],
				}}
			/>,
		);
		expect(container.querySelector('[data-chart-selection] line')).toHaveAttribute('x1', '0');
	});

	it('reports unavailable chart coordinates without selecting a day', () => {
		notifications.show.mockClear();
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { container } = render(<ElectionTrackingCard electionName="This election" benchmark={benchmark} />);
		const svg = screen.getByTestId('tracking-chart');
		Object.defineProperty(svg, 'getScreenCTM', { configurable: true, value: () => null });
		fireEvent.click(svg, { clientX: 20, clientY: 110 });
		expect(error).toHaveBeenCalledWith('Cannot select a chart day: chart coordinates are unavailable.');
		expect(notifications.show).not.toHaveBeenCalled();
		expect(container.querySelector('[data-chart-selection]')).not.toBeInTheDocument();
		error.mockRestore();
	});

	it('does not mark a different day when the selected day is no longer in the timeline', () => {
		const { container, rerender } = render(<ElectionTrackingCard electionName="This election" benchmark={benchmark} />);
		clickChart(20);
		rerender(
			<ElectionTrackingCard electionName="This election" benchmark={{ ...benchmark, points: [benchmark.points[1]] }} />,
		);
		expect(container.querySelector('[data-chart-selection]')).not.toBeInTheDocument();
	});

	it('explains unavailable comparisons', () => {
		render(<ElectionTrackingCard electionName="This election" benchmark={{ error: true }} />);
		expect(screen.getByText(/couldn't compare this election/)).toBeInTheDocument();
	});

	it('starts at zero and lets the chart scale to either line', () => {
		const { container, rerender } = render(<ElectionTrackingCard electionName="This election" benchmark={benchmark} />);
		expect(container.querySelector('svg[data-y-min="0"][data-y-max="auto"]')).toBeInTheDocument();

		rerender(
			<ElectionTrackingCard
				electionName="This election"
				benchmark={{
					...benchmark,
					points: [{ days_out: 0, current: 0, current_count: 0, reference: 0, reference_count: 0 }],
				}}
			/>,
		);
		expect(container.querySelector('svg[data-y-min="0"][data-y-max="1"]')).toBeInTheDocument();

		rerender(
			<ElectionTrackingCard
				electionName="This election"
				benchmark={{
					...benchmark,
					points: [{ days_out: 0, current: 5, current_count: 1, reference: 0, reference_count: 0 }],
				}}
			/>,
		);
		expect(container.querySelector('svg[data-y-min="0"][data-y-max="auto"]')).toBeInTheDocument();
	});

	it('changes shading when the lines cross and stops shading after today', () => {
		const { container } = render(
			<ElectionTrackingCard
				electionName="This election"
				benchmark={{
					...benchmark,
					points: [
						{ days_out: 2, current: 50, current_count: 5, reference: 40, reference_count: 8 },
						{ days_out: 1, current: 50, current_count: 5, reference: 60, reference_count: 12 },
						{ days_out: 0, current: null, current_count: null, reference: 80, reference_count: 16 },
					],
				}}
			/>,
		);
		const paths = container.querySelectorAll('svg g path');
		expect(paths).toHaveLength(2);
		expect(paths[0]).toHaveAttribute('fill', '#d8c6f4');
		expect(paths[0]).toHaveAttribute('d', 'M -2 50 L -1.5 50 L -1.5 50 L -2 40 Z');
		expect(paths[1]).toHaveAttribute('fill', '#f3d9bb');
		expect(paths[1]).toHaveAttribute('d', 'M -1.5 50 L -1 50 L -1 60 L -1.5 50 Z');
	});

	it('does not describe a completed election as today', () => {
		const { container } = render(
			<ElectionTrackingCard electionName="This election" benchmark={{ ...benchmark, is_active: false }} />,
		);
		expect(screen.queryByText(/Today's figure only includes reports received so far/)).not.toBeInTheDocument();
		expect(screen.getByText(/Past figures use information still held today/)).toBeInTheDocument();
		expect(screen.queryByText('Today')).not.toBeInTheDocument();
		expect(container.querySelector('[data-reference-x]')).not.toBeInTheDocument();
	});

	it('does not add a Today line on election day', () => {
		const { container } = render(
			<ElectionTrackingCard electionName="This election" benchmark={{ ...benchmark, today_days_out: 0 }} />,
		);
		expect(screen.queryByText('Today')).not.toBeInTheDocument();
		expect(container.querySelector('[data-reference-x]')).not.toBeInTheDocument();
	});
});
