import AddLocationIcon from '@mui/icons-material/AddLocation';
import InfoIcon from '@mui/icons-material/Info';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import PublicIcon from '@mui/icons-material/Public';
import { Divider, Drawer, List } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { ListItemButtonLink } from '../ui/link';

const navigationItemsTier1 = [
	{ text: 'Map', path: '/', icon: <PublicIcon /> },
	{
		text: 'Add Stall',
		path: '/add-stall',
		icon: <AddLocationIcon />,
	},
	{ text: 'About', path: '/about', icon: <InfoIcon /> },
	{ text: 'Item 4', path: '/' },
	{ text: 'Item 5', path: '/' },
];

const navigationItemsTier2 = ['Item 5', 'Item 6', 'Item 7'];

interface Props {
	open: boolean;
	onToggleDrawer: (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => void;
}

export default function NavigationDrawer(props: Props) {
	const { open, onToggleDrawer } = props;

	return (
		<Drawer open={open} onClose={onToggleDrawer(false)}>
			<Box sx={{ width: 250 }} role="presentation" onClick={onToggleDrawer(false)} onKeyDown={onToggleDrawer(false)}>
				<List>
					{navigationItemsTier1.map((item) => (
						<ListItemButtonLink
							key={item.text}
							to={item.path}
							primary={item.text}
							icon={item.icon === undefined ? <InboxIcon /> : item.icon}
						/>
					))}
				</List>

				<Divider />

				<List>
					{navigationItemsTier2.map((text) => (
						<ListItemButtonLink key={text} to="/about" primary={text} />
					))}
				</List>
			</Box>
		</Drawer>
	);
}
