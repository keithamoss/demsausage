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

export const navigateToMetaPollingPlaceNextTaskJobByName = (
	navigate: NavigateFunction,
	jobName: string,
	coords?: { lat: number; lon: number },
) => {
	// We handle going to all of these routes:
	// /tasks/:job_name/next/
	// /tasks/:job_name/next/?lat=XX&lon=YY  (proximity-ordered)

	const search = coords !== undefined ? `?lat=${coords.lat}&lon=${coords.lon}` : '';
	navigate(`/tasks/${jobName}/next/${search}`);
};

export const navigateToMetaPollingPlaceTaskJobTask = (
	navigate: NavigateFunction,
	jobName: string,
	taskId: number,
	replace = false,
) => {
	// We handle going to all of these routes:
	// /tasks/:job_name/:task_id/

	navigate(`/tasks/${jobName}/${taskId}/`, { replace });
};
