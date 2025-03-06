import { ContentCopy } from '@mui/icons-material';
import { IconButton, ListItem, ListItemIcon, styled } from '@mui/material';
import { useNotifications } from '@toolpad/core';
import { useCallback } from 'react';
import type { PendingStall } from '../../../app/services/stalls';
import { isClipboardApiSupported } from '../../../app/utils';
import {
	type FieldNames,
	getFieldIcon,
	getFieldValue,
	getFreeTextNomsStyledListItemText,
	getNomsStyledListItemText,
	getTextFieldStyledListItemText,
} from './pendingStallsPollingPlaceStallFieldListItemHelpers';

const StyledListItem = styled(ListItem)(() => ({ alignItems: 'start' }));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
	marginTop: theme.spacing(0.25),
	paddingLeft: theme.spacing(1),
}));

interface Props {
	fieldName: FieldNames;
	fieldLabel: string;
	stall: PendingStall;
}

export default function PendingStallsPollingPlaceStallFieldListItem(props: Props) {
	const { fieldLabel, fieldName, stall } = props;

	const notifications = useNotifications();

	const fieldValue = getFieldValue(fieldName, stall);

	const isFieldCopyable = fieldName !== 'noms' && fieldName !== 'email' && fieldValue !== '';

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

			{fieldName === 'noms' && getNomsStyledListItemText(fieldLabel, stall)}

			{fieldName === 'noms.free_text' && getFreeTextNomsStyledListItemText(fieldLabel, stall)}

			{fieldName !== 'noms' &&
				fieldName !== 'noms.free_text' &&
				getTextFieldStyledListItemText(fieldName, fieldLabel, stall)}
		</StyledListItem>
	);
}
