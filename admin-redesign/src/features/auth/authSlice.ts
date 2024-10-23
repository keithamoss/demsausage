import { createSelector } from '@reduxjs/toolkit';
import { authApi } from '../../app/services/auth';

export const selectCheckLoginStateResult = authApi.endpoints.checkLoginStatus.select();

export const selectUser = createSelector(selectCheckLoginStateResult, (result) => result?.data?.user ?? null);

export const isUserLoggedIn = createSelector(
	selectCheckLoginStateResult,
	(result) => result?.data?.is_logged_in ?? undefined,
);
