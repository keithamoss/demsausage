import type { NavigateFunction } from 'react-router-dom';

export const navigateToPendingStallsRoot = (navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /

	navigate('/');
};

export const navigateToPendingStallsPollingPlaceById = (navigate: NavigateFunction, pollingPlaceId: number) => {
	// We handle going to all of these routes:
	// /pending_stalls/:polling_place_id/

	navigate(`/pending_stalls/${pollingPlaceId}/`);
};
