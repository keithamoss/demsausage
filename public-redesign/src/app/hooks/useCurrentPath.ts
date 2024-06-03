import { matchRoutes, useLocation } from 'react-router-dom';
import { router } from '../routing/routes';

// https://stackoverflow.com/a/71246254/7368493
export const useCurrentPath = () => {
	const location = useLocation();
	const matchedRoutes = matchRoutes(router.routes, location);
	console.log('matchedRoutes', JSON.parse(JSON.stringify(matchedRoutes)));

	const lastMatchedRoute = matchedRoutes?.pop();
	return lastMatchedRoute?.route.path;
};
