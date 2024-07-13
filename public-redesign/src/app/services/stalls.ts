import { createEntityAdapter } from '@reduxjs/toolkit';
import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';
import { api } from './api';

export enum StallSubmitterType {
	Owner = 'owner',
	TipOff = 'tipoff',
}

export interface StallFoodOptions {
	bbq?: boolean;
	cake?: boolean;
	vego?: boolean;
	halal?: boolean;
	bacon_and_eggs?: boolean;
	coffee?: boolean;
	free_text?: string;
}

export type StallFoodOptionsErrors = Merge<
	FieldError,
	FieldErrorsImpl<{
		bbq: NonNullable<boolean | undefined>;
		cake: NonNullable<boolean | undefined>;
		vego: NonNullable<boolean | undefined>;
		halal: NonNullable<boolean | undefined>;
		bacon_and_eggs: NonNullable<boolean | undefined>;
		coffee: NonNullable<boolean | undefined>;
		free_text: string;
	}>
>;

export interface StallTipOffModifiableProps {
	noms: StallFoodOptions;
	email: string;
}

export interface StallOwnerModifiableProps extends StallTipOffModifiableProps {
	name: string;
	description: string;
	opening_hours?: string;
	website?: string;
}

export interface NewStallTipOff extends StallTipOffModifiableProps {
	election: number;
	polling_place: number;
	submitter_type: StallSubmitterType;
}

export interface NewStallOwner extends StallOwnerModifiableProps {
	election: number;
	polling_place: number;
	submitter_type: StallSubmitterType;
}

// export interface IStallLocationInfo {
// 	id?: number; // An id is present if election.polling_places_loaded is True
// 	geom: {
// 		type: string;
// 		coordinates: [number, number];
// 	};
// 	name: string;
// 	address: string;
// 	state: string;
// }

// export interface IStallPollingPlaceInfo {
// 	id: number;
// 	name: string;
// 	premises: string;
// 	address: string;
// 	state: string;
// }

// export enum StallStatus {
// 	PENDING = 'Pending',
// 	APPROVED = 'Approved',
// 	DECLINED = 'Declined',
// }

// export interface IStall {
// 	id: number;
// 	name: string;
// 	description: string;
// 	opening_hours: string;
// 	website: string;
// 	noms: INoms;
// 	email: string;
// 	election_id: number;
// 	location_info: IStallLocationInfo | null;
// 	polling_place: IStallPollingPlaceInfo | null;
// }

// export interface IPollingPlaceStall {
// 	noms: INoms;
// 	name: string;
// 	description: string;
// 	opening_hours: string;
// 	favourited: boolean;
// 	website: string;
// 	extra_info: string;
// 	first_report: string | null; // Datetime
// 	latest_report: string | null; // Datetime
// 	source: string;
// }

export interface Stall extends StallOwnerModifiableProps {
	id: number;
}

// type StallsResponse = Stall[];

export const stallsAdapter = createEntityAdapter<Stall>();

const initialState = stallsAdapter.getInitialState();
export { initialState as initialStallsState };

export const stallsApi = api.injectEndpoints({
	endpoints: (builder) => ({
		addStall: builder.mutation<{}, NewStallTipOff | NewStallOwner>({
			query: (stall) => ({
				url: 'stalls/',
				method: 'POST',
				body: stall,
			}),
		}),
	}),
});

export const { useAddStallMutation } = stallsApi;
