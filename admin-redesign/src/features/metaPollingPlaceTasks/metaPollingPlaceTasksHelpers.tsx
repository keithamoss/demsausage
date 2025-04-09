import { AddCircle, QuestionMark, TipsAndUpdates, Troubleshoot, WorkspacePremium } from '@mui/icons-material';
import type { ReactElement } from 'react';
import { MetaPollingPlaceTaskCategory } from './metaPollingPlaceTasksInterfaces';

export const getMetaPollingPlaceTaskCategoryIcon = (category: MetaPollingPlaceTaskCategory): ReactElement => {
	switch (category) {
		case MetaPollingPlaceTaskCategory.REVIEW:
			return <Troubleshoot />;
		case MetaPollingPlaceTaskCategory.QA:
			return <WorkspacePremium />;
		case MetaPollingPlaceTaskCategory.ENRICHMENT:
			return <AddCircle />;
		case MetaPollingPlaceTaskCategory.CROWDSOURCING:
			return <TipsAndUpdates />;
		default:
			return <QuestionMark />;
	}
};
