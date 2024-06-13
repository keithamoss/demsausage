import { IMapPollingGeoJSONNoms, IPollingPlaceNoms } from '../icons/noms';

export interface IPollingPlaceStall {
	noms: IPollingPlaceNoms;
	name: string;
	description: string;
	opening_hours: string;
	favourited: boolean;
	website: string;
	extra_info: string;
	first_report: string | null; // Datetime
	latest_report: string | null; // Datetime
	source: string;
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
	state: string;
	chance_of_sausage: PollingPlaceChanceOfSausage | null;
	stall: IPollingPlaceStall | null;
	extras: {
		[key: string]: string;
	};
}
