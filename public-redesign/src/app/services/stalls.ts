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
	polling_place?: number; // Elections without official polling places loaded don't have polling place ids
	location_info?: IStallLocationInfo;
	submitter_type: StallSubmitterType;
}

export interface NewStallOwner extends StallOwnerModifiableProps {
	election: number;
	polling_place?: number; // Elections without official polling places loaded don't have polling place ids
	location_info?: IStallLocationInfo;
	submitter_type: StallSubmitterType;
}

// For some reason elections with official polling places loaded still need this to be sent.
// No idea why...it's on the list to untangle during the admin redesign.
export interface IStallLocationInfo {
	geom: {
		type: string;
		coordinates: [number, number];
	};
	name: string;
	address: string;
	state: string;
}

export interface Stall extends StallOwnerModifiableProps {
	id: number;
	// @TODO We temporarily added this for the preliminary EditStall work, but I'm not sure if it's present on the interface for other occurences. Also, it should be called election_id.
	election: number;
}

// type StallsResponse = Stall[];

export const stallsAdapter = createEntityAdapter<Stall>();

const initialState = stallsAdapter.getInitialState();
export { initialState as initialStallsState };

export const stallsApi = api.injectEndpoints({
	endpoints: (builder) => ({
		// @TODO Should Stall inherit from NewStallOwner instead or will that bugger up the expectations of other places that use Stall?
		// polling_place is an object, not a number
		// location_info is null, not undefined
		// submitter_type is not present
		// status is missing
		getStall: builder.query<Stall, { stallId: number; token: string; signature: string }>({
			query: ({ stallId, token, signature }) => ({
				url: `stalls/${stallId}/`,
				params: { token, signature },
			}),
		}),
		addStall: builder.mutation<{}, NewStallTipOff | NewStallOwner>({
			query: (stall) => ({
				url: 'stalls/',
				method: 'POST',
				body: stall,
			}),
		}),
	}),
});

export const { useGetStallQuery, useAddStallMutation } = stallsApi;
