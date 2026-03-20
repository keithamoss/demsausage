/**
 * ElectionLoaderReport
 *
 * Renders the structured Phase 2 loader payload.
 * Covers Phase 3 steps: outcome banner, stage accordion, type-driven entry renderers,
 * and action callouts.
 */

import { CheckCircle, ExpandMore, Warning as WarningIcon } from '@mui/icons-material';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Alert,
	Box,
	Button,
	Chip,
	Collapse,
	Divider,
	List,
	ListItem,
	ListItemText,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableRow,
	Typography,
} from '@mui/material';
import { useState } from 'react';
import type {
	ILoaderLogEntry,
	ILoaderLogEntryDedupDiscard,
	ILoaderLogEntryDedupMerge,
	ILoaderLogEntryEcIdDuplicate,
	ILoaderLogEntryFindHomeDivisionError,
	ILoaderLogEntryGeocodeSkip,
	ILoaderLogEntryMigrateStats,
	ILoaderLogEntryMppNotFound,
	ILoaderLogEntryNomsMergeReview,
	ILoaderLogEntrySpatialProximity,
	ILoaderLogEntryStallMatched,
	ILoaderLogEntryStallMultiMatch,
	ILoaderLogEntryStallNoMatch,
	ILoaderLogEntryText,
	ILoaderLogEntryValidationError,
	ILoaderPayload,
	ILoaderStage,
	IPollingPlaceRef,
	StageOutcome,
} from './loaderTypes';

// ──────────────────────────────────────────────────────────
// Stage label map (mirrors Python STAGE_LABELS in loader.py)
// ──────────────────────────────────────────────────────────

export const STAGE_LABELS: Record<string, string> = {
	_config: 'Config Validation',
	convert_to_demsausage_schema: 'Convert to Schema',
	check_file_validity: 'File Validity',
	fix_polling_places: 'Field Fixers',
	prepare_polling_places: 'Prepare Polling Places',
	geocode_missing_locations: 'Geocoding',
	check_polling_place_validity: 'Polling Place Validity',
	dedupe_polling_places: 'Deduplication',
	write_draft_polling_places: 'Write Draft',
	migrate_unofficial_pending_stalls: 'Unofficial Stall Migration',
	migrate_noms: 'Noms Migration',
	migrate_mpps: 'Meta Polling Place Migration',
	migrate: 'Migration',
	detect_facility_type: 'Facility Type Detection',
	calculate_chance_of_sausage: 'Chance of Sausage',
	cleanup: 'Cleanup',
};

// ──────────────────────────────────────────────────────────
// Utilities
// ──────────────────────────────────────────────────────────

const MAX_VISIBLE_ENTRIES = 20;

function formatDuration(seconds: number): string {
	if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
	return `${seconds.toFixed(1)}s`;
}

function formatRunAt(isoString: string): string {
	try {
		return new Date(isoString).toLocaleString();
	} catch {
		return isoString;
	}
}

function outcomeColor(outcome: StageOutcome): 'success' | 'warning' | 'error' | 'default' {
	switch (outcome) {
		case 'ok':
			return 'success';
		case 'warning':
			return 'warning';
		case 'error':
			return 'error';
		case 'skipped':
			return 'default';
	}
}

function outcomeLabel(outcome: StageOutcome): string {
	switch (outcome) {
		case 'ok':
			return 'OK';
		case 'warning':
			return 'Warning';
		case 'error':
			return 'Error';
		case 'skipped':
			return 'Skipped';
	}
}

// ──────────────────────────────────────────────────────────
// Action callout — amber alert for entries with action field
// ──────────────────────────────────────────────────────────

function ActionCallout({ action }: { action: string }) {
	return (
		<Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 1, mb: 0.5 }}>
			<strong>Action required:</strong> {action}
		</Alert>
	);
}

// ──────────────────────────────────────────────────────────
// Shared collapsible polling-place reference list
// ──────────────────────────────────────────────────────────

