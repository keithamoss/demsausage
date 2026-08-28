// Structured loader log types — Phase 2
// These mirror the Python structured log entries emitted by loader.py.

export type LogLevel = 'error' | 'warning' | 'info' | 'summary';
export type Outcome = 'ok' | 'warning' | 'error';
export type StageOutcome = 'ok' | 'warning' | 'error' | 'skipped';

// ---------------------------------------------------------------------------
// Shared reference types
// ---------------------------------------------------------------------------

export interface IPollingPlaceRef {
	name: string;
	premises: string;
	address: string;
	distance_m?: number;
}

export interface IStallLocation {
	name: string;
	address: string;
	state: string;
}

// ---------------------------------------------------------------------------
// Log entry variants (discriminated union on `type`)
// ---------------------------------------------------------------------------

/** Base present on every log entry. */
interface ILogEntryBase {
	level: LogLevel;
	/** Present on any entry that requires operator attention. */
	action?: string;
}

export interface ILoaderLogEntryText extends ILogEntryBase {
	type: 'text';
	message: string;
}

export interface ILoaderLogEntryValidationError extends ILogEntryBase {
	type: 'validation_error';
	name: string;
	premises: string;
	fields: { field: string; messages: string[] }[];
}

export interface ILoaderLogEntryGeocodeSkip extends ILogEntryBase {
	type: 'geocode_skip';
	reason: 'no_results' | 'not_accurate_enough';
	premises: string;
	address: string;
	geocode_result?: unknown;
}

export interface ILoaderLogEntryStallNoMatch extends ILogEntryBase {
	type: 'stall_no_match';
	stall_id: number;
	location: IStallLocation;
	nearby: IPollingPlaceRef[];
}

export interface ILoaderLogEntryStallMultiMatch extends ILogEntryBase {
	type: 'stall_multi_match';
	stall_id: number;
	location: IStallLocation;
	candidates: IPollingPlaceRef[];
}

export interface ILoaderLogEntryStallMatched extends ILogEntryBase {
	type: 'stall_matched';
	stall_id: number;
	distance_m: number;
	user_submitted: IStallLocation;
	official: { name: string; premises: string; address: string };
}

export interface ILoaderLogEntrySpatialProximity extends ILogEntryBase {
	type: 'spatial_proximity';
	/** Machine-readable method name, e.g. "migrate_noms". */
	stage_name: string;
	polling_places: IPollingPlaceRef[];
}

export interface ILoaderLogEntryDedupMerge extends ILogEntryBase {
	type: 'dedup_merge';
	count: number;
	location: string;
	divisions: string[];
	polling_places: IPollingPlaceRef[];
}

export interface ILoaderLogEntryDedupDiscard extends ILogEntryBase {
	type: 'dedup_discard';
	count: number;
	location: string;
	polling_places: IPollingPlaceRef[];
}

export interface ILoaderLogEntryEcIdDuplicate extends ILogEntryBase {
	type: 'ec_id_duplicate';
	name: string;
	premises: string;
	ec_id: string;
}

export interface ILoaderLogEntryFindHomeDivisionError extends ILogEntryBase {
	type: 'find_home_division_error';
	polling_place_name: string;
	reason: 'multiple_matches' | 'no_match' | 'not_in_list';
	eb_division?: string;
	candidates?: string[];
}

export interface ILoaderLogEntryNomsMergeReview extends ILogEntryBase {
	type: 'noms_merge_review';
	user_submitted: { name: string; address: string };
	official: { name: string; address: string };
}

export interface ILoaderLogEntryMppNotFound extends ILogEntryBase {
	type: 'mpp_not_found';
	name: string;
	address: string;
	mpp_id: number | null;
	detached_mpp: boolean;
}

export interface ILoaderLogEntryMigrateStats extends ILogEntryBase {
	type: 'migrate_stats';
	total_polling_places: number;
	delta_total: number;
	new_polling_places: number;
	deleted_polling_places: number;
	previous_set: number;
	previous_archived: number;
}

export type ILoaderLogEntry =
	| ILoaderLogEntryText
	| ILoaderLogEntryValidationError
	| ILoaderLogEntryGeocodeSkip
	| ILoaderLogEntryStallNoMatch
	| ILoaderLogEntryStallMultiMatch
	| ILoaderLogEntryStallMatched
	| ILoaderLogEntrySpatialProximity
	| ILoaderLogEntryDedupMerge
	| ILoaderLogEntryDedupDiscard
	| ILoaderLogEntryEcIdDuplicate
	| ILoaderLogEntryFindHomeDivisionError
	| ILoaderLogEntryNomsMergeReview
	| ILoaderLogEntryMppNotFound
	| ILoaderLogEntryMigrateStats;

// ---------------------------------------------------------------------------
// Stage
// ---------------------------------------------------------------------------

export interface ILoaderStage {
	name: string;
	label: string;
	started_at: string; // ISO 8601
	finished_at: string; // ISO 8601
	duration_seconds: number;
	outcome: StageOutcome;
	total_entry_count: number;
	errors: ILoaderLogEntry[];
	warnings: ILoaderLogEntry[];
	summaries: ILoaderLogEntry[];
	detail: ILoaderLogEntry[];
}

// ---------------------------------------------------------------------------
// Top-level payload (the new structured format)
// ---------------------------------------------------------------------------

export interface ILoaderPayload {
	run_at: string; // ISO 8601
	run_by: string | null; // RQ job id or email
	is_reload: boolean;
	is_dry_run: boolean;
	outcome: Outcome;
	total_errors: number;
	total_warnings: number;
	total_actions_required: number;
	/** null for dry runs */
	total_polling_places: number | null;
	delta_total: number | null;
	new_polling_places: number | null;
	deleted_polling_places: number | null;
	stages: ILoaderStage[];
}

// ---------------------------------------------------------------------------
// Legacy flat format (backward-compat shim — used during transition)
// ---------------------------------------------------------------------------

export interface ILoaderLogsLegacy {
	errors: string[];
	warnings: string[];
	info: string[];
}

// ---------------------------------------------------------------------------
// Job response shape (from election_views.py polling_place_loader_job)
// ---------------------------------------------------------------------------

export interface ILoaderJobResponse {
	message: string;
	payload: ILoaderPayload | null;
	logs: ILoaderLogsLegacy | null;
}
