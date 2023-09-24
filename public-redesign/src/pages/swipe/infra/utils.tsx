// Modified from https://stackoverflow.com/a/8817473
export const deepValue = (obj: object, searchPath: string) => {
	const path = searchPath.split('.');
	for (let i = 0, len = path.length; i < len; i += 1) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore-next-line
		if (obj[path[i]] === null) {
			return null;
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore-next-line
		if (obj[path[i]] === undefined) {
			return undefined;
		}
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore-next-line
		// eslint-disable-next-line no-param-reassign
		obj = obj[path[i]];
	}
	return obj;
};

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
			let left;
			if (str.substring(p, p + 1) === '-') {
				left = str.substring(0, p + 1);
			} else {
				left = str.substring(0, p);
			}
			const right = str.substring(p + 1);
			// eslint-disable-next-line no-param-reassign
			replaceCount += 1;
			const [newText, newReplaceCount] = stringDivider(right, width, spaceReplacer, replaceCount);
			return [left + spaceReplacer + newText, newReplaceCount];
		}
	}
	return [str, replaceCount];
}
