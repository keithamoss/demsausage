import { Facebook, Groups, Link, Newspaper, Verified } from '@mui/icons-material';
import type { ReactElement } from 'react';
import { IMetaPollingPlaceLinkType } from '../interfaces/metaPollingPlaceLinksInterfaces';

export const getMetaPollingPlaceLinkTypeIcon = (category: IMetaPollingPlaceLinkType): ReactElement => {
	switch (category) {
		case IMetaPollingPlaceLinkType.OFFICIAL:
			return <Verified />;
		case IMetaPollingPlaceLinkType.FACEBOOK:
			return <Facebook />;
		case IMetaPollingPlaceLinkType.P_AND_C:
			return <Groups />;
		case IMetaPollingPlaceLinkType.NEWSLETTER:
			return <Newspaper />;
		case IMetaPollingPlaceLinkType.OTHER:
			return <Link />;
	}
};
