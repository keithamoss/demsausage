import { skipToken } from '@reduxjs/toolkit/query';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { navigateToPollingPlace } from '../../app/routing/navigationHelpers';
import { getIntegerParamOrUndefined } from '../../app/routing/routingHelpers';
import { useGetPollingPlaceByStallIdLookupQuery } from '../../app/services/pollingPlaces';

function StallPermalinkEntrypoint() {
	const params = useParams();
	const navigate = useNavigate();

	const stallId = getIntegerParamOrUndefined(params, 'stall_id');

	const {
		data: pollingPlace,
		isFetching: isFetchingStall,
		isSuccess: isSuccessFetchingStall,
	} = useGetPollingPlaceByStallIdLookupQuery(stallId !== undefined ? stallId : skipToken);

	useEffect(() => {
		if (isFetchingStall === false && isSuccessFetchingStall === true && pollingPlace !== undefined) {
			navigateToPollingPlace(params, navigate, pollingPlace);
		}
	}, [isFetchingStall, isSuccessFetchingStall, navigate, params, pollingPlace]);

	return null;
}

export default StallPermalinkEntrypoint;
