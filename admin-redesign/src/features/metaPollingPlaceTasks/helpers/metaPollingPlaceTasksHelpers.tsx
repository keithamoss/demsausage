import { AddCircle, QuestionMark, TipsAndUpdates, Troubleshoot, WorkspacePremium } from '@mui/icons-material';
import type { ReactElement } from 'react';
import { IMetaPollingPlaceTaskCategory } from '../interfaces/metaPollingPlaceTasksInterfaces';

export const getMetaPollingPlaceTaskCategoryIcon = (category: IMetaPollingPlaceTaskCategory): ReactElement => {
	switch (category) {
		case IMetaPollingPlaceTaskCategory.REVIEW:
			return <Troubleshoot />;
		case IMetaPollingPlaceTaskCategory.QA:
			return <WorkspacePremium />;
		case IMetaPollingPlaceTaskCategory.ENRICHMENT:
			return <AddCircle />;
		case IMetaPollingPlaceTaskCategory.CROWDSOURCING:
			return <TipsAndUpdates />;
		default:
			return <QuestionMark />;
	}
};
