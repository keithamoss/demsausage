import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PendingStallsGamifiedUserStatsBar from '../PendingStallsGamifiedUserStatsBar';

const users = [
	{ id: 1, name: 'Alex', initials: 'A', image_url: '', total: 1 },
	{ id: 2, name: 'Blair', initials: 'B', image_url: '', total: 2 },
	{ id: 3, name: 'Casey', initials: 'C', image_url: '', total: 12 },
];

let resizeCallback: ResizeObserverCallback;
let trackWidth = 600;

class MockResizeObserver {
	constructor(callback: ResizeObserverCallback) {
		resizeCallback = callback;
	}
	observe() {}
	disconnect() {}
}

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	trackWidth = 600;
});

function renderBar(stats = users) {
	vi.stubGlobal('ResizeObserver', MockResizeObserver);
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
		width: trackWidth,
		height: 40,
		top: 0,
		left: 0,
		bottom: 40,
		right: trackWidth,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	}));
	return render(<PendingStallsGamifiedUserStatsBar stats={stats} />);
}

describe('PendingStallsGamifiedUserStatsBar', () => {
	it('aligns the line and leader on the same proportional position', () => {
		renderBar();
		expect(screen.getByTestId('stats-bar-line')).toHaveStyle({ width: '80%' });
		expect(screen.getByRole('button', { name: 'View contributions for Casey' })).toHaveStyle({ left: '80%' });
	});

	it('groups overlapping people and shows each person and score', () => {
		renderBar();
		fireEvent.click(screen.getByRole('button', { name: 'View 2 contributors' }));
		const dialog = screen.getByRole('dialog', { name: 'Contribution details' });
		expect(within(dialog).getByText('Alex')).toBeInTheDocument();
		expect(within(dialog).getByText('Blair')).toBeInTheDocument();
		expect(within(dialog).getByText('1')).toBeInTheDocument();
		expect(within(dialog).getByText('2')).toBeInTheDocument();
	});

	it('splits a chain of nearby scores into separate stacks when they fit', () => {
		trackWidth = 300;
		renderBar([
			{ ...users[0], total: 5 },
			{ ...users[1], total: 13 },
			{ ...users[2], total: 49 },
			{ id: 4, name: 'Devon', initials: 'D', image_url: '', total: 89 },
			{ id: 5, name: 'Eden', initials: 'E', image_url: '', total: 256 },
		]);

		const stacks = screen.getAllByRole('button', { name: 'View 2 contributors' });
		expect(stacks).toHaveLength(2);
		fireEvent.click(stacks[0]);
		let dialog = screen.getByRole('dialog', { name: 'Contribution details' });
		expect(within(dialog).getByText('5')).toBeInTheDocument();
		expect(within(dialog).getByText('13')).toBeInTheDocument();
		fireEvent.keyDown(document, { key: 'Escape' });
		fireEvent.click(stacks[1]);
		dialog = screen.getByRole('dialog', { name: 'Contribution details' });
		expect(within(dialog).getByText('49')).toBeInTheDocument();
		expect(within(dialog).getByText('89')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'View contributions for Eden', hidden: true })).toBeInTheDocument();
	});

	it('keeps neighbouring stacks together when there is not enough room', () => {
		trackWidth = 260;
		renderBar([
			{ ...users[0], total: 5 },
			{ ...users[1], total: 13 },
			{ ...users[2], total: 49 },
			{ id: 4, name: 'Devon', initials: 'D', image_url: '', total: 89 },
			{ id: 5, name: 'Eden', initials: 'E', image_url: '', total: 256 },
		]);

		expect(screen.getByRole('button', { name: 'View 4 contributors' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'View contributions for Eden' })).toBeInTheDocument();
	});

	it.each([12, 13])('prefers less total displacement for nearby scores ending at %i', async (thirdScore) => {
		trackWidth = 200;
		renderBar([
			{ ...users[0], total: 5 },
			{ ...users[1], total: 12 },
			{ ...users[2], total: thirdScore },
			{ id: 4, name: 'Devon', initials: 'D', image_url: '', total: 83 },
			{ id: 5, name: 'Eden', initials: 'E', image_url: '', total: 150 },
		]);

		fireEvent.click(screen.getByRole('button', { name: 'View 3 contributors' }));
		const dialog = screen.getByRole('dialog', { name: 'Contribution details' });
		expect(within(dialog).getByText('Alex')).toBeInTheDocument();
		expect(within(dialog).getByText('Blair')).toBeInTheDocument();
		expect(within(dialog).getByText('Casey')).toBeInTheDocument();
		fireEvent.keyDown(dialog, { key: 'Escape' });
		await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Contribution details' })).not.toBeInTheDocument());

		fireEvent.click(screen.getByRole('button', { name: 'View 2 contributors' }));
		const secondDialog = screen.getByRole('dialog', { name: 'Contribution details' });
		expect(within(secondDialog).getByText('Devon')).toBeInTheDocument();
		expect(within(secondDialog).getByText('Eden')).toBeInTheDocument();
	});

	it('prefers more markers when arrangements have the same total displacement', () => {
		trackWidth = 200;
		renderBar([
			{ ...users[0], total: 5 },
			{ ...users[1], total: 12 },
			{ ...users[2], total: 14 },
			{ id: 4, name: 'Devon', initials: 'D', image_url: '', total: 83 },
			{ id: 5, name: 'Eden', initials: 'E', image_url: '', total: 150 },
		]);

		expect(screen.getAllByRole('button', { name: 'View 2 contributors' })).toHaveLength(2);
		expect(screen.getByRole('button', { name: 'View contributions for Eden' })).toBeInTheDocument();
	});

	it('regroups when the available width changes', () => {
		renderBar();
		fireEvent.click(screen.getByRole('button', { name: 'View 2 contributors' }));
		expect(screen.getByRole('dialog', { name: 'Contribution details' })).toBeInTheDocument();
		trackWidth = 1500;
		act(() => resizeCallback([], {} as ResizeObserver));
		expect(screen.queryByRole('dialog', { name: 'Contribution details' })).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'View contributions for Alex' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'View contributions for Blair' })).toBeInTheDocument();
	});

	it('keeps tied leaders centred on the end of the line', () => {
		renderBar([
			{ ...users[0], total: 1 },
			{ ...users[1], total: 1 },
		]);
		expect(screen.getByTestId('stats-bar-line')).toHaveStyle({ width: '50%' });
		expect(screen.getByRole('button', { name: 'View 2 contributors' })).toHaveStyle({ left: '50%' });
	});

	it('closes details when updated scores change the group', () => {
		const { rerender } = renderBar();
		fireEvent.click(screen.getByRole('button', { name: 'View 2 contributors' }));
		rerender(<PendingStallsGamifiedUserStatsBar stats={[users[0], { ...users[1], total: 4 }, users[2]]} />);
		expect(screen.queryByRole('dialog', { name: 'Contribution details' })).not.toBeInTheDocument();
	});

	it('updates scores in an open group that remains together', () => {
		trackWidth = 300;
		const { rerender } = renderBar();
		fireEvent.click(screen.getByRole('button', { name: 'View 2 contributors' }));
		rerender(<PendingStallsGamifiedUserStatsBar stats={[users[0], { ...users[1], total: 3 }, users[2]]} />);
		const dialog = screen.getByRole('dialog', { name: 'Contribution details' });
		expect(within(dialog).getByText('3')).toBeInTheDocument();
	});

	it('positions a sole contributor at the end of the track', () => {
		renderBar([users[0]]);
		expect(screen.getByTestId('stats-bar-line')).toHaveStyle({ width: '100%' });
		expect(screen.getByRole('button', { name: 'View contributions for Alex' })).toHaveStyle({ left: '100%' });
	});

	it('handles contributors with zero totals', () => {
		renderBar([
			{ ...users[0], total: 0 },
			{ ...users[1], total: 0 },
		]);
		expect(screen.getByTestId('stats-bar-line')).toHaveStyle({ width: '0%' });
		expect(screen.getByRole('button', { name: 'View 2 contributors' })).toHaveStyle({ left: '0%' });
	});

	it.each([3, 4])('keeps a stack of %i contributors compact enough for the left inset', (count) => {
		const extraUser = { id: 4, name: 'Devon', initials: 'D', image_url: '', total: 0 };
		renderBar([...users, extraUser].slice(0, count).map((user) => ({ ...user, total: 0 })));
		const group = screen.getByRole('button', { name: `View ${count} contributors` });
		expect(group).toHaveStyle({ left: '0%' });
		const avatars = group.querySelectorAll('.MuiAvatar-root');
		expect(avatars).toHaveLength(3);
		for (const avatar of avatars) {
			expect(avatar).toHaveStyle({ width: '20px', height: '20px' });
		}
	});

	it('renders nothing when there are no contributors', () => {
		const { container } = renderBar([]);
		expect(container).toBeEmptyDOMElement();
	});
});