function PollingPlaceRefList({ places, label = 'polling places' }: { places: IPollingPlaceRef[]; label?: string }) {
	const [expanded, setExpanded] = useState(false);

	if (places.length === 0) {
		return (
			<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
				No nearby polling places found.
			</Typography>
		);
	}

	return (
		<Box>
			<Button size="small" sx={{ mt: 0.5 }} onClick={() => setExpanded((e) => !e)}>
				{expanded ? 'Hide' : `Show ${places.length} ${label}`}
			</Button>
			<Collapse in={expanded}>
				<List dense disablePadding sx={{ pl: 1 }}>
					{places.map((pp) => (
						<ListItem key={`${pp.name}::${pp.premises}`} disablePadding>
							<ListItemText
								primary={`${pp.name} — ${pp.premises}`}
								secondary={`${pp.address}${pp.distance_m !== undefined ? ` (${Math.round(pp.distance_m)}m away)` : ''}`}
							/>
						</ListItem>
					))}
				</List>
			</Collapse>
		</Box>
	);
}

// ──────────────────────────────────────────────────────────
// Side-by-side comparison card (stall_matched / noms_merge_review)
// ──────────────────────────────────────────────────────────

function ComparisonCard({
	userLabel,
	user,
	officialLabel,
	official,
}: {
	userLabel: string;
	user: { name: string; address: string };
	officialLabel: string;
	official: { name: string; address: string };
}) {
	return (
		<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 0.5 }}>
			<Box
				sx={{
					flex: 1,
					border: '1px solid',
					borderColor: 'warning.light',
					borderRadius: 1,
					p: 1,
					bgcolor: 'warning.50',
				}}
			>
				<Typography variant="caption" color="text.secondary">
					{userLabel}
				</Typography>
				<Typography variant="body2">
					<strong>{user.name}</strong>
				</Typography>
				<Typography variant="body2">{user.address}</Typography>
			</Box>
			<Box
				sx={{
					flex: 1,
					border: '1px solid',
					borderColor: 'success.light',
					borderRadius: 1,
					p: 1,
					bgcolor: 'success.50',
				}}
			>
				<Typography variant="caption" color="text.secondary">
					{officialLabel}
				</Typography>
				<Typography variant="body2">
					<strong>{official.name}</strong>
				</Typography>
				<Typography variant="body2">{official.address}</Typography>
			</Box>
		</Stack>
	);
}

// ──────────────────────────────────────────────────────────
// Individual log-entry renderers (discriminated on type)
// ──────────────────────────────────────────────────────────

function TextEntry({ entry }: { entry: ILoaderLogEntryText }) {
	return (
		<Box>
			<Typography variant="body2">{entry.message}</Typography>
			{entry.action && <ActionCallout action={entry.action} />}
		</Box>
	);
}

