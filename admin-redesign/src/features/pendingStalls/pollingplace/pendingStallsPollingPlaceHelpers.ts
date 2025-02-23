import { Add, Approval, ChangeHistory, DoNotDisturbOn, Edit, FiberNew, QuestionMark } from '@mui/icons-material';
import { PollingPlaceHistoryEventType } from '../../pollingPlaces/pollingPlacesInterfaces';

export const getPollingPlaceHistoryEventIcon = (historyEventType: PollingPlaceHistoryEventType) => {
	switch (historyEventType) {
		case PollingPlaceHistoryEventType.ADDED_DIRECTLY:
			return Add;
		case PollingPlaceHistoryEventType.EDITED_DIRECTLY:
			return ChangeHistory;
		case PollingPlaceHistoryEventType.SUBMISSION_RECEIVED:
			return FiberNew;
		case PollingPlaceHistoryEventType.SUBMISSION_APPROVED:
			return Approval;
		case PollingPlaceHistoryEventType.SUBMISSION_DECLINED:
			return DoNotDisturbOn;
		case PollingPlaceHistoryEventType.SUBMISSION_EDITED:
			return Edit;
		// This a "Just in case" fallback so some icon would be rendered
		default:
			return QuestionMark;
	}
};
