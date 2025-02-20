import { Storefront } from '@mui/icons-material';
import BallotIcon from '@mui/icons-material/Ballot';
import CampaignIcon from '@mui/icons-material/Campaign';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Box } from '@mui/system';
import type React from 'react';
import { type UIMatch, useMatches } from 'react-router-dom';
import { sentryFeedback } from '../sentry';
import { ListItemButtonLink } from '../ui/link';
import { mapaThemePrimaryPurple } from '../ui/theme';

// The page names here must match what's in routes.tsx if we want the link to show as active
const navigationItemsTier1 = [
	{ text: 'Pending Submissions', path: '/', icon: <Storefront /> },
	{ text: 'Polling Places', path: '/polling-places/', icon: <MapsHomeWorkIcon /> },
	{ text: 'Elections', path: '/elections/', icon: <BallotIcon /> },
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
						/>
					))}

					<ListItemButton>
						<ListItemIcon>
							<CampaignIcon />
						</ListItemIcon>

						<ListItemText primary="Send Bug Report" onClick={onClickSendBugReport} />
					</ListItemButton>
				</List>
			</Box>
		</Drawer>
	);
}
