import { Box, Typography } from '@mui/material';
import { DateTime } from 'luxon';
import type { Election, ElectionStatsBenchmark } from '../../app/services/elections';
import { mapaThemePrimaryPurple } from '../../app/ui/theme';

type Tracking = Extract<ElectionStatsBenchmark, { error: false }>;
type TrackingPoint = Tracking['points'][number];
type ElectionDetails = Pick<Election, 'name' | 'short_name' | 'election_day'>;
type ReferenceElectionDetails = Pick<Election, 'short_name' | 'election_day'>;

/**
 * Formats the selected date on Perth's calendar.
 * @param day - The election date, or null if unavailable; invalid dates are also accepted.
 * @param daysOut - How many days before election day were selected.
 * @returns The selected date in day-month-year form, or "Date unavailable" for a missing or invalid date.
 * @example
 * formatComparisonDate(DateTime.fromISO('2026-01-03', { zone: 'Australia/Perth' }), 1); // "2 Jan 2026"
 * formatComparisonDate(null, 1); // "Date unavailable"
 */
function formatComparisonDate(day: DateTime | null, daysOut: number) {
	return day?.isValid ? day.minus({ days: daysOut }).setLocale('en-AU').toFormat('d LLL yyyy') : 'Date unavailable';
}

/**
 * Prepares labels and figures for the selected comparison day.
 * @param point - Both elections' figures for the selected day.
 * @param tracking - The previous election's name and both polling-place totals.
 * @param election - The current election's name, short name and date.
 * @param referenceElection - The previous election's short name and date, if available.
 * @returns The current and previous election rows. Each row has a key, label, date,
 * percentage, count and total; percentage and count can be null when unavailable.
 * @example
 * const point = { days_out: 1, current: 50, current_count: 5, reference: 40, reference_count: 8 };
 * const tracking = {
 *   error: false, election_id: 2, election_name: 'Election', current_total: 10,
 *   total: 20, today_days_out: 1, is_active: true, points: [point],
 * } satisfies Tracking;
 * const election = { name: 'Current election', short_name: 'Election', election_day: '2022-11-26' };
 * const previous = { short_name: 'Election', election_day: '2022-05-21' };
 * comparisonRows(point, tracking, election, previous).map((row) => row.label);
 * // ["Current · 2022", "Previous · 2022"]
 */
function comparisonRows(
	point: TrackingPoint,
	tracking: Tracking,
	election: ElectionDetails,
	referenceElection?: ReferenceElectionDetails,
) {
	// Use Perth's calendar for both elections, even when timestamps include another time zone.
	const currentDay = DateTime.fromISO(election.election_day, { zone: 'Australia/Perth' });
	const referenceDay = referenceElection
		? DateTime.fromISO(referenceElection.election_day, { zone: 'Australia/Perth' })
		: null;

	// Use election years rather than selected dates, which can fall in the previous year.
	// For elections in the same year, use names or Current/Previous to distinguish them.
	const sameYear = currentDay.isValid && referenceDay?.isValid && currentDay.year === referenceDay.year;
	const currentName = election.short_name || election.name;
	const referenceName = referenceElection?.short_name || tracking.election_name;

	let currentLabel: string;
	let referenceLabel: string;

	if (sameYear && currentName === referenceName) {
		currentLabel = `Current · ${currentDay.year}`;
		referenceLabel = `Previous · ${currentDay.year}`;
	} else if (sameYear) {
		currentLabel = currentName;
		referenceLabel = referenceName;
	} else {
		currentLabel = currentDay.isValid ? `${currentDay.year}` : currentName;
		referenceLabel = referenceDay?.isValid ? `${referenceDay.year}` : referenceName;
	}

	// Pair each election's selected date with its figures for the notice.
	return [
		{
			key: 'current',
			label: currentLabel,
			date: formatComparisonDate(currentDay, point.days_out),
			percentage: point.current,
			count: point.current_count,
			total: tracking.current_total,
		},
		{
			key: 'reference',
			label: referenceLabel,
			date: formatComparisonDate(referenceDay, point.days_out),
			percentage: point.reference,
			count: point.reference_count,
			total: tracking.total,
		},
	] as const;
}

/**
 * Shows the figures for a selected comparison day.
 * @param props - The selected figures, election details, and chart styling.
 * @param props.point - Both elections' figures for the selected day.
 * @param props.tracking - The previous election's name and both polling-place totals.
 * @param props.election - The current election's name, short name and date.
 * @param props.referenceElection - The previous election's short name and date, if available.
 * @param props.dayLabel - The selected day's label.
 * @param props.referenceColor - The colour of the previous election's chart line.
 * @returns The notification content.
 */
export default function TrackingNotice({
	point,
	tracking,
	election,
	referenceElection,
	dayLabel,
	referenceColor,
}: {
	point: TrackingPoint;
	tracking: Tracking;
	election: ElectionDetails;
	referenceElection?: ReferenceElectionDetails;
	dayLabel: string;
	referenceColor: string;
}) {
	const rows = comparisonRows(point, tracking, election, referenceElection);

	// Match the chart's solid and dashed lines so the elections are easy to recognise.
	const styles = {
		current: { color: mapaThemePrimaryPurple, line: 'solid' },
		reference: { color: referenceColor, line: 'dashed' },
	};

	return (
		<>
			<Typography component="div" sx={{ fontWeight: 700, pr: 4 }}>
				{dayLabel}
			</Typography>

			<Typography variant="body2" color="text.secondary">
				Polling places with data
			</Typography>

			<Box
				component="ul"
				// biome-ignore lint/a11y/useSemanticElements: Safari needs a role for lists without markers.
				role="list"
				sx={{ listStyle: 'none', p: 0, m: 0, mt: 2, borderTop: '1px solid', borderColor: 'divider' }}
			>
				{rows.map((row) => (
					<Box
						component="li"
						key={row.key}
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							gap: 1,
							py: 1.5,
							'& + li': { borderTop: '1px solid', borderColor: 'divider' },
						}}
					>
						<Box sx={{ display: 'flex', gap: 1.5, minWidth: 0 }}>
							<Box
								aria-hidden="true"
								sx={{
									width: 24,
									flexShrink: 0,
									mt: 1.25,
									borderTop: `3px ${styles[row.key].line} ${styles[row.key].color}`,
								}}
							/>
							<Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
								<Typography component="div" sx={{ fontWeight: 700 }}>
									{row.label}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{row.date}
								</Typography>
							</Box>
						</Box>
						<Box sx={{ textAlign: 'right', flexShrink: 0 }}>
							{row.percentage === null || row.count === null ? (
								<Typography variant="body2">Not yet available</Typography>
							) : (
								<>
									<Typography
										component="div"
										sx={{ fontWeight: 700, fontSize: '1.2rem', color: styles[row.key].color }}
									>
										{row.percentage}%
									</Typography>
									<Typography variant="body2" color="text.secondary">
										{row.count.toLocaleString('en-AU')} of {row.total.toLocaleString('en-AU')}
									</Typography>
								</>
							)}
						</Box>
					</Box>
				))}
			</Box>

			<Typography variant="caption" color="text.secondary">
				Select another day on the chart to compare
			</Typography>
		</>
	);
}
