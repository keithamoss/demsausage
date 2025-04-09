export enum MetaPollingPlaceTaskCategory {
	REVIEW = 'Review',
	QA = 'QA',
	ENRICHMENT = 'Enrichment',
	CROWDSOURCING = 'Crowdsourcing',
}

export enum MetaPollingPlaceTaskType {
	REVIEW_DRAFT = 'Review Draft',

	CROWDSOURCE_FROM_FACEBOOK = 'Crowdsource from Facebook',
}

export interface IMetaPollingPlaceTaskJobGroup {
	job_name: string;
	task_count: number;
	max_created_on: string; // ISO 8601 date string
	category: MetaPollingPlaceTaskCategory;
	type: MetaPollingPlaceTaskType;
}
