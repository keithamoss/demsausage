import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { forwardRef } from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

const Link = forwardRef<HTMLAnchorElement, RouterLinkProps>(function Link(itemProps, ref) {
	return <RouterLink ref={ref} {...itemProps} role={undefined} />;
});

interface ListItemLinkProps {
	icon?: React.ReactElement;
	primary: string;
	to: string;
}

export function ListItemButtonLink(props: ListItemLinkProps) {
	const { icon, primary, to } = props;

	return (
		<li>
			<ListItemButton component={Link} to={to}>
				{icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
				<ListItemText primary={primary} />
			</ListItemButton>
		</li>
	);
}
