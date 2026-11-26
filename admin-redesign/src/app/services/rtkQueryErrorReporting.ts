import * as Sentry from '@sentry/browser';

type UnknownRecord = Record<string, unknown>;

/**
 * Check whether a value is a non-null object whose fields can be inspected.
 *
 * @param value - The value to check.
 * @returns Whether the value is a non-null object.
 */
function isRecord(value: unknown): value is UnknownRecord {
	return typeof value === 'object' && value !== null;
}

/**
 * Read the HTTP or request-error status from a rejected request's payload.
 *
 * @param payload - The rejected request's payload, which may have no status.
 * @returns The status as text, such as "500" or "FETCH_ERROR", or "UNKNOWN" if unavailable.
 */
function getStatus(payload: unknown): string {
	if (!isRecord(payload)) {
		return 'UNKNOWN';
	}

	const { status } = payload;
	return typeof status === 'number' || typeof status === 'string' ? String(status) : 'UNKNOWN';
}

/**
 * Report an actionable rejected request to Sentry with details for grouping and diagnosis.
 *
 * Network failures and cancelled requests are skipped. Mutation arguments and response
 * payloads are omitted because they may contain personal information.
 *
 * @param action - The rejected Redux action to inspect.
 * @returns Nothing; sends an exception to Sentry when the failure should be reported.
 */
export function reportRtkQueryRejectedAction(action: unknown): void {
	if (!isRecord(action)) {
		return;
	}

	// Rejected actions and their payloads may not have the expected RTK Query fields.
	const meta = isRecord(action.meta) ? action.meta : undefined;
	const arg = meta && isRecord(meta.arg) ? meta.arg : undefined;
	const error = isRecord(action.error) ? action.error : undefined;
	const endpointName = arg && typeof arg.endpointName === 'string' ? arg.endpointName : 'unknown';
	const requestType = arg && typeof arg.type === 'string' ? arg.type : 'unknown';
	const requestId = meta && typeof meta.requestId === 'string' ? meta.requestId : undefined;
	const errorMessage = error && typeof error.message === 'string' ? error.message : undefined;
	const status = getStatus(action.payload);

	// Offline users and blocked or interrupted connections don't indicate an actionable API failure.
	if (status === 'FETCH_ERROR') {
		return;
	}

	// RTK can identify a cancellation through the serialized error name.
	if (error && error.name === 'AbortError') {
		return;
	}

	// It also records cancellation in metadata, even if the error name is unavailable.
	if (meta?.aborted === true) {
		return;
	}

	// A real error gives Sentry a meaningful title instead of grouping plain Redux objects together.
	const rtkError = new Error(`RTK Query ${endpointName} failed [${status}]`);
	rtkError.name = 'RTKQueryError';

	// Mutation responses can echo submitted personal information, so omit them as well as arguments.
	const extra: UnknownRecord = {
		requestId,
		errorMessage,
	};

	if (requestType !== 'mutation') {
		extra.originalArgs = arg?.originalArgs;
		extra.payload = action.payload;
	}

	// Group failures by endpoint and status while retaining request details for diagnosis.
	Sentry.captureException(rtkError, {
		fingerprint: ['rtk-query', endpointName, status],
		tags: {
			'rtk.endpoint': endpointName,
			'rtk.status': status,
			'rtk.type': requestType,
		},
		extra,
	});
}
