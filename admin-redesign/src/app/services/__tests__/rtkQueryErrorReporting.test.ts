import { beforeEach, describe, expect, it, vi } from 'vitest';

const captureException = vi.hoisted(() => vi.fn());

vi.mock('@sentry/browser', () => ({
	captureException,
}));

import { reportRtkQueryRejectedAction } from '../rtkQueryErrorReporting';

function rejectedAction({
	endpointName = 'getElection',
	requestType = 'query',
	status = 500,
	errorName,
	errorMessage = 'Request failed',
	originalArgs = { electionId: 42 },
}: {
	endpointName?: string;
	requestType?: 'query' | 'mutation';
	status?: number | string;
	errorName?: string;
	errorMessage?: string;
	originalArgs?: unknown;
} = {}) {
	return {
		type: 'api/executeRejected',
		payload: { status, data: 'Server error' },
		meta: {
			requestId: 'request-123',
			aborted: errorName === 'AbortError',
			arg: { endpointName, type: requestType, originalArgs },
		},
		error: {
			name: errorName,
			message: errorMessage,
		},
	};
}

describe('RTK Query Sentry reporting', () => {
	beforeEach(() => {
		captureException.mockReset();
	});

	it('skips FETCH_ERROR failures', () => {
		reportRtkQueryRejectedAction(rejectedAction({ status: 'FETCH_ERROR' }));

		expect(captureException).not.toHaveBeenCalled();
	});

	it('skips aborted requests', () => {
		reportRtkQueryRejectedAction(rejectedAction({ errorName: 'AbortError' }));

		expect(captureException).not.toHaveBeenCalled();
	});

	it('reports 500 failures with endpoint and status context', () => {
		reportRtkQueryRejectedAction(rejectedAction());

		expect(captureException).toHaveBeenCalledOnce();
		const [reportedError, context] = captureException.mock.calls[0];

		expect(reportedError).toBeInstanceOf(Error);
		expect(reportedError.name).toBe('RTKQueryError');
		expect(reportedError.message).toBe('RTK Query getElection failed [500]');
		expect(context).toMatchObject({
			fingerprint: ['rtk-query', 'getElection', '500'],
			tags: {
				'rtk.endpoint': 'getElection',
				'rtk.status': '500',
				'rtk.type': 'query',
			},
			extra: {
				requestId: 'request-123',
				errorMessage: 'Request failed',
				originalArgs: { electionId: 42 },
			},
		});
	});

	it('omits mutation arguments and payload data', () => {
		reportRtkQueryRejectedAction(
			rejectedAction({
				requestType: 'mutation',
				originalArgs: { name: 'Private Name', email: 'private@example.com' },
			}),
		);

		expect(captureException).toHaveBeenCalledOnce();
		const [, context] = captureException.mock.calls[0];

		expect(context.extra).not.toHaveProperty('originalArgs');
		expect(context.extra).not.toHaveProperty('payload');
	});
});
