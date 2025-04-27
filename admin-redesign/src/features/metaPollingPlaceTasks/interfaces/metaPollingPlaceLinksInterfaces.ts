export interface IMetaPollingPlaceLinkModifiableProps {
	type: IMetaPollingPlaceLinkType;
	url: string;
}

export interface IMetaPollingPlaceLink extends IMetaPollingPlaceLinkModifiableProps {
	id: number;
	meta_polling_place: number;
	created_on: string; // ISO 8601 date string
	modified_on: string; // ISO 8601 date string
}
export enum IMetaPollingPlaceLinkType {
	OFFICIAL = 'Official Website',
	FACEBOOK = 'Facebook',
	P_AND_C = 'P&C',
	NEWSLETTER = 'Newsletter',
	OTHER = 'Other',
}
