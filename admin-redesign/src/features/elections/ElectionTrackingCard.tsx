import StackedLineChart from '@mui/icons-material/StackedLineChart';
import { Avatar, Box, Card, CardContent, CardHeader, Typography } from '@mui/material';
import {
	ChartsAxisHighlight,
	ChartsGrid,
	ChartsReferenceLine,
	ChartsTooltip,
	ChartsXAxis,
	ChartsYAxis,
	LinePlot,
	ResponsiveChartContainer,
	useDrawingArea,
	useSvgRef,
	useXScale,
	useYScale,
} from '@mui/x-charts';
import { useNotifications } from '@toolpad/core';
import { useEffect, useRef, useState } from 'react';
import type { Election, ElectionStatsBenchmark } from '../../app/services/elections';
import { mapaThemePrimaryPurple } from '../../app/ui/theme';
import TrackingNotice from './TrackingNotice';

type Tracking = Extract<ElectionStatsBenchmark, { error: false }>;
type TrackingPoint = Tracking['points'][number];
type ElectionDetails = Pick<Election, 'name' | 'short_name' | 'election_day'>;
type ReferenceElectionDetails = Pick<Election, 'short_name' | 'election_day'>;

const referenceColor = '#526372';
const aheadColor = '#d8c6f4';
const behindColor = '#f3d9bb';
const todayColor = '#555';

/**
 * Gives a day a label, such as "Election day" or "1 day before election day".
 * @param daysOut - How many days before election day.
 * @returns The label to show on the chart or in a notice.
 * @example
 * formatDay(0); // "Election day"
 * formatDay(1); // "1 day before election day"
 */
function formatDay(daysOut: number) {
	return daysOut === 0 ? 'Election day' : `${daysOut} ${daysOut === 1 ? 'day' : 'days'} before election day`;
}

/**
 * Lets a click or tap select the nearest day on the chart.
 * MUI Charts v7's built-in handler needs the pointer to move first, so a
 * mobile tap may not work. Use the click position until we upgrade and can
 * check that the built-in handler works on touch devices.
 * @param props - The days to choose from and what to do when one is selected.
 * @param props.points - The daily figures shown on the chart.
 * @param props.onSelect - A function that receives the selected day's figures.
 * @returns Null; this component listens for clicks instead of drawing anything.
 */
function ChartClickHandler({
	points,
	onSelect,
}: { points: Tracking['points']; onSelect: (point: TrackingPoint) => void }) {
	const svgRef = useSvgRef();
	const xScale = useXScale<'linear'>();
	const { isPointInside } = useDrawingArea();

	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) {
			console.error('Cannot attach the chart click handler: chart SVG is unavailable.');
			return;
		}

		/**
		 * Selects the day closest to a click or tap inside the chart.
		 * @param event - Details of where the click happened on the screen.
		 * @returns Nothing.
		 */
		const handleClick = (event: MouseEvent) => {
			const transform = svg.getScreenCTM();
			if (!transform) {
				console.error('Cannot select a chart day: chart coordinates are unavailable.');
				return;
			}

			// Convert the screen position into chart coordinates before checking its bounds.
			const location = svg.createSVGPoint();
			location.x = event.clientX;
			location.y = event.clientY;
			const position = location.matrixTransform(transform.inverse());
			if (!isPointInside(position)) return;

			// Snap to the closest available day, rather than requiring a precise click.
			const daysOut = -xScale.invert(position.x);
			const closest = points.reduce((best, point) =>
				Math.abs(point.days_out - daysOut) < Math.abs(best.days_out - daysOut) ? point : best,
			);
			onSelect(closest);
		};

		svg.addEventListener('click', handleClick);
		return () => svg.removeEventListener('click', handleClick);
	}, [svgRef, xScale, isPointInside, points, onSelect]);

	return null;
}

/**
 * Marks the selected day's figures without hiding the Today line or showing missing data.
 * @param props - The selected day's figures and the position of the Today line.
 * @param props.point - The figures for the selected day.
 * @param props.todayDaysOut - How many days before election day Today is, or null if its line is hidden.
 * @returns The lines and circles that mark the selected day.
 */
