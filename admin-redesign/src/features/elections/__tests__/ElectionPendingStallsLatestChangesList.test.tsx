import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { Election } from '../../../app/services/elections';
import ElectionPendingStallsLatestChangesEntrypoint from '../ElectionPendingStallsLatestChangesList';

vi.mock('../../../app/ui/dialog', () => ({
	DialogWithTransition: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../../app/services/stalls', () => ({
	StallStatus: { Approved: 'Approved', Declined: 'Declined' },
	useGetPendingStallsQuery: () => ({
		data: [
			{
				election_id: 1,
				latest_changes: [
					{
						history_id: 10,
						stall_id: 20,
						polling_place_id: 123,
						polling_place_name: 'Community Hall',
						status: 'Approved',
						triaged_by: 'Alex',
						datetime: '2026-01-01T00:00:00Z',
					},
					{
						history_id: 11,
						stall_id: 21,
						polling_place_id: 456,
						polling_place_name: 'Community Hall',
						status: 'Declined',
						triaged_by: 'Alex',
						datetime: '2026-01-01T00:00:00Z',
					},
					{
						history_id: 12,
						stall_id: 22,
						polling_place_id: 789,
						polling_place_name: 'New Hall',
						status: 'Approved',
						triaged_by: 'Alex',
						datetime: '2026-01-01T00:00:00Z',
					},
					{
						history_id: 13,
						stall_id: 23,
						polling_place_id: null,
						polling_place_name: 'Closed Hall',
						status: 'Declined',
						triaged_by: 'Alex',
						datetime: '2026-01-01T00:00:00Z',
					},
					{
						history_id: 14,
						stall_id: 24,
						polling_place_id: null,
						polling_place_name: null,
						status: 'Approved',
						triaged_by: 'Alex',
						datetime: '2026-01-01T00:00:00Z',
					},
				],
			},
		],
	}),
}));

describe('Latest changes polling place links', () => {
	function renderLatestChanges() {
		const election = { id: 1, name_url_safe: 'test-election' } as Election;
		const router = createMemoryRouter(
			[
				{
					path: '/',
					element: <ElectionPendingStallsLatestChangesEntrypoint election={election} onClose={vi.fn()} />,
				},
				{ path: '/polling-places/:election_name/:polling_place_id/', element: <div>Polling place editor</div> },
			],
			{ initialEntries: ['/'] },
		);
		render(<RouterProvider router={router} />);
		return router;
	}

	it('links each change to its polling place by ID, even when names are identical', () => {
		const router = renderLatestChanges();

		const links = screen.getAllByRole('link', { name: 'Community Hall' });
		expect(links[0]).toHaveAttribute('href', '/polling-places/test-election/123/');
		expect(links[1]).toHaveAttribute('href', '/polling-places/test-election/456/');

		fireEvent.click(links[1]);
		expect(screen.getByText('Polling place editor')).toBeInTheDocument();
		expect(router.state.location.pathname).toBe('/polling-places/test-election/456/');
	});

	it('links to the current polling place', () => {
		renderLatestChanges();

		expect(screen.getByRole('link', { name: 'New Hall' })).toHaveAttribute(
			'href',
			'/polling-places/test-election/789/',
		);
	});

	it('shows an unavailable place without a broken link', () => {
		renderLatestChanges();

		const entry = screen.getByText(/submission #23 at Closed Hall/).closest('li');
		expect(entry).not.toBeNull();
		if (entry === null) throw new Error('Missing latest change');
		expect(entry).toHaveTextContent('current polling place unavailable');
		expect(within(entry).queryByRole('link')).not.toBeInTheDocument();
		expect(
			screen.getByText(/submission #24 at a polling place whose details are no longer available/),
		).toBeInTheDocument();
	});
});
