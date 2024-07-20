import AddLocationIcon from '@mui/icons-material/AddLocation';
import InfoIcon from '@mui/icons-material/Info';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import PublicIcon from '@mui/icons-material/Public';
import { Divider, Drawer, List } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { UIMatch, useMatches } from 'react-router-dom';
import { ListItemButtonLink } from '../ui/link';
import { mapaThemePrimaryPurple } from '../ui/theme';

// The page names here must match what's in routes.tsx if we want the link to show as active
const navigationItemsTier1 = [
	{ text: 'Map', path: '/', icon: <PublicIcon /> },
	{
		text: 'Add Stall',
		path: '/add-stall/',
		icon: <AddLocationIcon />,
	},
	{ text: 'Embed The Map', path: '/embed', icon: <InfoIcon /> },
	{ text: 'About', path: '/about', icon: <InfoIcon /> },
	{ text: 'Media', path: '/media', icon: <InfoIcon /> },
	{ text: 'Item 4', path: '/' },
	{ text: 'Item 5', path: '/' },
];

const navigationItemsTier2 = ['Item 5', 'Item 6', 'Item 7'];

interface UIMatchData {
	name?: string;
}

const isThisPageActive = (matches: UIMatch<UIMatchData | undefined, unknown>[], pageName: string) => {
	// The last element that matches and has a data element will be our active page.
	// This only works if routes.tsx gives loader data to each top-level page that matches
	// the name we've assigned it in here.
	return matches.reverse().find((match) => match.data?.name === pageName) !== undefined;
};

interface Props {
	open: boolean;
	onToggleDrawer: (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => void;
}

export default function NavigationDrawer(props: Props) {
	const { open, onToggleDrawer } = props;

	const matches = useMatches() as UIMatch<UIMatchData | undefined, unknown>[];

	return (
		<Drawer open={open} onClose={onToggleDrawer(false)}>
			<Box sx={{ width: 250 }} role="presentation" onClick={onToggleDrawer(false)} onKeyDown={onToggleDrawer(false)}>
				<List>
					{navigationItemsTier1.map((item) => (
						<ListItemButtonLink
							key={item.text}
							icon={item.icon === undefined ? <InboxIcon /> : item.icon}
							colour={isThisPageActive(matches, item.text) === true ? mapaThemePrimaryPurple : undefined}
							primary={item.text}
							to={item.path}
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
