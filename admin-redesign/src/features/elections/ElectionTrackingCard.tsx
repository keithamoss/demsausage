import StackedLineChart from '@mui/icons-material/StackedLineChart';
import { AlertTitle, Avatar, Box, Card, CardContent, CardHeader, Typography } from '@mui/material';
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
import type { ElectionStatsBenchmark } from '../../app/services/elections';
import { mapaThemePrimaryPurple } from '../../app/ui/theme';

type Tracking = Extract<ElectionStatsBenchmark, { error: false }>;
type TrackingPoint = Tracking['points'][number];

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
 * Describes how many polling places have data, or says when the figures are unavailable.
 * @param percentage - The percentage with data, or null when it is not available.
 * @param count - The number with data, or null when it is not available.
 * @param total - The total number of active polling places.
 * @returns The percentage and counts, or "Not yet available".
 * @example
 * formatCoverage(50, 5, 10); // "50% (5 of 10)"
 * formatCoverage(null, null, 10); // "Not yet available"
 */
function formatCoverage(percentage: number | null, count: number | null, total: number) {
	return percentage === null ? 'Not yet available' : `${percentage}% (${count} of ${total})`;
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
			const location = svg.createSVGPoint();
			location.x = event.clientX;
			location.y = event.clientY;
			const position = location.matrixTransform(transform.inverse());
			if (!isPointInside(position)) return;

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
	const [selectedDaysOut, setSelectedDaysOut] = useState<number | null>(null);
	const selected = benchmark.points.find((point) => point.days_out === selectedDaysOut);

	return (
		<>
			<Typography variant="body2">
				Percentage of active polling places with data, by days before election day.
			</Typography>
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
 * @param props - The comparison and the current election's name.
 * @param props.benchmark - The comparison figures, or a result saying they are unavailable.
 * @param props.electionName - Name of the current election.
 * @returns The tracking card.
 */
export default function ElectionTrackingCard({
	benchmark,
	electionName,
}: {
	benchmark: Exclude<ElectionStatsBenchmark, null>;
	electionName: string;
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
			<>
				<AlertTitle>{formatDay(point.days_out)}</AlertTitle>
				<div>
					{electionName}: {formatCoverage(point.current, point.current_count, tracking.current_total)}
				</div>
				<div>
					{tracking.election_name}: {formatCoverage(point.reference, point.reference_count, tracking.total)}
				</div>
			</>,
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
						electionName={electionName}
						onSelect={(point) => showPoint(point, benchmark)}
					/>
				)}
			</CardContent>
		</Card>
	);
}
