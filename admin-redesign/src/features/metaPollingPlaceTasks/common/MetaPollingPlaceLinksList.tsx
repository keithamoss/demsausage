import { Edit } from '@mui/icons-material';
import { IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { getMetaPollingPlaceLinkTypeIcon } from '../helpers/metaPollingPlaceLinksHelpers';
import type { IMetaPollingPlace } from '../interfaces/metaPollingPlaceInterfaces';
import type { IMetaPollingPlaceLink } from '../interfaces/metaPollingPlaceLinksInterfaces';

interface Props {
	metaPollingPlace: IMetaPollingPlace;
	onClickManage: (link: IMetaPollingPlaceLink) => () => void;
}

function MetaPollingPlaceLinksList(props: Props) {
	const { metaPollingPlace, onClickManage } = props;

	const onClickLink = (url: string) => () => window.open(url, '_blank');

	return (
		<List disablePadding>
			{metaPollingPlace.links.map((link) => (
				<ListItem
					key={link.id}
					secondaryAction={
						<IconButton edge="end" onClick={onClickManage(link)}>
							<Edit />
						</IconButton>
					}
				>
					<ListItemIcon>{getMetaPollingPlaceLinkTypeIcon(link.type)}</ListItemIcon>

					<ListItemButton onClick={onClickLink(link.url)} disableGutters sx={{ pr: '16px !important' }}>
						<ListItemText
							sx={{
								'& .MuiListItemText-primary': {
									overflow: 'hidden',
									whiteSpace: 'nowrap',
									textOverflow: 'ellipsis',
								},
							}}
							primary={link.url}
						/>
					</ListItemButton>
				</ListItem>
			))}
		</List>
	);
}

export default MetaPollingPlaceLinksList;
