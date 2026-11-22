import { fireEvent, render, screen, within } from '@testing-library/react';
import { NotificationsProvider } from '@toolpad/core';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { Election } from '../../../app/services/elections';
import { eJurisdiction } from '../../icons/jurisdictionHelpers';
import ElectionStats from '../ElectionStats';

vi.mock('../../../app/hooks', () => ({ useAppSelector: () => [referenceElection] }));

const chartRef = vi.hoisted(() => ({
	current: null as SVGSVGElement | null,
}));

vi.mock('@mui/x-charts', () => ({
	BarChart: () => null,
	ChartsAxisHighlight: () => null,
	ChartsGrid: () => null,
	ChartsReferenceLine: () => null,
	ChartsTooltip: () => null,
	ChartsXAxis: () => null,
	ChartsYAxis: () => null,
	LinePlot: () => null,
	ResponsiveChartContainer: ({ children }: { children: ReactNode }) => (
		<svg ref={chartRef} data-testid="tracking-chart">
			<title>Chart</title>
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
	useSvgRef: () => chartRef,
	useXScale: () => Object.assign((value: number) => value, { invert: (value: number) => value / 100 - 1 }),
	useYScale: () => (value: number) => value,
}));

const election: Election = {
	id: 1,
	name: 'This election',
	short_name: 'This election',
	name_url_safe: 'this-election',
	election_day: '2026-11-21',
	jurisdiction: eJurisdiction.wa,
	geom: { type: 'Polygon', coordinates: [] },
	is_federal: false,
	is_state: true,
	is_hidden: false,
	is_test: false,
	is_primary: true,
	polling_places_loaded: true,
	analytics_stats_saved: null,
	stats: {
		with_data: 5,
		total: 10,
		benchmark: {
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
		},
		by_source: [],
		subs_by_type_and_day: [],
		subs_by_category: { team_sausage: 0, team_sausage_and_crowdsauced: 0, solely_crowdsauced: 0 },
		triage_actions_by_day: [],
		top_submitters: [],
		noms_changes_by_user: [],
	},
};
const referenceElection: Election = { ...election, id: 2, election_day: '2022-11-25T16:00:00Z' };

describe('Election stats tracking notice', () => {
	it('reserves a separate footer for notices and lets the chart selection change', async () => {
		render(
			<NotificationsProvider>
				<ElectionStats election={election} onClose={() => {}} />
			</NotificationsProvider>,
		);
		const chart = screen.getByRole('heading', { name: "How we're tracking" }).closest('.MuiCard-root');
		const content = chart?.parentElement;

		const svg = screen.getByTestId('tracking-chart');
		Object.defineProperty(svg, 'getScreenCTM', { value: () => ({ inverse: () => ({}) }) });
		Object.defineProperty(svg, 'createSVGPoint', {
			value: () => {
				const point = { x: 0, y: 0, matrixTransform: () => ({ x: point.x, y: point.y }) };
				return point;
			},
		});
		fireEvent.click(svg, { clientX: 100, clientY: 50 });
		const notice = (await screen.findByText('Election day')).closest('.MuiSnackbar-root');
		if (!(notice instanceof HTMLElement)) throw new Error('Tracking notice was not rendered');
		expect(within(notice).getByText('21 Nov 2026')).toBeInTheDocument();
		expect(within(notice).getByText('26 Nov 2022')).toBeInTheDocument();
		expect(within(notice).getByText('80%')).toBeInTheDocument();
		expect(within(notice).getByText('16 of 20')).toBeInTheDocument();
		expect(content?.parentElement).toBe(notice?.parentElement);
		expect(content).toHaveStyle({ overflowY: 'auto', minHeight: '0' });
		expect(notice).toHaveStyle({ position: 'relative', inset: 'auto', transform: 'none', flexShrink: '0' });

		fireEvent.click(svg, { clientX: 0, clientY: 50 });
		expect(await screen.findByText('1 day before election day')).toBeInTheDocument();
		expect(screen.getByText('20 Nov 2026')).toBeInTheDocument();
		expect(screen.getByText('25 Nov 2022')).toBeInTheDocument();
		expect(chart?.querySelectorAll('[data-chart-selection] circle')).toHaveLength(2);
	});
});