function SelectionMarker({
	point,
	todayDaysOut,
}: {
	point: TrackingPoint;
	todayDaysOut: number | null;
}) {
	const xScale = useXScale<'linear'>();
	const yScale = useYScale<'linear'>();
	const { top, height } = useDrawingArea();

	return (
		<g data-chart-selection="" pointerEvents="none">
			{point.days_out !== todayDaysOut && (
				<line x1={xScale(-point.days_out)} x2={xScale(-point.days_out)} y1={top} y2={top + height} stroke="#777" />
			)}
			<circle
				cx={xScale(-point.days_out)}
				cy={yScale(point.reference)}
				r={5}
				fill="white"
				stroke={referenceColor}
				strokeWidth={2}
			/>
			{point.current !== null && (
				<circle cx={xScale(-point.days_out)} cy={yScale(point.current)} r={3} fill={mapaThemePrimaryPurple} />
			)}
		</g>
	);
}

type SegmentPoint = { svgX: number; currentPercentage: number; referencePercentage: number };

/**
 * Finds where the two lines cross between two days, when one election moves ahead of the other.
 * @param start - The first day's horizontal chart position and both percentages.
 * @param end - The next day's horizontal chart position and both percentages.
 * @returns Where the lines cross on the chart and the percentage they share there.
 * @example
 * findCrossing(
 *   { svgX: 0, currentPercentage: 40, referencePercentage: 60 },
 *   { svgX: 10, currentPercentage: 60, referencePercentage: 40 },
 * ); // { svgX: 5, currentPercentage: 50, referencePercentage: 50 }
 */
function findCrossing(start: SegmentPoint, end: SegmentPoint): SegmentPoint {
	const startGap = start.currentPercentage - start.referencePercentage;
	const endGap = end.currentPercentage - end.referencePercentage;

	// Interpolate between the days in proportion to the size of their gaps.
	const fraction = Math.abs(startGap) / (Math.abs(startGap) + Math.abs(endGap));
	const percentage = start.currentPercentage + (end.currentPercentage - start.currentPercentage) * fraction;

	return {
		svgX: start.svgX + (end.svgX - start.svgX) * fraction,
		currentPercentage: percentage,
		referencePercentage: percentage,
	};
}

/**
 * Shades the space between the lines, using a different colour for ahead and behind.
 * @param props - The figures used to draw the shading.
 * @param props.points - The daily figures, ordered from earliest to latest.
 * @returns The shaded areas between days with current-election figures.
 */
function DifferenceArea({ points }: { points: Tracking['points'] }) {
	const xScale = useXScale<'linear'>();
	const yScale = useYScale<'linear'>();

	return (
		<g>
			{points.slice(1).flatMap((point, index) => {
				const previous = points[index];

				// Without current-election data for both days, there is no gap to shade.
				if (previous.current === null || point.current === null) return [];

				// Turn each day into a chart position and a pair of percentages.
				const start = {
					svgX: xScale(-previous.days_out),
					currentPercentage: previous.current,
					referencePercentage: previous.reference,
				};
				const end = {
					svgX: xScale(-point.days_out),
					currentPercentage: point.current,
					referencePercentage: point.reference,
				};

				// The sign of the gap tells us which election is ahead.
				const startGap = start.currentPercentage - start.referencePercentage;
				const endGap = end.currentPercentage - end.referencePercentage;

				/**
				 * Draws one piece of the shaded gap between the lines.
				 * @param from - Where the piece starts on the chart and the percentages there.
				 * @param to - Where the piece ends on the chart and the percentages there.
				 * @param ahead - Whether the current election is ahead in this piece.
				 * @returns A shape coloured to show whether the current election is ahead or behind.
				 */
				const segment = (from: SegmentPoint, to: SegmentPoint, ahead: boolean) => (
					<path
						key={`${point.days_out}-${from.svgX}`}
						d={`M ${from.svgX} ${yScale(from.currentPercentage)} L ${to.svgX} ${yScale(to.currentPercentage)} L ${to.svgX} ${yScale(to.referencePercentage)} L ${from.svgX} ${yScale(from.referencePercentage)} Z`}
						fill={ahead ? aheadColor : behindColor}
					/>
				);

				if (startGap * endGap < 0) {
					// Split the shading at the crossing so each side gets the right colour.
					const crossing = findCrossing(start, end);
					return [segment(start, crossing, startGap > 0), segment(crossing, end, endGap > 0)];
				}
				return [segment(start, end, startGap + endGap >= 0)];
			})}
		</g>
	);
}

