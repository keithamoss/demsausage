import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';

const bottomNav = 56;

const Root = styled('div')(({ theme }) => ({
	height: '100%',
	paddingBottom: `${bottomNav}px`,
}));

export default function ElectionsManagerRoot() {
	return (
		<Root>
			<Helmet>
				<title>Elections Manager | Democracy Sausage Administration</title>
			</Helmet>

			<Box sx={{ flexGrow: 1 }}>
				<Outlet />
			</Box>
		</Root>
	);
}
