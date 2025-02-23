import AddIcon from '@mui/icons-material/Add';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import DeleteIcon from '@mui/icons-material/Delete';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { type IPollingPlaceNomsHistory, eNomsHistoryChangeType } from './pollingPlacesInterfaces';

export const getNomsHistoryIcon = (historyItem: IPollingPlaceNomsHistory) => {
	switch (historyItem.history_type) {
		case eNomsHistoryChangeType.ADDED:
			return AddIcon;

		case eNomsHistoryChangeType.EDITED:
			return historyItem.changed_fields?.includes('deleted') ? DeleteIcon : ChangeHistoryIcon;

		// Note: We don't need to handle eNomsHistoryChangeType.DELETED because we don't actually allow direct deletions.
		// This a "Just in case" fallback so some icon would be rendered
		default:
			return QuestionMarkIcon;
	}
};

export const getNomsHistoryChangeFieldsString = (historyItem: IPollingPlaceNomsHistory) => {
	if (historyItem.changed_fields !== undefined && historyItem.changed_fields.length >= 0) {
		if (historyItem.changed_fields.length === 1) {
			return historyItem.changed_fields[0];
		}

		if (historyItem.changed_fields.length === 2) {
			return historyItem.changed_fields.join(' and ');
		}

		if (historyItem.changed_fields.length > 2) {
			const lastItem = [...historyItem.changed_fields].splice(-1);
			return `${historyItem.changed_fields.join(', ')}, and ${lastItem}`;
		}
	}

	return 'Unknown';
};
