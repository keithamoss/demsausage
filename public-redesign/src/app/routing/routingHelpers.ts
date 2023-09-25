import { Params } from 'react-router-dom';

export const getIntegerParamOrUndefined = (params: Params<string>, paramName: string) => {
	if (params[paramName]?.match(/^\d+$/) !== null) {
		return parseInt(params[paramName] || '');
	}
	return undefined;
};
