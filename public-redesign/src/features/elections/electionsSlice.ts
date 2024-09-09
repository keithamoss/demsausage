import { createSelector } from '@reduxjs/toolkit';
import { orderBy } from 'lodash-es';
import { electionsAdapter, electionsApi, initialElectionsState } from '../../app/services/elections';
import { RootState } from '../../app/store';
import { isElectionLive } from './electionHelpers';

// Calling `someEndpoint.select(someArg)` generates a new selector that will return
// the query result object for a query with those parameters.
// To generate a selector for a specific query argument, call `select(theQueryArg)`.
// In this case, the users query has no params, so we don't pass anything to select()
export const selectElectionsResult = electionsApi.endpoints.getElections.select();

const selectElectionsData = createSelector(selectElectionsResult, (electionsResult) => electionsResult.data);

export const { selectAll: selectAllElections, selectById: selectElectionById } = electionsAdapter.getSelectors(
	(state: RootState) => selectElectionsData(state) ?? initialElectionsState,
);

export const selectAllElectionsSorted = createSelector(selectAllElections, (elections) =>
	orderBy(elections, (e) => e.election_day, ['desc']),
);

export const selectActiveElections = createSelector(selectAllElections, (elections) =>
	elections.filter((e) => isElectionLive(e) === true),
);

export const selectActiveElectionsSorted = createSelector(selectActiveElections, (elections) =>
	orderBy(elections, (e) => e.election_day, ['asc']),
);
