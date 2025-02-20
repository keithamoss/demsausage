import { useEffect, useRef } from 'react';

// https://stackoverflow.com/a/64140271
export const useUnmount = (fn: () => void) => {
	const fnRef = useRef(fn);
	fnRef.current = fn;

	useEffect(() => () => fnRef.current(), []);
};
