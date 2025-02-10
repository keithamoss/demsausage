import { createEntityAdapter } from '@reduxjs/toolkit';
import type { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';
import type {
	IPollingPlaceStall,
	IPollingPlaceStubForStalls,
} from '../../features/pollingPlaces/pollingPlacesInterfaces';
import { api } from './api';

export enum StallSubmitterType {
	Owner = 'owner',
	TipOff = 'tipoff',
	TipOffRunOut = 'tipoff_run_out',
	TipOffRedCrossOfShame = 'tipoff_red_cross_of_shame',
}

export enum StallTipOffSource {
	In_Person = 'in-person',
	Online = 'online',
	Newsletter = 'newsletter',
	Other = 'other',
}

// Having a defined return type (string) ensures the switch raises a TS error if it's not exhaustive
export const getStallSourceDescription = (enumName: StallTipOffSource): string => {
	switch (enumName) {
		case StallTipOffSource.In_Person:
			return 'I saw it at a polling booth';
		case StallTipOffSource.Online:
			return 'I heard about it online (including social media)';
		case StallTipOffSource.Newsletter:
			return 'I saw it in the school, church, et cetera newsletter';
		case StallTipOffSource.Other:
			return 'Other';
	}
};

// Having a defined return type (string) ensures the switch raises a TS error if it's not exhaustive
export const getStallSourceDescriptionFromAdminPOV = (enumName: StallTipOffSource, otherDescrption: string): string => {
	switch (enumName) {
		case StallTipOffSource.In_Person:
			return 'They saw it at a polling booth';
		case StallTipOffSource.Online:
			return 'They heard about it online (including social media)';
		case StallTipOffSource.Newsletter:
			return 'They saw it in the school, church, et cetera newsletter';
		case StallTipOffSource.Other:
			return `Other: ${otherDescrption}`;
	}
};

export interface StallFoodOptions {
	bbq?: boolean;
	cake?: boolean;
	vego?: boolean;
	halal?: boolean;
	bacon_and_eggs?: boolean;
	coffee?: boolean;
	free_text?: string;
}

export interface StallNonFoodOptions {
	run_out?: boolean;
	nothing?: boolean;
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

export interface StallOwnerModifiableProps {
	noms: StallFoodOptions;
	email: string;
	name: string;
	description: string;
	opening_hours?: string;
	website?: string;
}

export interface StallTipOffModifiableProps {
	noms: StallFoodOptions;
	email: string;
	tipoff_source?: StallTipOffSource;
	tipoff_source_other: string;
}

export interface StallTipOffRunOutModifiableProps {
	noms: StallFoodOptions & { run_out: true };
	email: string;
	tipoff_source?: StallTipOffSource; // Actually it's always StallTipOffSource.Other, but we need this here for the Stall interface construction to work
	tipoff_source_other: string;
}

export interface StallTipOffRedCrossOfShameModifiableProps {
	noms: { nothing: true };
	email: string;
	tipoff_source?: StallTipOffSource; // Actually it's always StallTipOffSource.Other, but we need this here for the Stall interface construction to work
	tipoff_source_other: string;
}

export interface NewStallNonFormModifiableProps {
	election: number; // @TODO Why not election_id?
	polling_place?: number; // Elections without official polling places loaded don't have polling place ids
	location_info?: IStallLocationInfo;
	submitter_type: StallSubmitterType;
}

export interface NewStallOwner extends StallOwnerModifiableProps, NewStallNonFormModifiableProps {}

export interface NewStallTipOff extends StallTipOffModifiableProps, NewStallNonFormModifiableProps {}

export interface NewStallTipOffRunOut extends StallTipOffRunOutModifiableProps, NewStallNonFormModifiableProps {}

export interface NewStallTipOffRedCrossOfShame
	extends StallTipOffRedCrossOfShameModifiableProps,
		NewStallNonFormModifiableProps {}

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

export enum StallStatus {
	Pending = 'Pending',
	Approved = 'Approved',
	Declined = 'Declined',
}

export interface Stall
	extends Omit<NewStallOwner, 'noms' | 'polling_place' | 'location_info'>,
		Omit<NewStallTipOff, 'noms' | 'polling_place' | 'location_info'>,
		Omit<NewStallTipOffRunOut, 'noms' | 'polling_place' | 'location_info'>,
		Omit<NewStallTipOffRedCrossOfShame, 'noms' | 'polling_place' | 'location_info'> {
	id: number;
	noms: StallFoodOptions & StallNonFoodOptions;
	polling_place: IPollingPlaceStubForStalls | null; // Becomes an object after submission; null if the election has no polling places yet
	location_info: IStallLocationInfo | null; // Undefined becomes null after submission; null if the election has polling places
	status: StallStatus;
	previous_status: StallStatus;
	reported_timestamp: string; // ISO date
	owner_edit_timestamp: string | null; // ISO date
	submitter_type: StallSubmitterType;
}

export interface PendingStall extends Stall {
	election_id: number;
	triaged_on: string; // ISO date
	triaged_by: string;
	current_stall: IPollingPlaceStall & {
		polling_place: number; // @TODO Why not polling_place_id?
	};
	diff:
		| {
				field: string;
				old: string | number | StallFoodOptions;
				new: string | number | StallFoodOptions;
		  }[]
		| null;
}

export interface PollingPlaceWithPendingStall {
	id: number;
	election_id: number;
	name: string;
	premises: string;
	address: string;
	state: string;
	stall: IPollingPlaceStall | null;
	pending_stalls: PendingStall[];
	previous_subs: {
		approved: number;
		denied: number;
	};
}

export interface UnofficialPollingPlaceWithPendingStall extends IStallLocationInfo {
	id_unofficial: string;
	election_id: number;
	premises: string;
	stall: null;
	pending_stalls: PendingStall[];
	previous_subs: {
		approved: number;
		denied: number;
	};
}

// type StallsResponse = Stall[];

export const stallsAdapter = createEntityAdapter<Stall>();

const initialState = stallsAdapter.getInitialState();
export { initialState as initialStallsState };

export const stallsApi = api.injectEndpoints({
	endpoints: (builder) => ({
		getPendingStalls: builder.query<PollingPlaceWithPendingStall[] | UnofficialPollingPlaceWithPendingStall[], void>({
			query: () => ({
				url: 'stalls/pending/',
			}),
		}),
		getStall: builder.query<Stall, { stallId: number; token: string; signature: string }>({
			query: ({ stallId, token, signature }) => ({
				url: `stalls/${stallId}/`,
				params: { token, signature },
			}),
		}),
		addStall: builder.mutation<
			void,
			NewStallOwner | NewStallTipOff | NewStallTipOffRunOut | NewStallTipOffRedCrossOfShame
		>({
			query: (stall) => ({
				url: 'stalls/',
				method: 'POST',
				body: stall,
			}),
		}),
		updateStallWithCredentials: builder.mutation<void, Stall & { token: string; signature: string }>({
			query: (stall) => ({
				url: `stalls/${stall.id}/update_and_resubmit/`,
				method: 'PATCH',
				body: stall,
			}),
		}),
		approveStall: builder.mutation<void, number>({
			query: (stallId) => ({
				url: `stalls/${stallId}/approve/`,
				method: 'POST',
			}),
		}),
		approveUnofficialStall: builder.mutation<void, number>({
			query: (stallId) => ({
				url: `stalls/${stallId}/approve_and_add/`,
				method: 'POST',
			}),
		}),
		declineStall: builder.mutation<void, number>({
			query: (stallId) => ({
				url: `stalls/${stallId}/decline/`,
				method: 'POST',
			}),
		}),
	}),
});

export const {
	useGetPendingStallsQuery,
	useGetStallQuery,
	useAddStallMutation,
	useUpdateStallWithCredentialsMutation,
	useApproveStallMutation,
	useApproveUnofficialStallMutation,
	useDeclineStallMutation,
} = stallsApi;
