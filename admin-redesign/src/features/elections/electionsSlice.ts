import { createSelector } from '@reduxjs/toolkit';
import { electionsAdapter, electionsApi, initialElectionsState } from '../../app/services/elections';
import type { RootState } from '../../app/store';

// Calling `someEndpoint.select(someArg)` generates a new selector that will return
// the query result object for a query with those parameters.
// To generate a selector for a specific query argument, call `select(theQueryArg)`.
// In this case, the users query has no params, so we don't pass anything to select()
export const selectElectionsResult = electionsApi.endpoints.getElections.select();

const selectElectionsData = createSelector(selectElectionsResult, (electionsResult) => electionsResult.data);

export const { selectAll: selectAllElections, selectById: selectElectionById } = electionsAdapter.getSelectors(
	(state: RootState) => selectElectionsData(state) ?? initialElectionsState,
);

export const selectVisibleElections = createSelector(selectAllElections, (elections) =>
	elections.filter((e) => e.is_hidden === false),
);
