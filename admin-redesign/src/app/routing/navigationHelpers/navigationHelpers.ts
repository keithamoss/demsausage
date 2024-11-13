import type { Params } from 'react-router-dom';

export const getURLParams = (params: Params<string>) => {
	return {
		urlElectionName: params.election_name,
		urlSearchTerm: params.search_term,
	};
};

export const addComponentToEndOfURLPath = (urlPathBase: string, param: string | undefined) => {
	const urlPathBaseWithTrailingSlash = urlPathBase.endsWith('/') === true ? urlPathBase : `${urlPathBase}/`;
	return param === undefined ? urlPathBaseWithTrailingSlash : `${urlPathBaseWithTrailingSlash}${param}/`;
};

export const removeLastComponentFromEndOfURLPath = (urlPathBase: string) => {
	const pathComponents = urlPathBase.split('/').filter((c) => c !== '');
	pathComponents.pop();
	return `/${pathComponents.join('/')}/`;
};

export const removeLastTwoComponentsFromEndOfURLPath = (urlPathBase: string) => {
	const oneComponentRemoved = removeLastComponentFromEndOfURLPath(urlPathBase);
	return removeLastComponentFromEndOfURLPath(oneComponentRemoved);
};
