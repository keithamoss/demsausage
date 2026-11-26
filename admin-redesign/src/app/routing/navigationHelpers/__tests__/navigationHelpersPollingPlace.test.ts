import { describe, expect, it, vi } from 'vitest';
import type { IPollingPlace } from '../../../../features/pollingPlaces/pollingPlacesInterfaces';
import {
	navigateToPollingPlaceEditorForm,
	navigateToPollingPlaceHistory,
	navigateToPollingPlaceStalls,
} from '../navigationHelpersPollingPlace';

describe('polling place editor navigation', () => {
	const pollingPlace = { id: 123 } as IPollingPlace;
	const destinations = [
		{ navigateTo: navigateToPollingPlaceEditorForm, suffix: '' },
		{ navigateTo: navigateToPollingPlaceHistory, suffix: 'history/' },
		{ navigateTo: navigateToPollingPlaceStalls, suffix: 'stalls/' },
	];

	it.each(destinations)('supports direct and search-based routes for $suffix', ({ navigateTo, suffix }) => {
		const navigate = vi.fn();

		navigateTo({ election_name: 'test-election' }, navigate, pollingPlace);
		expect(navigate).toHaveBeenLastCalledWith(`/polling-places/test-election/123/${suffix}`);

		navigateTo({ election_name: 'test-election', search_term: 'hall' }, navigate, pollingPlace);
		expect(navigate).toHaveBeenLastCalledWith(`/polling-places/test-election/search/hall/123/${suffix}`);
	});
});
