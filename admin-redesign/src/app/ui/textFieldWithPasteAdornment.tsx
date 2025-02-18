import ContentPasteGoIcon from '@mui/icons-material/ContentPasteGo';
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import { type ForwardedRef, forwardRef } from 'react';
import { isClipboardApiSupported } from '../utils';

interface Props {
	pastingDisabled?: boolean;
	onPasteFromClipboard: (pastedText: string) => void;
}

const TextFieldWithPasteAdornment = (props: TextFieldProps & Props, ref: ForwardedRef<HTMLDivElement>) => {
	const { pastingDisabled, onPasteFromClipboard, InputProps, ...rest } = props;

	const onClickPaste = async () => {
		try {
			// This doesn't work with the Safari-only text/uri-list mime type that you get on your clipboard when you copy a link from the iOS Share Sheet
			// onPasteFromClipboard(await navigator.clipboard.readText());

			const clipboardContents = await navigator.clipboard.read();

			for (const item of clipboardContents) {
				// Ordered by preference
				for (const preferredMimeType of ['text/plain', 'text/uri-list', 'text/html']) {
					if (item.types.includes(preferredMimeType)) {
						const blob = await item.getType(preferredMimeType);
						const blobText = await blob.text();
						onPasteFromClipboard(blobText);

						// Abandon after the first valid item we find
						return;
					}
				}
			}
		} catch (err: unknown) {
			/* empty */
		}
	};

	// This is here because the MUI example had it.
	// Ref: https://mui.com/material-ui/react-text-field/#input-adornments
	const handleMouseDownOnClickPaste = (event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
	};

	return (
		<TextField
			ref={ref}
			InputProps={{
				...InputProps,
				endAdornment:
					isClipboardApiSupported() === true && pastingDisabled !== true ? (
						<InputAdornment position="end">
							<IconButton onClick={onClickPaste} onMouseDown={handleMouseDownOnClickPaste} edge="end">
								<ContentPasteGoIcon />
							</IconButton>
						</InputAdornment>
					) : undefined,
			}}
			{...rest}
		/>
	);
};

export default forwardRef(TextFieldWithPasteAdornment);
