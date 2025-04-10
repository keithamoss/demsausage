import { Facebook, Link, QuestionMark, Verified } from '@mui/icons-material';
import type { ReactElement } from 'react';
import { IMetaPollingPlaceLinkType } from '../interfaces/metaPollingPlaceLinksInterfaces';

export const getMetaPollingPlaceLinkTypeIcon = (category: IMetaPollingPlaceLinkType): ReactElement => {
	switch (category) {
		case IMetaPollingPlaceLinkType.OFFICIAL:
			return <Verified />;
		case IMetaPollingPlaceLinkType.FACEBOOK:
			return <Facebook />;
		case IMetaPollingPlaceLinkType.OTHER:
			return <Link />;
		default:
			return <QuestionMark />;
	}
};
