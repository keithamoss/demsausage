import type { NavigateFunction } from 'react-router-dom';

export const navigateToMetaPollingPlaceTasksRoot = (navigate: NavigateFunction) => {
	// We handle going to all of these routes:
	// /tasks/

	navigate('/tasks/');
};

export const navigateToMetaPollingPlaceTaskJobByName = (navigate: NavigateFunction, jobName: string) => {
	// We handle going to all of these routes:
	// /tasks/:job_name/

	navigate(`/tasks/${jobName}/`);
};
