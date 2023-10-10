import AddLocationIcon from '@mui/icons-material/AddLocation';
import InfoIcon from '@mui/icons-material/Info';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
// import MoreVertIcon from "@mui/icons-material/MoreVert";
import PublicIcon from '@mui/icons-material/Public';
import ListItemText from '@mui/material/ListItemText';
import * as React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

interface Props {
	open: boolean;
	onToggle: any;
}

// function Router(props: { children?: React.ReactNode }) {
//   const { children } = props;
//   if (typeof window === "undefined") {
//     return <StaticRouter location="/drafts">{children}</StaticRouter>;
//   }

//   return (
//     <MemoryRouter initialEntries={["/drafts"]} initialIndex={0}>
//       {children}
//     </MemoryRouter>
//   );
// }

interface ListItemLinkProps {
	icon?: React.ReactElement;
	primary: string;
	to: string;
}

const Link = React.forwardRef<HTMLAnchorElement, RouterLinkProps>(function Link(itemProps, ref) {
	return <RouterLink ref={ref} {...itemProps} role={undefined} />;
});

function ListItemLink(props: ListItemLinkProps) {
	const { icon, primary, to } = props;

	return (
		<li>
			<ListItem button component={Link} to={to}>
				{icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
				<ListItemText primary={primary} />
			</ListItem>
		</li>
	);
}

export default function SideMenuDrawer(props: Props) {
	const { open, onToggle } = props;

	return (
		<Drawer open={open} onClose={onToggle}>
			<Box sx={{ width: 250 }} role="presentation" onClick={onToggle} onKeyDown={onToggle}>
				<List>
					{[
						{ text: 'Map', path: '/', icon: <PublicIcon /> },
						{
							text: 'Add Stall',
							path: '/add-stall',
							icon: <AddLocationIcon />,
						},
						{ text: 'About', path: '/about', icon: <InfoIcon /> },
						{ text: 'Item 4', path: '/' },
						{ text: 'Item 5', path: '/' },
					].map((item, index) => (
						<ListItemLink
							key={item.text}
							to={item.path}
							primary={item.text}
							icon={item.icon === undefined ? <InboxIcon /> : item.icon}
						/>
					))}
				</List>
				<Divider />
				<List>
					{['Item 5', 'Item 6', 'Item 7'].map((text, index) => (
						<ListItemLink key={text} to="/about" primary={text} />
					))}
				</List>
			</Box>
		</Drawer>
	);
}
