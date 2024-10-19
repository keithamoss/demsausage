import { type Action, type StoreEnhancer, type ThunkAction, configureStore } from '@reduxjs/toolkit';
import appReducer from '../features/app/appSlice';
import { sentryInit } from './sentry';
import { api, rtkQueryErrorLogger } from './services/api';
import { eAppEnv, getEnvironment } from './utils';

const Middleware: Array<StoreEnhancer> = [];

if (getEnvironment() !== eAppEnv.DEVELOPMENT) {
	// This should be run as soon as possible
	Middleware.push(sentryInit() as StoreEnhancer);
}

export const store = configureStore({
	reducer: {
		app: appReducer,
		[api.reducerPath]: api.reducer,
	},
	// Adding the api middleware enables caching, invalidation, polling, and other useful features of `rtk-query`.
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware, rtkQueryErrorLogger),
	enhancers: (getDefaultEnhancers) => getDefaultEnhancers().concat(...Middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
