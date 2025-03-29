import {
	Add,
	Approval,
	ChangeHistory,
	DoNotDisturbOn,
	Edit,
	FiberNew,
	Looks,
	Looks3,
	Looks4,
	Looks5,
	Looks6,
	LooksOne,
	LooksTwo,
	QuestionMark,
} from '@mui/icons-material';
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

export const getSubmissionBottomNavIcon = (position: number) => {
	switch (position) {
		case 0:
			return <LooksOne />;
		case 1:
			return <LooksTwo />;
		case 2:
			return <Looks3 />;
		case 3:
			return <Looks4 />;
		case 4:
			return <Looks5 />;
		case 5:
			return <Looks6 />;
		default:
			return <Looks />;
	}
};