/**
 * Shows the comparison chart, what its colours and lines mean, and its limits.
 * @param props - The comparison figures, election name and what to do when a day is selected.
 * @param props.benchmark - The daily figures and details of the previous election.
 * @param props.electionName - Name of the current election.
 * @param props.onSelect - A function that receives the figures for a selected day.
 * @returns The chart and its explanatory text.
 */
function TrackingChart({
	benchmark,
	electionName,
	onSelect,
}: {
	benchmark: Tracking;
	electionName: string;
	onSelect: (point: TrackingPoint) => void;
}) {
	const showTodayMarker = benchmark.is_active && benchmark.today_days_out > 0;

	// Store the day, not its array position, so it remains selected if the timeline changes.
	const [selectedDaysOut, setSelectedDaysOut] = useState<number | null>(null);
	const selected = benchmark.points.find((point) => point.days_out === selectedDaysOut);

	return (
		<>
			<Typography variant="body2">
				Percentage of active polling places with data, by days before election day.
			</Typography>

			{/* Different line styles distinguish the elections without relying on colour alone. */}
			<Box
				component="ul"
				// biome-ignore lint/a11y/useSemanticElements: Safari needs a role for flex lists without markers.
				role="list"
				sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, listStyle: 'none', p: 0, m: 0, mt: 2 }}
			>
				{[
					{ key: 'current', label: electionName, border: `3px solid ${mapaThemePrimaryPurple}` },
					{ key: 'reference', label: benchmark.election_name, border: `3px dashed ${referenceColor}` },
				].map(({ key, label, border }) => (
					<Box component="li" key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Box aria-hidden="true" sx={{ width: 24, flexShrink: 0, borderTop: border }} />
						<Typography variant="body2">{label}</Typography>
					</Box>
				))}
			</Box>

			{/* The shading key and Today marker explain the chart's additional cues. */}
			<Box
				component="ul"
				// biome-ignore lint/a11y/useSemanticElements: Safari needs a role for flex lists without markers.
				role="list"
				sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, listStyle: 'none', p: 0, m: 0, mt: 1 }}
			>
				{[
					{ label: 'Ahead', color: aheadColor },
					{ label: 'Behind', color: behindColor },
				].map(({ label, color }) => (
					<Box component="li" key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Box aria-hidden="true" sx={{ width: 24, height: 12, flexShrink: 0, bgcolor: color }} />
						<Typography variant="body2">{label}</Typography>
					</Box>
				))}
				{showTodayMarker && (
					<Box component="li" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
						<Box aria-hidden="true" sx={{ width: 24, height: 16, display: 'flex', justifyContent: 'center' }}>
							<Box sx={{ borderLeft: `2px dashed ${todayColor}` }} />
						</Box>
						<Typography variant="body2">Today</Typography>
					</Box>
				)}
			</Box>

			<Box sx={{ width: 'calc(100% + 24px)', ml: '-12px', aspectRatio: '1.4', maxHeight: 400, mt: 2 }}>
				<ResponsiveChartContainer
					series={[
						{
							type: 'line',
							id: 'current',
							label: electionName,
							data: benchmark.points.map((point) => point.current),
							color: mapaThemePrimaryPurple,
							curve: 'linear',
							showMark: false,
						},
						{
							type: 'line',
							id: 'reference',
							label: benchmark.election_name,
							data: benchmark.points.map((point) => point.reference),
							color: referenceColor,
							curve: 'linear',
							showMark: false,
						},
					]}
					xAxis={[
						{
							scaleType: 'linear',
							label: 'Days before election day',
							// Negate days out so earlier days appear on the left.
							data: benchmark.points.map((point) => -point.days_out),
							min: -benchmark.points[0].days_out,
							max: 0,
							valueFormatter: (value: number, context) =>
								context.location === 'tick' ? `${-value}` : formatDay(-value),
						},
					]}
					yAxis={[
						{
							min: 0,
							max: benchmark.points.some((point) => point.reference > 0 || (point.current ?? 0) > 0) ? undefined : 1,
							valueFormatter: (value: number) => `${value}%`,
						},
					]}
					margin={{ left: 55, right: 25, top: 20, bottom: 50 }}
					sx={{
						'& .MuiLineElement-series-reference': { strokeDasharray: '8 6' },
						'&&': { touchAction: 'auto' },
					}}
				>
					<ChartsGrid horizontal />
					{/* Keep the shading behind the lines and selection markers. */}
					<DifferenceArea points={benchmark.points} />
					<LinePlot skipAnimation />
					<ChartsAxisHighlight x="line" />
					{showTodayMarker && (
						<ChartsReferenceLine
							x={-benchmark.today_days_out}
							lineStyle={{ stroke: todayColor, strokeDasharray: '4 4' }}
						/>
					)}
					{selected && (
						<SelectionMarker point={selected} todayDaysOut={showTodayMarker ? benchmark.today_days_out : null} />
					)}
					<ChartClickHandler
						points={benchmark.points}
						onSelect={(point) => {
							setSelectedDaysOut(point.days_out);
							onSelect(point);
						}}
					/>
					<ChartsXAxis />
					<ChartsYAxis />
					<ChartsTooltip trigger="axis" />
				</ResponsiveChartContainer>
			</Box>

			{benchmark.is_active && (
				<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
					Today's figure includes all reports received so far. The previous election's figure includes reports from the
					whole corresponding day.
				</Typography>
			)}

			<Typography variant="body2" color="text.secondary" sx={{ mt: benchmark.is_active ? 1 : 2 }}>
				Past figures use information still held today. They don't reflect deleted reports or changes to polling places.
			</Typography>
		</>
	);
}

