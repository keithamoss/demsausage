import type { NavigateFunction } from 'react-router-dom';

export const navigateToPendingStallsPollingPlaceById = (navigate: NavigateFunction, pollingPlaceId: number) => {
	// We handle going to all of these routes:
	// /pending_stalls/:polling_place_id/

	navigate(`/pending_stalls/${pollingPlaceId}/`);
};
