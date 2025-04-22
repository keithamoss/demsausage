export interface IPollingPlaceNoms {
	bbq?: boolean;
	cake?: boolean;
	vego?: boolean;
	halal?: boolean;
	coffee?: boolean;
	bacon_and_eggs?: boolean;
	free_text?: string; // When use direct API calls to retrieve individual polling places we get the actual text
	nothing?: boolean;
	run_out?: boolean;
}

export interface IPollingPlaceStallModifiableProps {
	noms: IPollingPlaceNoms;
	name: string;
	description: string;
	opening_hours: string;
	favourited: boolean;
	website: string;
	extra_info: string;
	source: string;
}

export interface IPollingPlaceStall extends IPollingPlaceStallModifiableProps {
	first_report: string | null; // Datetime
	latest_report: string | null; // Datetime
	polling_place: number; // @TODO This should be polling_place_id
	deleted: boolean;
}

export type IPollingPlaceStallGeoJSON = Omit<IPollingPlaceStall, 'noms'> & {
	noms: IMapPollingGeoJSONNoms;
};

export enum PollingPlaceChanceOfSausage {
	NO_IDEA = 0,
	UNLIKELY = 1,
	MIXED = 2,
	FAIR = 3,
	STRONG = 4,
}

export enum PollingPlaceWheelchairAccess {
	NONE = 'None',
	ASSISTED = 'Assisted',
	FULL = 'Full',
	UNKNOWN = 'Unknown',
}

export interface IGeoJSON {
	type: string;
	coordinates: [number, number];
}

export enum PollingPlaceState {
	NSW = 'NSW',
	VIC = 'VIC',
	QLD = 'QLD',
	WA = 'WA',
	SA = 'SA',
	TAS = 'TAS',
	ACT = 'ACT',
	NT = 'NT',
	Overseas = 'Overseas',
}

export interface IPollingPlace {
	id: number;
	name: string;
	geom: IGeoJSON;
	facility_type: string | null;
	booth_info: string;
	wheelchair_access: PollingPlaceWheelchairAccess;
	wheelchair_access_description: string;
	entrance_desc: string;
	opening_hours: string;
	premises: string;
	address: string;
	divisions: string[];
	state: PollingPlaceState;
	chance_of_sausage: PollingPlaceChanceOfSausage | null;
	stall: IPollingPlaceStall | null;
	ec_id: number | null;
	extras: {
		[key: string]: string;
	};
	has_approved_subs: boolean; // @TOOD This is ONLY available if retrieved from /polling_places/lookup/ at the moment, it's also buggy (see notes in serializers.py)
}

export interface IPollingPlaceStubForStalls {
	id: number;
	name: string;
	premises: string;
	address: string;
	state: string;
}

export enum eNomsHistoryChangeReason {
	APPROVED_STALL = 'Approved stall',
	EDITED_DIRECTLY = 'Edited directly',
	DELETED_DIRECTLY = 'Deleted directly',
}

export enum eNomsHistoryChangeType {
	ADDED = '+',
	EDITED = '~',
	DELETED = '-',
}

export interface IPollingPlaceNomsHistory {
	history_id: number;
	history_date: string; // ISO27001 date
	history_change_reason: eNomsHistoryChangeReason;
	history_type: eNomsHistoryChangeType;
	history_user_name: string;
	changed_fields?: string[];
	changes?: {
		field: string;
		old: unknown;
		new: unknown;
	}[];
}

export interface IMapFilterSettings extends Omit<IPollingPlaceNoms, 'free_text' | 'nothing' | 'run_out'> {}

export interface IMapPollingGeoJSONNoms extends Omit<IPollingPlaceNoms, 'free_text'> {
	free_text?: boolean; // Map GeoJSON returns summary info only
}

export enum PollingPlaceHistoryEventType {
	ADDED_DIRECTLY = 'Added Directly',
	EDITED_DIRECTLY = 'Edited Directly',
	SUBMISSION_RECEIVED = 'Submission Received',
	SUBMISSION_APPROVED = 'Submission Approved',
	SUBMISSION_DECLINED = 'Submission Declined',
	SUBMISSION_EDITED = 'Submission Edited',
	UNKNOWN = 'UNKNOWN_HISTORY_EVENT_TYPE',
}
