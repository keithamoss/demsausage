import { matchRoutes, useLocation } from 'react-router-dom';
import { router } from '../routing/routes';

// https://stackoverflow.com/a/71246254/7368493
export const useCurrentPath = () => {
	const location = useLocation();
	const matchedRoutes = matchRoutes(router.routes, location);

	const lastMatchedRoute = matchedRoutes?.pop();
	return lastMatchedRoute?.route.path;
};
