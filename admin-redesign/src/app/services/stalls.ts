import { createEntityAdapter } from '@reduxjs/toolkit';
import type { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';
import type {
	IPollingPlaceStall,
	IPollingPlaceStallModifiableProps,
	IPollingPlaceStubForStalls,
	PollingPlaceChanceOfSausage,
} from '../../features/pollingPlaces/pollingPlacesInterfaces';
import { api } from './api';

export enum StallApprovalType {
	ApproveAndMegeAutomatically = 'merged automatically',
	ApproveAndMergeByHand = 'merged by hand',
}

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
export const getStallSubmitterTypeTipOffName = (enumName: StallSubmitterType): string => {
	switch (enumName) {
		case StallSubmitterType.Owner:
			return 'INVALID_SUBMITTER_TYPE_FOR_TIP_OFF';
		case StallSubmitterType.TipOff:
			return 'Tip-off';
		case StallSubmitterType.TipOffRunOut:
			return 'Run Out Tip-off';
		case StallSubmitterType.TipOffRedCrossOfShame:
			return 'Red Cross of Shame Tip-off';
	}
};

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
export const getStallTipOffSourceDescriptionFromAdminPOV = (
	submitterType: StallSubmitterType,
	enumName: StallTipOffSource,
	otherDescrption: string,
): string => {
	// RCOS and Run Out tip-offs don't ask the user to identify the soruce, we only ask them to provide a description (in tipoff_source_other)
	if (submitterType === StallSubmitterType.TipOffRedCrossOfShame || submitterType === StallSubmitterType.TipOffRunOut) {
		return otherDescrption || 'No description provided';
	}

	switch (enumName) {
		case StallTipOffSource.In_Person:
			return 'They saw it at a polling booth';
		case StallTipOffSource.Online:
			return 'They heard about it online (including social media)';
		case StallTipOffSource.Newsletter:
			return 'They saw it in the school, church, et cetera newsletter';
		case StallTipOffSource.Other:
			return `Other: ${otherDescrption || 'No description provided'}`;
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

export interface PendingStallDiffTextOrNumberField {
	field: 'name' | 'description' | 'opening_hours' | 'website' | 'email';
	old: string;
	new: string;
}

export interface PendingStallDiffNomsField {
	field: 'noms';
	old: StallFoodOptions;
	new: StallFoodOptions;
}

export interface PendingStall extends Stall {
	election_id: number;
	triaged_on: string | null; // ISO date
	triaged_by: string | null;
	current_stall: IPollingPlaceStall & {
		polling_place: number; // @TODO Why not polling_place_id?
	};
	diff: PendingStallDiffTextOrNumberField[] | PendingStallDiffNomsField[] | null;
}

export interface PollingPlacePreviousSubsStats {
	approved: number;
	approved_owner_subs: number;
	denied: number;
}

export interface ElectionPendingStallsGamifiedUserStats {
	id: number;
	name: string;
	initial: string;
	image_url: string;
	total: number;
}

export interface ElectionPendingStalls {
	election_id: number;
	stats: ElectionPendingStallsGamifiedUserStats[];
	booths: PollingPlaceWithPendingStall[];
}

export interface PollingPlaceWithPendingStall {
	id: number;
	election_id: number;
	election_name_url_safe: string;
	name: string;
	premises: string;
	address: string;
	state: string;
	stall: IPollingPlaceStall | null;
	chance_of_sausage: PollingPlaceChanceOfSausage | null;
	pending_stalls: PendingStall[];
	previous_subs: PollingPlacePreviousSubsStats;
}

// export interface UnofficialPollingPlaceWithPendingStall extends IStallLocationInfo {
// 	id_unofficial: string;
// 	election_id: number;
// 	premises: string;
// 	stall: null;
// 	pending_stalls: PendingStall[];
// 	previous_subs: PollingPlacePreviousSubsStats;
// }

// type StallsResponse = Stall[];

export const stallsAdapter = createEntityAdapter<Stall>();

const initialState = stallsAdapter.getInitialState();
export { initialState as initialStallsState };

export const stallsApi = api.injectEndpoints({
	endpoints: (builder) => ({
		// getPendingStalls: builder.query<PollingPlaceWithPendingStall[] | UnofficialPollingPlaceWithPendingStall[], void>({
		getPendingStalls: builder.query<ElectionPendingStalls[], void>({
			query: () => ({
				url: 'stalls/pending/',
			}),
			providesTags: ['PendingStalls'],
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
		approveStall: builder.mutation<
			void,
			{ stallId: number; pollingPlaceNoms: Partial<IPollingPlaceStallModifiableProps>; approvalType: StallApprovalType }
		>({
			query: ({ stallId, pollingPlaceNoms, approvalType }) => ({
				url: `stalls/${stallId}/approve/`,
				method: 'POST',
				body: {
					pollingPlaceNoms,
					approvalType,
				},
			}),
			invalidatesTags: ['PendingStalls'],
		}),
		// approveUnofficialStall: builder.mutation<void, number>({
		// 	query: (stallId) => ({
		// 		url: `stalls/${stallId}/approve_and_add/`,
		// 		method: 'POST',
		// 	}),
		// 	invalidatesTags: ['PendingStalls'],
		// }),
		declineStall: builder.mutation<void, number>({
			query: (stallId) => ({
				url: `stalls/${stallId}/decline/`,
				method: 'POST',
			}),
			invalidatesTags: ['PendingStalls'],
		}),
	}),
});

export const {
	useGetPendingStallsQuery,
	useGetStallQuery,
	useAddStallMutation,
	useUpdateStallWithCredentialsMutation,
	useApproveStallMutation,
	// useApproveUnofficialStallMutation,
	useDeclineStallMutation,
} = stallsApi;
