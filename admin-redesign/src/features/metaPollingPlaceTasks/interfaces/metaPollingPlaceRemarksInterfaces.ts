export interface IMetaPollingPlaceRemarkModifiableProps {
	text: string;
}

export interface IMetaPollingPlaceRemark extends IMetaPollingPlaceRemarkModifiableProps {
	id: number;
	created_on: string; // ISO 8601 date string
	modified_on: string; // ISO 8601 date string
	meta_polling_place: number; // id
	user: string;
	meta_polling_place_task: number; // id
}
