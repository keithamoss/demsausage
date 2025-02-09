export enum eAppEnv {
	DEVELOPMENT = 1,
	TEST = 2,
	PRODUCTION = 3,
}

export function getEnvironment(): eAppEnv {
	switch (import.meta.env.VITE_ENVIRONMENT) {
		case 'DEVELOPMENT':
			return eAppEnv.DEVELOPMENT;
		case 'TEST':
			return eAppEnv.TEST;
		case 'PRODUCTION':
			return eAppEnv.PRODUCTION;
	}
}

export function isDevelopment(): boolean {
	return getEnvironment() === eAppEnv.DEVELOPMENT;
}

export function getAPIBaseURL(): string {
	return import.meta.env.VITE_API_BASE_URL;
}

export function getBaseURL(): string {
	return import.meta.env.VITE_SITE_BASE_URL;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore-next-line
export const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

// http://stackoverflow.com/questions/14484787/wrap-text-in-javascript
export function stringDivider(str: string, width: number, spaceReplacer: string, replaceCount = 0): [string, number] {
	if (str.length > width) {
		let p = width;
		while (p > 0 && str[p] !== ' ' && str[p] !== '-') {
			p -= 1;
		}
		if (p > 0) {
			let left: string;
			if (str.substring(p, p + 1) === '-') {
				left = str.substring(0, p + 1);
			} else {
				left = str.substring(0, p);
			}
			const right = str.substring(p + 1);
			// biome-ignore lint/style/noParameterAssign: <explanation>
			replaceCount += 1;
			const [newText, newReplaceCount] = stringDivider(right, width, spaceReplacer, replaceCount);
			return [left + spaceReplacer + newText, newReplaceCount];
		}
	}
	return [str, replaceCount];
}

export const getCSVStringsAsFloats = (s: string) => {
	if (s.length === 0) {
		return [];
	}

	const arrayOfStrings = s.includes(',') ? s.split(',') : [s];
	return arrayOfStrings.map((v) => Number.parseFloat(v)).filter((v) => Number.isNaN(v) === false);
};

// https://phuoc.ng/collection/clipboard/check-if-the-clipboard-api-is-supported/
export const isClipboardApiSupported = () => !!navigator.clipboard?.writeText;

// https://philna.sh/blog/2017/03/14/the-web-share-api/
export const isWebShareApiSupported = () => !!('canShare' in navigator && navigator.share);

export const enumFromStringValue = <T>(enm: { [s: string]: T }, value: string): T | undefined =>
	(Object.values(enm) as unknown as string[]).includes(value) ? (value as unknown as T) : undefined;

export const pluralise = (word: string, count: number) => `${word}${count > 1 ? 's' : ''}`;
