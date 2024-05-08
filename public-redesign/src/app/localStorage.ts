import { initialState as initialAppState, isAppState } from '../features/app/appSlice';
import { RootState } from './store';

const localStorageKey = 'public_site_redux_state';

// We've disabled this for now until we see what we end up storing in Redux that
// we might want to save for the user.
// Right now, the only thing we're saving that's worth retaining is their
// filter settings, so that they can reload the page and the map's position
// (taken care of by the URL) and filter settings don't change.
// Things we'd need to do to make this work better:
// 1. Add in an expiry date of some sort so the user doesn't set filters, have
// it saved, and come back in months or years to a new election and still have
// their filters applied. Equally, this could be taken care of by having
// per-election filters stored in Redux.
// 2. Being inclusive, rather than exclusive, in what we save. Right now, we're
// just excluding the polling places GeoJSON, but that means we need to remember to
// update the localStorage code each time we change appSlice - too easy to overlook.
// Switch it to the saving code picking exacly what it wants to save.

// index.tsx
// store.subscribe(
// 	// subscribe() gets called for all changes to state, so lets
// 	// debounce for better performance because we don't really
// 	// care about synching state quite that accurately.
// 	debounce(() => {
// 		saveStateToLocalStorage(store.getState());
// 	}, 1000),
// );

// store.ts in configureStore()
// preloadedState: loadStateFromLocalStorage(),

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
