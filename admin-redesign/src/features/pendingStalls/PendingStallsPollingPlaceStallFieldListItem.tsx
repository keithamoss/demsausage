import { AccessTimeFilled, ContentCopy, Description, QuestionMark, Restaurant, Title, Web } from '@mui/icons-material';
import { Alert, IconButton, ListItem, ListItemIcon, ListItemText, Snackbar, styled } from '@mui/material';
import React, { useCallback, useState } from 'react';
import type { PendingStall, StallFoodOptions } from '../../app/services/stalls';
import { mapaThemePrimaryGrey } from '../../app/ui/theme';
import { isClipboardApiSupported } from '../../app/utils';
import { getNomsDescriptiveText, isStallWebsiteValid } from '../pollingPlaces/pollingPlaceHelpers';

const StyledListItem = styled(ListItem)(() => ({ alignItems: 'start' }));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
	marginTop: theme.spacing(0.25),
	paddingLeft: theme.spacing(1),
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
	marginTop: theme.spacing(0),
	'& .MuiListItemText-primary': {
		color: mapaThemePrimaryGrey,
		fontWeight: 700,
	},
}));

const StyledListItemTextSecondaryDiffGreen = {
	backgroundColor: '#ddfae1',
	color: '#3b5338',
	display: 'inline-block',
};

const StyledListItemTextSecondaryDiffRed = {
	backgroundColor: '#fcdfde',
	color: '#b29c96',
	display: 'inline-block',
	// textDecoration: 'line-through',
};

const getFieldIcon = (fieldName: string) => {
	switch (fieldName) {
		case 'noms':
			return <Restaurant sx={{ color: mapaThemePrimaryGrey }} />;
		case 'name':
			return <Title sx={{ color: mapaThemePrimaryGrey }} />;
		case 'description':
			return <Description sx={{ color: mapaThemePrimaryGrey }} />;
		case 'opening_hours':
			return <AccessTimeFilled sx={{ color: mapaThemePrimaryGrey }} />;
		case 'website':
			return <Web sx={{ color: mapaThemePrimaryGrey }} />;
		default:
			return <QuestionMark sx={{ color: mapaThemePrimaryGrey }} />;
	}
};

const getFieldValueForDisplay = (fieldName: string, fieldValue: string | number | StallFoodOptions | undefined) => {
	if (fieldValue === undefined) {
		return undefined;
	}

	if (fieldName === 'noms') {
		return getNomsDescriptiveText(fieldValue as StallFoodOptions);
	}

	if (fieldName === 'website') {
		return typeof fieldValue === 'string' && isStallWebsiteValid(fieldValue) === true ? (
			<a href={fieldValue} target="blank" style={{ color: 'blue' }}>
				{fieldValue}
			</a>
		) : fieldValue !== '' ? (
			<em>Link not valid</em>
		) : (
			<em>Not provided</em>
		);
	}

	return `${fieldValue}` || <em>Not provided</em>;
};

interface Props {
	fieldName: 'noms' | 'name' | 'description' | 'opening_hours' | 'website';
	fieldLabel: string;
	stall: PendingStall;
}

export default function PendingStallsPollingPlaceStallFieldListItem(props: Props) {
	const { fieldLabel, fieldName, stall } = props;

	const [isSuccessSnackbarOpen, setIsSuccessSnackbarOpen] = useState(false);
	const onSuccessSnackbarClose = () => setIsSuccessSnackbarOpen(false);

	const [errorSnackbarMessage, setErrorSnackbarMessage] = useState<string | undefined>(undefined);
	const onErrorSnackbarClose = () => setErrorSnackbarMessage(undefined);

	const fieldValue = fieldName === 'noms' ? getNomsDescriptiveText(stall.noms) : stall[fieldName] || '';

	const fieldDiff = stall.diff?.find((d) => d.field === fieldName);

	const isFieldCopyable = fieldName !== 'noms' && fieldValue !== '';

	const onClickCopyField = useCallback(async () => {
		if (isClipboardApiSupported() === true) {
			try {
				await navigator.clipboard.writeText(fieldValue);
				setIsSuccessSnackbarOpen(true);
			} catch {
				// Rather than messing about trying to query permissions (Firefox and Safari don't support the standard methods), let's just ask for it and assume any errors are permisson denied.
				// Ref: https://stackoverflow.com/questions/64541534/check-whether-user-granted-clipboard-permisssion-or-not
				// Ref: https://stackoverflow.com/questions/75067090/safari-clipboard-permissions-checking
				setErrorSnackbarMessage(`You haven't granted permissions to write to your clipboard yet.`);
			}
		}
	}, [fieldValue]);

	return (
		<React.Fragment>
			<StyledListItem
				disableGutters
				secondaryAction={
					isFieldCopyable === true ? (
						<IconButton edge="end" onClick={onClickCopyField}>
							<ContentCopy />
						</IconButton>
					) : undefined
				}
			>
				<StyledListItemIcon>{getFieldIcon(fieldName)}</StyledListItemIcon>

				<StyledListItemText
					sx={{
						'& .MuiListItemText-secondary': fieldDiff !== undefined ? StyledListItemTextSecondaryDiffGreen : {},
						'& .MuiListItemText-secondary:first-letter': fieldName !== 'website' ? { textTransform: 'capitalize' } : {},
					}}
					primary={fieldLabel}
					secondary={getFieldValueForDisplay(fieldName, stall[fieldName])}
				/>
			</StyledListItem>

			{fieldDiff !== undefined && (
				<StyledListItem disableGutters>
					{/* We're just using it as an empty spacer */}
					<StyledListItemIcon />

					<StyledListItemText
						sx={{
							'& .MuiListItemText-primary': { fontWeight: 500 },
							'& .MuiListItemText-secondary': fieldDiff !== undefined ? StyledListItemTextSecondaryDiffRed : {},
							'& .MuiListItemText-secondary:first-letter':
								fieldName !== 'website' ? { textTransform: 'capitalize' } : {},
						}}
						primary="Previous Submission"
						secondary={getFieldValueForDisplay(fieldName, fieldDiff.old)}
					/>
				</StyledListItem>
			)}

			<Snackbar open={isSuccessSnackbarOpen} autoHideDuration={2000} onClose={onSuccessSnackbarClose}>
				<Alert severity="success" sx={{ width: '100%' }}>
					Field copied
				</Alert>
			</Snackbar>

			<Snackbar open={errorSnackbarMessage !== undefined} autoHideDuration={2000} onClose={onErrorSnackbarClose}>
				<Alert severity="error" sx={{ width: '100%' }}>
					{errorSnackbarMessage}
				</Alert>
			</Snackbar>
		</React.Fragment>
	);
}
