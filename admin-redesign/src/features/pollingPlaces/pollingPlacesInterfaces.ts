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

export interface IPollingPlaceStubForStalls {
	id: number;
	name: string;
	premises: string;
	address: string;
	state: string;
}

export interface IMapFilterSettings extends Omit<IPollingPlaceNoms, 'free_text' | 'nothing' | 'run_out'> {}

export interface IMapPollingGeoJSONNoms extends Omit<IPollingPlaceNoms, 'free_text'> {
	free_text?: boolean; // Map GeoJSON returns summary info only
}
