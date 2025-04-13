import type { NavigateFunction } from 'react-router-dom';

export const navigateToMetaPollingPlaceTasksRoot = (navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /tasks/

	navigate('/tasks/');
};
export const navigateToMetaPollingPlaceTasksManager = (navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /tasks/manage/

	navigate('/tasks/manage/');
};

export const navigateToMetaPollingPlaceNextTaskJobByName = (navigate: NavigateFunction, jobName: string) => {
	// We handle going to all of these routes:
	// /tasks/:job_name/next/

	navigate(`/tasks/${jobName}/next/`);
};

export const navigateToMetaPollingPlaceTaskJobTask = (navigate: NavigateFunction, jobName: string, taskId: number) => {
	// We handle going to all of these routes:
	// /tasks/:job_name/:task_id/

	navigate(`/tasks/${jobName}/${taskId}/`);
};
