import { NavigateFunction, Params } from 'react-router-dom';
import { getURLParams } from './navigationHelpers';

export const navigateToEditStallSubmitted = (params: Params<string>, navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /edit-stall/:election_name/submitted/
	const { urlElectionName } = getURLParams(params);

	if (urlElectionName === undefined) {
		return;
	}

	navigate(`/edit-stall/${urlElectionName}/submitted/`, {
		state: { cameFromInternalNavigation: true },
	});
};
