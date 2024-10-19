import AddLocationIcon from '@mui/icons-material/AddLocation';
import BarChartIcon from '@mui/icons-material/BarChart';
import CampaignIcon from '@mui/icons-material/Campaign';
import CodeIcon from '@mui/icons-material/Code';
import EmailIcon from '@mui/icons-material/Email';
import FacebookIcon from '@mui/icons-material/Facebook';
import InfoIcon from '@mui/icons-material/Info';
import InstagramIcon from '@mui/icons-material/Instagram';
import LayersIcon from '@mui/icons-material/Layers';
import PublicIcon from '@mui/icons-material/Public';
import StoreIcon from '@mui/icons-material/Store';
import TvIcon from '@mui/icons-material/Tv';
import TwitterIcon from '@mui/icons-material/Twitter';
import { Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Box } from '@mui/system';
import type React from 'react';
import { type UIMatch, useMatches } from 'react-router-dom';
import { sentryFeedback } from '../sentry';
import { ListItemButtonLink } from '../ui/link';
import { mapaThemePrimaryPurple } from '../ui/theme';

// The page names here must match what's in routes.tsx if we want the link to show as active
const navigationItemsTier1 = [
	{ text: 'Map', path: '/', icon: <PublicIcon /> },
	{ text: 'Add Stall', path: '/add-stall/', icon: <AddLocationIcon /> },
	{ text: 'Elections', path: '/elections', icon: <LayersIcon /> },
	{ text: 'Stats', path: '/sausagelytics/', icon: <BarChartIcon /> },
	{ text: 'Embed The Map', path: '/embed', icon: <CodeIcon /> },
	{ text: 'About and FAQs', path: '/about', icon: <InfoIcon /> },
	{ text: 'Media', path: '/media', icon: <TvIcon /> },
	{
		text: 'Redbubble Store',
		path: 'https://www.redbubble.com/people/demsausage/shop',
		icon: <StoreIcon />,
		target: '_blank',
	},
];

const navigationItemsTier2 = [
	{ text: 'Email', path: 'mailto:ausdemocracysausage@gmail.com', icon: <EmailIcon /> },
	{ text: 'Twitter', path: 'https://twitter.com/DemSausage', icon: <TwitterIcon /> },
	{ text: 'Facebook', path: 'https://www.facebook.com/AusDemocracySausage', icon: <FacebookIcon /> },
	{ text: 'Instagram', path: 'https://www.instagram.com/ausdemocracysausage/', icon: <InstagramIcon /> },
];

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

	const onClickSendBugReport = async () => {
		const form = await sentryFeedback.createForm();
		form.appendToDom();
		form.open();
	};

	return (
		<Drawer open={open} onClose={onToggleDrawer(false)}>
			<Box sx={{ width: 250 }} role="presentation" onClick={onToggleDrawer(false)} onKeyDown={onToggleDrawer(false)}>
				<List>
					{navigationItemsTier1.map((item) => (
						<ListItemButtonLink
							key={item.text}
							icon={item.icon}
							colour={isThisPageActive(matches, item.text) === true ? mapaThemePrimaryPurple : undefined}
							primary={item.text}
							to={item.path}
							target={item.target}
						/>
					))}

					<ListItemButton>
						<ListItemIcon>
							<CampaignIcon />
						</ListItemIcon>

						<ListItemText primary="Send Bug Report" onClick={onClickSendBugReport} />
					</ListItemButton>
				</List>

				<Divider />

				<List>
					{navigationItemsTier2.map((item) => (
						<ListItemButtonLink key={item.text} icon={item.icon} primary={item.text} to={item.path} target="_blank" />
					))}
				</List>
			</Box>
		</Drawer>
	);
}