function ValidationErrorEntry({ entry }: { entry: ILoaderLogEntryValidationError }) {
	return (
		<Box>
			<Typography variant="body2" gutterBottom>
				<strong>{entry.name}</strong>
				{entry.premises && ` — ${entry.premises}`}
			</Typography>
			<Table size="small">
				<TableBody>
					{entry.fields.map((f) => (
						<TableRow key={f.field}>
							<TableCell sx={{ fontWeight: 500, whiteSpace: 'nowrap', verticalAlign: 'top', pl: 0 }}>
								{f.field}
							</TableCell>
							<TableCell sx={{ pr: 0 }}>{f.messages.join('; ')}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			{entry.action && <ActionCallout action={entry.action} />}
		</Box>
	);
}

function GeocodeSkipEntry({ entry }: { entry: ILoaderLogEntryGeocodeSkip }) {
	const [showRaw, setShowRaw] = useState(false);
	const reasonLabel = entry.reason === 'no_results' ? 'No results' : 'Not accurate enough';

	return (
		<Box>
			<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
				<Typography variant="body2">
					{entry.premises} — {entry.address}
				</Typography>
				<Chip label={reasonLabel} size="small" color="warning" variant="outlined" />
			</Stack>
			{entry.geocode_result !== undefined && (
				<>
					<Button size="small" sx={{ mt: 0.5 }} onClick={() => setShowRaw((r) => !r)}>
						{showRaw ? 'Hide raw result' : 'Show raw geocode result'}
					</Button>
					<Collapse in={showRaw}>
						<Box
							component="pre"
							sx={{ fontSize: '0.7rem', overflowX: 'auto', bgcolor: 'grey.100', p: 1, borderRadius: 1, mt: 0.5 }}
						>
							{JSON.stringify(entry.geocode_result, null, 2)}
						</Box>
					</Collapse>
				</>
			)}
			{entry.action && <ActionCallout action={entry.action} />}
		</Box>
	);
}

function StallNoMatchEntry({ entry }: { entry: ILoaderLogEntryStallNoMatch }) {
	return (
		<Box>
			<Typography variant="body2">
				<strong>Stall #{entry.stall_id}:</strong> {entry.location.name}, {entry.location.address} (
				{entry.location.state})
			</Typography>
			<PollingPlaceRefList places={entry.nearby} label="nearby polling places" />
			{entry.action && <ActionCallout action={entry.action} />}
		</Box>
	);
}

function StallMultiMatchEntry({ entry }: { entry: ILoaderLogEntryStallMultiMatch }) {
	return (
		<Box>
			<Typography variant="body2">
				<strong>Stall #{entry.stall_id}:</strong> {entry.location.name}, {entry.location.address} (
				{entry.location.state})
			</Typography>
			<PollingPlaceRefList places={entry.candidates} label="candidate polling places" />
			{entry.action && <ActionCallout action={entry.action} />}
		</Box>
	);
}

function StallMatchedEntry({ entry }: { entry: ILoaderLogEntryStallMatched }) {
	return (
		<Box>
			<Typography variant="body2">
				Stall #{entry.stall_id} matched at {Math.round(entry.distance_m)}m
			</Typography>
			<ComparisonCard
				userLabel="User submitted"
				user={entry.user_submitted}
				officialLabel="Official polling place"
				official={entry.official}
			/>
			{entry.action && <ActionCallout action={entry.action} />}
		</Box>
	);
}

function NomsMergeReviewEntry({ entry }: { entry: ILoaderLogEntryNomsMergeReview }) {
	return (
		<Box>
			<ComparisonCard
				userLabel="User added"
				user={entry.user_submitted}
				officialLabel="Merged into official"
				official={entry.official}
			/>
			{entry.action && <ActionCallout action={entry.action} />}
		</Box>
	);
}

function SpatialProximityEntry({ entry }: { entry: ILoaderLogEntrySpatialProximity }) {
	return (
		<Box>
			<Typography variant="body2">
				{entry.polling_places.length} polling places share the same location
				{entry.stage_name && ` (in ${STAGE_LABELS[entry.stage_name] ?? entry.stage_name})`}
			</Typography>
			<PollingPlaceRefList places={entry.polling_places} label="polling places" />
			{entry.action && <ActionCallout action={entry.action} />}
		</Box>
	);
}

function DedupEntry({ entry }: { entry: ILoaderLogEntryDedupMerge | ILoaderLogEntryDedupDiscard }) {
	const [showPlaces, setShowPlaces] = useState(false);
	const isMerge = entry.type === 'dedup_merge';
	const mergeEntry = entry as ILoaderLogEntryDedupMerge;

	return (
		<Box>
			<Typography variant="body2">
				{isMerge
					? `Merged divisions for ${entry.count} polling places at ${mergeEntry.location}`
					: `Discarded ${entry.count} duplicate polling places at ${(entry as ILoaderLogEntryDedupDiscard).location}`}
			</Typography>
			{isMerge && mergeEntry.divisions.length > 0 && (
				<Typography variant="body2" color="text.secondary">
					Divisions: {mergeEntry.divisions.join(', ')}
				</Typography>
			)}
			{entry.polling_places.length > 0 && (
				<>
					<Button size="small" sx={{ mt: 0.5 }} onClick={() => setShowPlaces((s) => !s)}>
						{showPlaces ? 'Hide' : `Show ${entry.polling_places.length} polling place(s)`}
					</Button>
					<Collapse in={showPlaces}>
						<List dense disablePadding sx={{ pl: 1 }}>
							{entry.polling_places.map((pp) => (
								<ListItem key={`${pp.name}::${pp.premises}`} disablePadding>
									<ListItemText primary={`${pp.name} — ${pp.premises}`} secondary={pp.address} />
								</ListItem>
							))}
						</List>
					</Collapse>
				</>
			)}
			{entry.action && <ActionCallout action={entry.action} />}
		</Box>
	);
}

function EcIdDuplicateEntry({ entry }: { entry: ILoaderLogEntryEcIdDuplicate }) {
	return (
		<Box>
			<Typography variant="body2">
				<strong>{entry.name}</strong> ({entry.premises}) — EC ID:{' '}
				<Box component="code" sx={{ bgcolor: 'grey.100', px: 0.5, borderRadius: 0.5 }}>
					{entry.ec_id}
				</Box>
			</Typography>
			{entry.action && <ActionCallout action={entry.action} />}
		</Box>
	);
}

const findHomeDivisionReasonLabels: Record<string, string> = {
	multiple_matches: 'Multiple matches',
	no_match: 'No match',
	not_in_list: 'Not in list',
};

function FindHomeDivisionErrorEntry({ entry }: { entry: ILoaderLogEntryFindHomeDivisionError }) {
	const [showCandidates, setShowCandidates] = useState(false);

	return (
		<Box>
			<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
				<Typography variant="body2">
					<strong>{entry.polling_place_name}</strong>
				</Typography>
				<Chip
					label={findHomeDivisionReasonLabels[entry.reason] ?? entry.reason}
					size="small"
					color="error"
					variant="outlined"
				/>
				{entry.eb_division && (
					<Typography variant="body2" color="text.secondary">
						EB division: {entry.eb_division}
					</Typography>
				)}
			</Stack>
			{entry.candidates && entry.candidates.length > 0 && (
				<>
					<Button size="small" sx={{ mt: 0.5 }} onClick={() => setShowCandidates((s) => !s)}>
						{showCandidates ? 'Hide candidates' : `Show ${entry.candidates.length} candidate(s)`}
					</Button>
					<Collapse in={showCandidates}>
						<List dense disablePadding sx={{ pl: 1 }}>
							{entry.candidates.map((c) => (
								<ListItem key={c} disablePadding>
									<ListItemText primary={c} />
								</ListItem>
							))}
						</List>
					</Collapse>
				</>
			)}
			{entry.action && <ActionCallout action={entry.action} />}
		</Box>
	);
}

function MppNotFoundEntry({ entry }: { entry: ILoaderLogEntryMppNotFound }) {
	return (
		<Box>
			<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
				<Typography variant="body2">
					<strong>{entry.name}</strong> — {entry.address}
				</Typography>
				{entry.detached_mpp && <Chip label="MPP detached" size="small" color="warning" />}
				{entry.mpp_id != null && <Chip label={`MPP id=${entry.mpp_id}`} size="small" variant="outlined" />}
			</Stack>
			{entry.action && <ActionCallout action={entry.action} />}
		</Box>
	);
}

function MigrateStatsEntry({ entry }: { entry: ILoaderLogEntryMigrateStats }) {
	return (
		<Typography variant="body2">
			Loaded {entry.total_polling_places} polling places (prev: {entry.previous_set}, archived:{' '}
			{entry.previous_archived}). New: +{entry.new_polling_places}, removed: -{entry.deleted_polling_places}, net:{' '}
			{entry.delta_total >= 0 ? '+' : ''}
			{entry.delta_total}
		</Typography>
	);
}

// ──────────────────────────────────────────────────────────
// Dispatcher: routes each entry to its renderer
// ──────────────────────────────────────────────────────────

function EntryRenderer({ entry }: { entry: ILoaderLogEntry }) {
	switch (entry.type) {
		case 'text':
			return <TextEntry entry={entry} />;
		case 'validation_error':
			return <ValidationErrorEntry entry={entry} />;
		case 'geocode_skip':
			return <GeocodeSkipEntry entry={entry} />;
		case 'stall_no_match':
			return <StallNoMatchEntry entry={entry} />;
		case 'stall_multi_match':
			return <StallMultiMatchEntry entry={entry} />;
		case 'stall_matched':
			return <StallMatchedEntry entry={entry} />;
		case 'noms_merge_review':
			return <NomsMergeReviewEntry entry={entry} />;
		case 'spatial_proximity':
			return <SpatialProximityEntry entry={entry} />;
		case 'dedup_merge':
		case 'dedup_discard':
			return <DedupEntry entry={entry} />;
		case 'ec_id_duplicate':
			return <EcIdDuplicateEntry entry={entry} />;
		case 'find_home_division_error':
			return <FindHomeDivisionErrorEntry entry={entry} />;
		case 'mpp_not_found':
			return <MppNotFoundEntry entry={entry} />;
		case 'migrate_stats':
			return <MigrateStatsEntry entry={entry} />;
		default:
			// Fallback for any future entry types — render raw JSON
			return (
				<Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem', overflowX: 'auto' }}>
					{JSON.stringify(entry, null, 2)}
				</Typography>
			);
	}
}

// ──────────────────────────────────────────────────────────
// Collapsible entry list with "show N more" truncation
// ──────────────────────────────────────────────────────────

function entryKey(entry: ILoaderLogEntry): string {
	const base = `${entry.level}::${entry.type}`;
	if ('message' in entry) return `${base}::${entry.message}`;
	if ('name' in entry) return `${base}::${String(entry.name)}`;
	if ('stall_id' in entry) return `${base}::${String(entry.stall_id)}`;
	if ('polling_place_name' in entry) return `${base}::${String(entry.polling_place_name)}`;
	return base;
}

function EntryList({ entries, max = MAX_VISIBLE_ENTRIES }: { entries: ILoaderLogEntry[]; max?: number }) {
	const [showAll, setShowAll] = useState(false);
	const visible = showAll ? entries : entries.slice(0, max);
	const hiddenCount = entries.length - visible.length;

	return (
		<List dense disablePadding>
			{visible.map((entry) => (
				<ListItem
					key={entryKey(entry)}
					alignItems="flex-start"
					sx={{ flexDirection: 'column', alignItems: 'stretch', py: 0.5, px: 0 }}
				>
					<EntryRenderer entry={entry} />
				</ListItem>
			))}
			{hiddenCount > 0 && (
				<ListItem sx={{ px: 0 }}>
					<Button size="small" onClick={() => setShowAll(true)}>
						Show {hiddenCount} more
					</Button>
				</ListItem>
			)}
		</List>
	);
}

// ──────────────────────────────────────────────────────────
// Stage body: errors → warnings → summaries → detail (collapsed)
// ──────────────────────────────────────────────────────────

function SectionLabel({ label, color }: { label: string; color?: string }) {
	return (
		<Typography
			variant="overline"
			sx={{ display: 'block', color: color ?? 'text.secondary', fontWeight: 600, mt: 1, mb: 0.5, lineHeight: 1.8 }}
		>
			{label}
		</Typography>
	);
}

function StageBody({ stage }: { stage: ILoaderStage }) {
	const [showDetail, setShowDetail] = useState(false);
	const { errors, warnings, summaries, detail } = stage;
	const hasContent = errors.length + warnings.length + summaries.length + detail.length > 0;

	if (!hasContent) {
		return (
			<Typography variant="body2" color="text.secondary">
				No log entries.
			</Typography>
		);
	}

	return (
		<Box>
			{errors.length > 0 && (
				<>
					<SectionLabel label={`Errors (${errors.length})`} color="error.main" />
					<EntryList entries={errors} />
				</>
			)}

			{warnings.length > 0 && (
				<>
					<SectionLabel label={`Warnings (${warnings.length})`} color="warning.main" />
					<EntryList entries={warnings} />
				</>
			)}

			{summaries.length > 0 && (
				<>
					<SectionLabel label="Summary" />
					<EntryList entries={summaries} />
				</>
			)}

			{detail.length > 0 && (
				<>
					<Divider sx={{ mt: 1 }} />
					<Button
						size="small"
						sx={{ mt: 0.5 }}
						onClick={() => setShowDetail((s) => !s)}
						endIcon={
							<ExpandMore
								sx={{
									transform: showDetail ? 'rotate(180deg)' : 'none',
									transition: 'transform 0.2s',
								}}
							/>
						}
					>
						{showDetail ? 'Hide detail' : `Show detail (${detail.length} entries)`}
					</Button>
					<Collapse in={showDetail}>
						<EntryList entries={detail} />
					</Collapse>
				</>
			)}
		</Box>
	);
}

// ──────────────────────────────────────────────────────────
// Stage accordion row
// ──────────────────────────────────────────────────────────

function StageAccordion({ stage }: { stage: ILoaderStage }) {
	return (
		<Accordion
			defaultExpanded={stage.outcome === 'error'}
			disableGutters
			elevation={0}
			sx={{
				border: '1px solid',
				borderColor: 'divider',
				'&:before': { display: 'none' },
				mb: 0.5,
				borderRadius: '4px !important',
			}}
		>
			<AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 2 }}>
				<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ width: '100%', pr: 1, gap: 0.5 }}>
					<Typography variant="subtitle2" sx={{ flex: 1, minWidth: 120 }}>
						{stage.label}
					</Typography>
					<Chip label={outcomeLabel(stage.outcome)} size="small" color={outcomeColor(stage.outcome)} />
					<Chip label={formatDuration(stage.duration_seconds)} size="small" variant="outlined" />
					{stage.errors.length > 0 && (
						<Chip
							label={`${stage.errors.length} error${stage.errors.length !== 1 ? 's' : ''}`}
							size="small"
							color="error"
							variant="outlined"
						/>
					)}
					{stage.warnings.length > 0 && (
						<Chip
							label={`${stage.warnings.length} warning${stage.warnings.length !== 1 ? 's' : ''}`}
							size="small"
							color="warning"
							variant="outlined"
						/>
					)}
				</Stack>
			</AccordionSummary>
			<AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
				<StageBody stage={stage} />
			</AccordionDetails>
		</Accordion>
	);
}

