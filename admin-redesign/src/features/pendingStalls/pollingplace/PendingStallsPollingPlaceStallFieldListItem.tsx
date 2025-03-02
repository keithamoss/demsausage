import {
	AccessTimeFilled,
	ContentCopy,
	Description,
	More,
	QuestionMark,
	Restaurant,
	Title,
	Web,
} from '@mui/icons-material';
import { IconButton, ListItem, ListItemIcon, ListItemText, styled } from '@mui/material';
import { useNotifications } from '@toolpad/core';
import { isEqual } from 'lodash-es';
import React, { useCallback } from 'react';
import type { PendingStall, StallFoodOptions } from '../../../app/services/stalls';
import { mapaThemePrimaryGrey } from '../../../app/ui/theme';
import { isClipboardApiSupported } from '../../../app/utils';
import { getNomsDescriptiveTextWithoutFreeText, isStallWebsiteValid } from '../../pollingPlaces/pollingPlaceHelpers';

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
		case 'noms.free_text':
			return <More sx={{ color: mapaThemePrimaryGrey }} />;
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

const getFieldValue = (
	fieldName: 'noms' | 'name' | 'description' | 'opening_hours' | 'website' | 'noms.free_text',
	stall: PendingStall,
) => {
	if (fieldName === 'noms') {
		return getNomsDescriptiveTextWithoutFreeText(stall.noms);
	}

	if (fieldName === 'noms.free_text') {
		return stall.noms.free_text || '';
	}

	return stall[fieldName] || '';
};

const getFieldValueForDisplay = (fieldName: string, fieldValue: string | number | StallFoodOptions | undefined) => {
	if (fieldValue === undefined) {
		return undefined;
	}

	// Support translating noms to text for the diff'd view (the current view already gets translated by getFieldValue())
	if (fieldName === 'noms' && typeof fieldValue !== 'string') {
		return getNomsDescriptiveTextWithoutFreeText(fieldValue as StallFoodOptions);
	}

	// Support translating free_text noms to text for the diff'd view (the current view already gets translated by getFieldValue())
	if (fieldName === 'noms.free_text' && typeof fieldValue !== 'string') {
		return (fieldValue as StallFoodOptions).free_text;
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

const getFieldDiff = (
	fieldName: 'noms' | 'name' | 'description' | 'opening_hours' | 'website' | 'noms.free_text',
	stall: PendingStall,
) => {
	const fieldDiff = stall.diff?.find((d) => d.field === (fieldName === 'noms.free_text' ? 'noms' : fieldName));

	if (fieldDiff === undefined) {
		return undefined;
	}

	if (fieldName === 'noms') {
		const { free_text: free_text_old, ...restOld } = fieldDiff.old as StallFoodOptions;
		const { free_text: free_text_new, ...restNew } = fieldDiff.new as StallFoodOptions;

		return isEqual(restOld, restNew) === true ? undefined : fieldDiff;
	}

	if (fieldName === 'noms.free_text') {
		return (fieldDiff.old as StallFoodOptions).free_text === (fieldDiff.new as StallFoodOptions).free_text
			? undefined
			: fieldDiff;
	}

	return fieldDiff;
};

interface Props {
	fieldName: 'noms' | 'name' | 'description' | 'opening_hours' | 'website' | 'noms.free_text';
	fieldLabel: string;
	stall: PendingStall;
}

export default function PendingStallsPollingPlaceStallFieldListItem(props: Props) {
	const { fieldLabel, fieldName, stall } = props;

	const notifications = useNotifications();

	const fieldValue = getFieldValue(fieldName, stall);

	const fieldDiff = getFieldDiff(fieldName, stall);

	const isFieldCopyable = fieldName !== 'noms' && fieldValue !== '';

	const onClickCopyField = useCallback(async () => {
		if (isClipboardApiSupported() === true) {
			try {
				await navigator.clipboard.writeText(fieldValue);

				notifications.show('Field copied', {
					severity: 'success',
					autoHideDuration: 2000,
				});
			} catch {
				// Rather than messing about trying to query permissions (Firefox and Safari don't support the standard methods), let's just ask for it and assume any errors are permisson denied.
				// Ref: https://stackoverflow.com/questions/64541534/check-whether-user-granted-clipboard-permisssion-or-not
				// Ref: https://stackoverflow.com/questions/75067090/safari-clipboard-permissions-checking
				notifications.show("You haven't granted permissions to write to your clipboard yet.", {
					severity: 'error',
					autoHideDuration: 2000,
				});
			}
		}
	}, [fieldValue, notifications.show]);

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
					secondary={getFieldValueForDisplay(fieldName, fieldValue)}
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
		</React.Fragment>
	);
}