/**
 * Shows the comparison card, or explains when the comparison is unavailable.
 * @param props - The comparison and election details.
 * @param props.benchmark - The comparison figures, or a result saying they are unavailable.
 * @param props.election - The current election's name, short name and date.
 * @param props.referenceElection - The previous election's short name and date, if available.
 * @returns The tracking card.
 */
export default function ElectionTrackingCard({
	benchmark,
	election,
	referenceElection,
}: {
	benchmark: Exclude<ElectionStatsBenchmark, null>;
	election: ElectionDetails;
	referenceElection?: ReferenceElectionDetails;
}) {
	const notifications = useNotifications();
	const previousNotification = useRef<string>();

	/**
	 * Replaces the previous notice with figures for the selected day.
	 * @param point - Both elections' figures for the selected day.
	 * @param tracking - The previous election's name and both polling-place totals.
	 * @returns Nothing.
	 */
	const showPoint = (point: TrackingPoint, tracking: Tracking) => {
		if (previousNotification.current) notifications.close(previousNotification.current);

		previousNotification.current = notifications.show(
			<TrackingNotice
				point={point}
				tracking={tracking}
				election={election}
				referenceElection={referenceElection}
				dayLabel={formatDay(point.days_out)}
				referenceColor={referenceColor}
			/>,
			{ severity: 'success', autoHideDuration: 8000 },
		);
	};

	return (
		<Card variant="outlined" sx={{ mt: 3 }}>
			<CardHeader
				sx={{ p: 1, pb: 0, '& .MuiCardHeader-title': { fontSize: 18, fontWeight: 700 } }}
				avatar={
					<Avatar sx={{ bgcolor: mapaThemePrimaryPurple }} variant="rounded">
						<StackedLineChart />
					</Avatar>
				}
				title="How we're tracking"
				slotProps={{ title: { component: 'h2' } }}
			/>
			<CardContent>
				{benchmark.error ? (
					<Typography>
						We couldn't compare this election with a previous one. There may be no suitable election or some reporting
						dates may be missing.
					</Typography>
				) : (
					<TrackingChart
						benchmark={benchmark}
						electionName={election.name}
						onSelect={(point) => showPoint(point, benchmark)}
					/>
				)}
			</CardContent>
		</Card>
	);
}
