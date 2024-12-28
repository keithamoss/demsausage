import type { NavigateFunction } from 'react-router-dom';
import type { Election } from '../../services/elections';

export const navigateToElections = (navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /elections/

	navigate('/elections/');
};

export const navigateToAddElection = (navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /elections/create/

	navigate('/elections/create/');
};

export const navigateToElection = (navigate: NavigateFunction, election: Election) => {
	// We handle going to all of these routes:
	// /elections/edit/:election_name/

	navigate(`/elections/edit/${election.name_url_safe}/`);
};
