import { act, fireEvent, render, screen, within } from '@testing-library/react';
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