// ──────────────────────────────────────────────────────────
// Outcome banner
// ──────────────────────────────────────────────────────────

function OutcomeBanner({ payload }: { payload: ILoaderPayload }) {
	const {
		is_dry_run,
		outcome,
		total_errors,
		total_warnings,
		total_actions_required,
		total_polling_places,
		new_polling_places,
		deleted_polling_places,
		delta_total,
		is_reload,
		run_at,
		run_by,
		stages,
	} = payload;

	const errorStageCount = stages.filter((s) => s.outcome === 'error').length;

	let severity: 'info' | 'error' | 'warning' | 'success';
	let message: string;

	if (is_dry_run) {
		severity = 'info';
		message = 'Dry run complete — no changes were saved.';
	} else if (outcome === 'error') {
		severity = 'error';
		message = `Loading failed with ${total_errors} error${total_errors !== 1 ? 's' : ''} across ${errorStageCount} stage${errorStageCount !== 1 ? 's' : ''}.`;
	} else if (outcome === 'warning') {
		severity = 'warning';
		message = `Loaded successfully with ${total_warnings} warning${total_warnings !== 1 ? 's' : ''}.`;
	} else {
		severity = 'success';
		message = 'Polling places loaded successfully.';
	}

	const isAborted = !is_dry_run && outcome === 'error';

	return (
		<Box sx={{ mb: 2 }}>
			<Alert severity={severity}>
				{!is_dry_run && is_reload === false && (
					<Typography variant="body2" sx={{ fontStyle: 'italic', mb: 0.5 }}>
						First load
					</Typography>
				)}
				<Typography variant="body2">{message}</Typography>
				{total_actions_required > 0 && (
					<Typography variant="body2" sx={{ mt: 0.5 }}>
						{total_actions_required} item{total_actions_required !== 1 ? 's' : ''} require manual verification — see
						amber callouts below.
					</Typography>
				)}
				{isAborted && (
					<Typography variant="body2" sx={{ mt: 0.5 }}>
						The load did not complete — your existing live data is unchanged.
					</Typography>
				)}
			</Alert>

			{/* Stats row — omitted for dry runs */}
			{!is_dry_run && total_polling_places !== null && (
				<Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
					<Chip
						icon={<CheckCircle />}
						label={`${total_polling_places} polling places`}
						size="small"
						color="success"
						variant="outlined"
					/>
					{is_reload && new_polling_places !== null && (
						<Chip label={`▲ ${new_polling_places} new`} size="small" color="success" variant="outlined" />
					)}
					{is_reload && deleted_polling_places !== null && (
						<Chip
							label={`▼ ${deleted_polling_places} removed`}
							size="small"
							color={deleted_polling_places > 0 ? 'warning' : 'default'}
							variant="outlined"
						/>
					)}
					{is_reload && delta_total !== null && (
						<Chip
							label={`Net ${delta_total >= 0 ? '+' : ''}${delta_total}`}
							size="small"
							color={delta_total > 0 ? 'success' : delta_total < 0 ? 'warning' : 'default'}
							variant="outlined"
						/>
					)}
				</Stack>
			)}

			{/* Run attribution */}
			<Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
				Run at {formatRunAt(run_at)}
				{run_by ? ` by ${run_by}` : ''}
			</Typography>
		</Box>
	);
}

// ──────────────────────────────────────────────────────────
// Main export
// ──────────────────────────────────────────────────────────

export interface LoaderReportProps {
	payload: ILoaderPayload;
}

export default function LoaderReport({ payload }: LoaderReportProps) {
	return (
		<Box sx={{ mt: 2 }}>
			<OutcomeBanner payload={payload} />
			{payload.stages.map((stage) => (
				<StageAccordion key={stage.name} stage={stage} />
			))}
		</Box>
	);
}
