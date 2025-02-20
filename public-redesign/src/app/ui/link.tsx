import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { forwardRef } from 'react';
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom';

const Link = forwardRef<HTMLAnchorElement, RouterLinkProps>(function Link(itemProps, ref) {
	return <RouterLink ref={ref} {...itemProps} />;
});

interface ListItemLinkProps {
	icon?: React.ReactElement;
	colour?: string;
	backgroundColour?: string;
	primary: string;
	to: string;
	target?: string;
}

export function ListItemButtonLink(props: ListItemLinkProps) {
	const { icon, colour, backgroundColour, primary, to, target } = props;

	return (
		<li>
			<ListItemButton
				component={Link}
				to={to}
				target={target}
				sx={{ color: colour, backgroundColor: backgroundColour }}
			>
				{icon ? <ListItemIcon sx={{ color: colour }}>{icon}</ListItemIcon> : null}
				<ListItemText primary={primary} />
			</ListItemButton>
		</li>
	);
}
