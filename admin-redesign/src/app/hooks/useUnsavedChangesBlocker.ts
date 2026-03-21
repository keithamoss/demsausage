import { useCallback, useEffect } from 'react';
import { type Location, useBlocker } from 'react-router-dom';

/**
 * Intercepts React Router v6 navigations when the caller has unsaved changes.
 *
 * When `isDirty` is `true`, any attempt to navigate away (via Link, navigate(),
 * browser back/forward, or "Skip") is intercepted and a browser-native confirm
 * dialog is shown.  Confirming discards the changes and navigates; cancelling
 * returns the user to the current page.
 *
 * Usage:
 *   useUnsavedChangesBlocker(isDirty);
 *
 * The hook is a no-op when `isDirty` is `false`, so it is always safe to call.
 */
export function useUnsavedChangesBlocker(isDirty: boolean): void {
	const blocker = useBlocker(
		useCallback(
			({ currentLocation, nextLocation }: { currentLocation: Location; nextLocation: Location }) =>
				isDirty && currentLocation.pathname !== nextLocation.pathname,
			[isDirty],
		),
	);

	useEffect(() => {
		if (blocker.state === 'blocked') {
			const confirmed = window.confirm(
				'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.',
			);

			if (confirmed) {
				blocker.proceed();
			} else {
				blocker.reset();
			}
		}
	}, [blocker]);
}
