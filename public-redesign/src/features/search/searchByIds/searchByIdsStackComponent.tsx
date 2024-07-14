import { Alert, AlertTitle } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';
import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks/store';
import { getStringParamOrEmptyString } from '../../../app/routing/routingHelpers';
import { Election } from '../../../app/services/elections';
import { useGetPollingPlaceByIdsLookupQuery } from '../../../app/services/pollingPlaces';
import { getCSVStringsAsFloats } from '../../../app/utils';
import { selectMapFilterSettings } from '../../app/appSlice';
import { doesPollingPlaceSatisifyFilterCriteria } from '../../map/mapFilterHelpers';
import { IPollingPlace } from '../../pollingPlaces/pollingPlacesInterfaces';
import { onViewOnMap } from '../searchBarHelpers';
import SearchResultsPollingPlaceCard from '../shared/searchResultsPollingPlaceCard';
import SearchByIdsResultsContainer from './searchResultsContainer/searchByIdsResultsContainer';

interface Props {
	election: Election;
	onChoosePollingPlace: (pollingPlace: IPollingPlace) => void;
}

export default function SearchByIdsStackComponent(props: Props) {
	const { election, onChoosePollingPlace } = props;

	const params = useParams();
	const navigate = useNavigate();

	const urlPollingPlaceIds = getCSVStringsAsFloats(getStringParamOrEmptyString(params, 'polling_place_ids'));

	const mapFilterSettings = useAppSelector((state) => selectMapFilterSettings(state));

	// ######################
	// Polling Place By Ids Query
	// ######################
	const {
		data: pollingPlaceByIdsResult,
		error: errorFetchingPollingPlacesByIds,
		isFetching: isFetchingPollingPlacesByIds,
		isSuccess: isSuccessFetchingPollingPlacesByIds,
	} = useGetPollingPlaceByIdsLookupQuery(
		urlPollingPlaceIds.length >= 1 ? { electionId: election.id, pollingPlaceIds: urlPollingPlaceIds } : skipToken,
	);

	const pollingPlaceNearbyResultsFiltered =
		isFetchingPollingPlacesByIds === false &&
		isSuccessFetchingPollingPlacesByIds === true &&
		pollingPlaceByIdsResult !== undefined
			? pollingPlaceByIdsResult.filter(
					(pollingPlace) => doesPollingPlaceSatisifyFilterCriteria(pollingPlace, mapFilterSettings) === true,
				)
			: undefined;

	const onClickViewOnMap = useCallback(
		() => onViewOnMap(params, navigate, pollingPlaceNearbyResultsFiltered),
		[params, navigate, pollingPlaceNearbyResultsFiltered],
	);
	// ######################
	// Polling Place By Ids Query (End)
	// ######################

	return (
		<React.Fragment>
			{/* Handles not found and all other types of error */}
			{errorFetchingPollingPlacesByIds !== undefined && (
				<Alert severity="error">
					<AlertTitle>Sorry, we&lsquo;ve hit a snag</AlertTitle>
					Something went awry when we tried to load your list of polling places.
				</Alert>
			)}

			{pollingPlaceNearbyResultsFiltered !== undefined && (
				<SearchByIdsResultsContainer
					numberOfResults={pollingPlaceNearbyResultsFiltered.length}
					pollingPlacesLoaded={election.polling_places_loaded}
					onViewOnMap={onClickViewOnMap}
				>
					{pollingPlaceNearbyResultsFiltered.map((pollingPlace) => (
						<SearchResultsPollingPlaceCard
							key={pollingPlace.id}
							pollingPlace={pollingPlace}
							onChoosePollingPlaceLabel="Learn More"
							onChoosePollingPlace={onChoosePollingPlace}
						/>
					))}
				</SearchByIdsResultsContainer>
			)}
		</React.Fragment>
	);
}
