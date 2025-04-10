import type { IPollingPlace, PollingPlaceWheelchairAccess } from '../pollingPlaces/pollingPlacesInterfaces';

export enum IMetaPollingPlaceTaskCategory {
	REVIEW = 'Review',
	QA = 'QA',
	ENRICHMENT = 'Enrichment',
	CROWDSOURCING = 'Crowdsourcing',
}

export enum IMetaPollingPlaceTaskType {
	REVIEW_DRAFT = 'Review Draft',

	CROWDSOURCE_FROM_FACEBOOK = 'Crowdsource from Facebook',
}

export interface IMetaPollingPlaceTaskJobGroup {
	job_name: string;
	task_count: number;
	max_created_on: string; // ISO 8601 date string
	category: IMetaPollingPlaceTaskCategory;
	type: IMetaPollingPlaceTaskType;
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

export enum IMetaPollingPlaceTaskStatus {
	IN_PROGRESS = 'In Progress',
	COMPLETED = 'Completed',
}

export enum IMetaPollingPlaceTaskOutcome {
	BLANK = '', // Task is still in progress
	COMPLETED = 'Completed',
	DEFERRED = 'Deferred',
	CLOSED = 'Closed',
}

export enum IMetaPollingPlaceContactType {
	EMAIL = 'Email',
}

export enum IMetaPollingPlaceContactCategory {
	PRIMARY = 'Primary',
	SECONDARY = 'Secondary',
}

export enum IMetaPollingPlaceLinkType {
	OFFICIAL = 'Official Website',
	FACEBOOK = 'Facebook',
}

export interface IGeoJSONPoint {
	type: 'Point';
	coordinates: [number, number];
}

// @TODO
export interface IGeoJSONPolygon {
	type: 'Polygon';
	// coordinates: [number, number];
}

export interface IPollingPlaceAttachedToMetaPollingPlace extends Omit<IPollingPlace, 'stall'> {
	election_name: string;
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
}

export interface IMetaPollingPlaceTaskJob {
	id: number;
	status: IMetaPollingPlaceStatus;
	created_on: string; // ISO 8601 date string
	job_name: string;
	category: IMetaPollingPlaceTaskCategory;
	type: IMetaPollingPlaceTaskType;
	outcome: IMetaPollingPlaceTaskOutcome;
	actioned_on: string | null; // ISO 8601 date string
	actioned_by: string | null;

	meta_polling_place: IMetaPollingPlace;
}

export interface IMetaPollingPlaceLinkModifiableProps {
	type: IMetaPollingPlaceLinkType;
	url: string;
}

export interface IMetaPollingPlaceLink extends IMetaPollingPlaceLinkModifiableProps {
	id: number;
	meta_polling_place_id: number;
	created_on: string; // ISO 8601 date string
	modified_on: string; // ISO 8601 date string
}
