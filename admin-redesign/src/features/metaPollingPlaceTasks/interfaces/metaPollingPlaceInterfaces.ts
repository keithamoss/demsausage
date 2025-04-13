import type {
	IPollingPlace,
	IPollingPlaceNoms,
	PollingPlaceWheelchairAccess,
} from '../../pollingPlaces/pollingPlacesInterfaces';
import type { IMetaPollingPlaceLink } from './metaPollingPlaceLinksInterfaces';

export interface IPollingPlaceAttachedToMetaPollingPlace extends Omit<IPollingPlace, 'stall'> {
	election_name: string;
	stall: {
		id: number;
		noms: IPollingPlaceNoms | null;
	};
}

export interface IMetaPollingPlace {
	id: number;
	status: IMetaPollingPlaceStatus;
	created_on: string; // ISO 8601 date string
	modified_on: string; // ISO 8601 date string
	name: string;
	premises: string; // May be blank
	address_1: string; // May be blank
	address_2: string; // May be blank
	address_3: string; // May be blank
	locality: string; // May be blank
	postcode: string; // May be blank
	jurisdiction: IMetaPollingPlaceJurisdiction;
	overseas: boolean;
	geom_location: IGeoJSONPoint;
	geom_boundary: IGeoJSONPolygon | null;
	facility_type: string | null;
	wheelchair_access: PollingPlaceWheelchairAccess;
	wheelchair_access_description: string; // May be blank
	chance_of_sausage: object; // @TODO Implement interface
	polling_places: IPollingPlaceAttachedToMetaPollingPlace[];
	links: IMetaPollingPlaceLink[];
	task_history: {
		passed_review: boolean;
	};
}
export enum IMetaPollingPlaceJurisdiction {
	NSW = 'NSW',
	VIC = 'VIC',
	QLD = 'QLD',
	WA = 'WA',
	SA = 'SA',
	TAS = 'TAS',
	ACT = 'ACT',
	NT = 'NT',
}

export enum IMetaPollingPlaceStatus {
	ACTIVE = 'Active',
	RETIRED = 'Retired',
	DRAFT = 'Draft',
}
export interface IGeoJSONPoint {
	type: 'Point';
	coordinates: [number, number];
}
// @TODO

export interface IGeoJSONPolygon {
	type: 'Polygon';
}
