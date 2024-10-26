import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useGetPendingStallsQuery } from '../../app/services/stalls';

const PageWrapper = styled('div')(({ theme }) => ({
	paddingTop: theme.spacing(2),
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
	'& h3:first-of-type': {
		marginTop: theme.spacing(1),
	},
}));

export default function PendingStalls() {
	const {
		data: pendingStalls,
		isLoading: isGetPendingStallsLoading,
		isSuccess: isGetPendingStallsSuccessful,
		isError: isGetPendingStallsErrored,
	} = useGetPendingStallsQuery(undefined, {
		pollingInterval: 3000,
		skipPollingIfUnfocused: true,
	});

	return (
		<React.Fragment>
			<Helmet>
				<title>Pending Stalls | Democracy Sausage</title>
			</Helmet>

			<PageWrapper>
				{isGetPendingStallsSuccessful === true && (
					<Typography variant="h6">We have {pendingStalls.length} pending stalls</Typography>
				)}
			</PageWrapper>
		</React.Fragment>
	);
}
