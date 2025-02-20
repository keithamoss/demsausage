import { Dialog, type DialogProps, Slide } from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import type React from 'react';
import { forwardRef, useEffect, useRef } from 'react';

import { useUnmount } from '../hooks/useUnmount';
import { defaultAppBarColour, defaultNakedNonFullScreenDialogColour, getThemeColour, setThemeColour } from './theme';

const Transition = forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement;
	},
	ref: React.Ref<unknown>,
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

interface Props {
	onClose?: () => void;
	children: React.ReactNode;
	dialogProps?: Partial<DialogProps>;
	transitionProps?: Partial<TransitionProps>;
	themeColour?: string;
}
export const DialogWithTransition = ({
	onClose,
	children,
	dialogProps,
	transitionProps,
	themeColour = dialogProps?.fullScreen === false ? defaultNakedNonFullScreenDialogColour : defaultAppBarColour,
}: Props) => {
	const previousThemeColourRef = useRef<string | undefined>();
	// This enteredRef never quite worked. It's goal was to stop seeing the brief flash of
	// the default creamy white/grey colour when switching between two layers of dialogs.
	// const enteredRef = useRef(false);

	useEffect(() => {
		previousThemeColourRef.current = getThemeColour();
	}, []);

	const onDialogClose = () => {
		if (previousThemeColourRef.current !== undefined) {
			setThemeColour(previousThemeColourRef.current);
		}

		if (onClose !== undefined) {
			onClose();
		}
	};

	useUnmount(() => {
		if (
			/*enteredRef.current === true &&*/
			previousThemeColourRef.current !== undefined
		) {
			setThemeColour(previousThemeColourRef.current);
		}
	});

	return (
		<Dialog
			fullScreen
			open={true}
			onClose={onDialogClose}
			transitionDuration={0}
			TransitionComponent={Transition}
			TransitionProps={{
				...transitionProps,
				onEntered: (node: HTMLElement, isAppearing: boolean) => {
					if (dialogProps?.fullScreen !== false) {
						setThemeColour(themeColour);
						// enteredRef.current = true;
					}

					if (transitionProps?.onEntered !== undefined) {
						transitionProps.onEntered(node, isAppearing);
					}
				},
				// This works better with non-full screen dialogs than onEntered
				addEndListener: (node: HTMLElement, done: () => void) => {
					if (dialogProps?.fullScreen === false) {
						setThemeColour(themeColour);
						// enteredRef.current = true;
					}

					if (transitionProps?.addEndListener !== undefined) {
						transitionProps.addEndListener(node, done);
					}
				},
			}}
			{...dialogProps}
		>
			{children}
		</Dialog>
	);
};
