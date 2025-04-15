import type { IMetaPollingPlace } from './metaPollingPlaceInterfaces';
import type { IMetaPollingPlaceRemark } from './metaPollingPlaceRemarksInterfaces';

export enum IMetaPollingPlaceTaskCategory {
	REVIEW = 'Review',
	QA = 'QA',
	ENRICHMENT = 'Enrichment',
	CROWDSOURCING = 'Crowdsourcing',
}

export enum IMetaPollingPlaceTaskType {
	REVIEW_DRAFT = 'Review Draft',
	REVIEW_PP = 'Review Polling Places',
	QA_PP_MISMATCH = 'Polling Place Mismatch',

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

export interface IMetaPollingPlaceTaskJobModifiableProps {
	meta_polling_place: number; // Modifiable for task creation purposes only
	job_name: string;
	category: IMetaPollingPlaceTaskCategory;
	type: IMetaPollingPlaceTaskType;
	// To allow us to create tasks that start as 'Completd' (e.g. The 'Looks good!' action that creates a completed REVIEW_PP task)
}

export interface IMetaPollingPlaceTaskJobHistory {
	history_id: number;
	history_type: '+' | '~' | '-';
	history_user: string | null;
	history_date: string | null; // ISO 8601 date string
	status: IMetaPollingPlaceTaskStatus;
	outcome: IMetaPollingPlaceTaskOutcome;
}

export interface IMetaPollingPlaceTaskJob extends Omit<IMetaPollingPlaceTaskJobModifiableProps, 'meta_polling_place'> {
	id: number;
	status: IMetaPollingPlaceTaskStatus;
	created_on: string; // ISO 8601 date string
	outcome: IMetaPollingPlaceTaskOutcome;
	actioned_on: string | null; // ISO 8601 date string
	actioned_by: string | null;
	history: IMetaPollingPlaceTaskJobHistory[];
	meta_polling_place: IMetaPollingPlace;
	remarks: IMetaPollingPlaceRemark[];
}
