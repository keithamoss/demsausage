import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Helmet } from 'react-helmet-async';
import { Outlet, useParams } from 'react-router-dom';
import ErrorElement from '../../ErrorElement';
import { useGetElectionsQuery } from '../../app/services/elections';
import { WholeScreenLoadingIndicator } from '../../app/ui/wholeScreenLoadingIndicator';

const bottomNav = 56;

const Root = styled('div')(({ theme }) => ({
	height: '100%',
	paddingBottom: `${bottomNav}px`,
}));

export default function PollingPlaceEditor() {
	const params = useParams();

	const { isLoading: isGetElectionsLoading, isError: isGetElectionsErrored } = useGetElectionsQuery();

	if (isGetElectionsLoading === true) {
		return <WholeScreenLoadingIndicator />;
	}

	if (isGetElectionsErrored === true) {
		return <ErrorElement />;
	}

	// If we've loaded elections successfully let everything continue as normalscreen.
	return (
		<Root>
			<Helmet>
				<title>Polling Places | Democracy Sausage Administration</title>
			</Helmet>

			<Box sx={{ flexGrow: 1 }}>
				<Outlet />
			</Box>
		</Root>
	);
}
