import type { IMetaPollingPlace, IMetaPollingPlaceStatus } from './metaPollingPlaceInterfaces';

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
