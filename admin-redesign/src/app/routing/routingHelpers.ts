import { Params } from 'react-router-dom';

export const getIntegerParamOrUndefined = (params: Params<string>, paramName: string) => {
	if (params[paramName]?.match(/^\d+$/) !== null) {
		return parseInt(params[paramName] ?? '');
	}
	return undefined;
};

export const getStringParamOrUndefined = (params: Params<string>, paramName: string) => {
	if (params[paramName]?.match(/^.+$/) !== null) {
		return params[paramName] ?? undefined;
	}
	return undefined;
};

export const getStringParamOrEmptyString = (params: Params<string>, paramName: string) => {
	if (params[paramName]?.match(/^.+$/) !== null) {
		return params[paramName] ?? '';
	}
	return '';
};
