import { initialState as initialAppState, isAppState } from '../features/app/appSlice';
import { RootState } from './store';

const localStorageKey = 'public_site_redux_state';

export function loadStateFromLocalStorage() {
	try {
		const serializedState = localStorage.getItem(localStorageKey);
		if (!serializedState) return undefined;

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const parsed = JSON.parse(serializedState);

		if (isAppState(parsed)) {
			return { app: { ...initialAppState, ...parsed } };
		} else {
			// Invalid JSON format
			return undefined;
		}
	} catch (e) {
		return undefined;
	}
}

export function saveStateToLocalStorage(state: RootState) {
	try {
		// We only want to serialize a very narrow slice of the state.
		// We discard all of the RTK Query data (state.api) and the
		// large chunk of polling places GeoJSON (state.app.pollingPlaces)
		const { pollingPlaces, ...rest } = state.app;
		const serializedState = JSON.stringify(rest);
		localStorage.setItem(localStorageKey, serializedState);
	} catch (e) {
		// Ignore
	}
}
