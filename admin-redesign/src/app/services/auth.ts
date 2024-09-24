import { api } from './api';

export interface User {
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	name: string;
	initials: string;
	email: string;
	is_staff: boolean;
	date_joined: string;
	groups: string[];
	is_approved: boolean;
	// settings: UserProfileSettings;
	last_gdrive_backup: string | null;
	whats_new_release_count: number;
}

type UserAuthStatusResponse = {
	is_logged_in: boolean;
	user: User | null;
};

export const authApi = api.injectEndpoints({
	endpoints: (builder) => ({
		checkLoginStatus: builder.query<UserAuthStatusResponse, void>({
			query: () => 'self',
			providesTags: ['User'],
		}),
		updateWhatsNewViewCount: builder.mutation<null, number>({
			query: (viewCount) => ({
				url: 'profile/update_what_new_view_count/',
				method: 'POST',
				body: { viewCount },
			}),
			invalidatesTags: ['User'],
		}),
	}),
});

export const { useCheckLoginStatusQuery, useUpdateWhatsNewViewCountMutation } = authApi;
