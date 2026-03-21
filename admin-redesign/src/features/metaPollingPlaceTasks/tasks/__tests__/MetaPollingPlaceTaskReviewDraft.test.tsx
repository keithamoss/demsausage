import { fireEvent, render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { PollingPlaceWheelchairAccess } from '../../../pollingPlaces/pollingPlacesInterfaces';
import {
	type IMetaPollingPlace,
	type IMetaPollingPlaceJurisdiction,
	IMetaPollingPlaceStatus,
} from '../../interfaces/metaPollingPlaceInterfaces';
import {
	IMetaPollingPlaceTaskCategory,
	type IMetaPollingPlaceTaskJob,
	IMetaPollingPlaceTaskOutcome,
	IMetaPollingPlaceTaskStatus,
	IMetaPollingPlaceTaskType,
} from '../../interfaces/metaPollingPlaceTasksInterfaces';
import MetaPollingPlaceTaskReviewDraft from '../MetaPollingPlaceTaskReviewDraft';

const { navigateToNextTaskMock, completeTaskTriggerMock, completeTaskUnwrapMock } = vi.hoisted(() => ({
	navigateToNextTaskMock: vi.fn(),
	completeTaskTriggerMock: vi.fn(),
	completeTaskUnwrapMock: vi.fn(),
}));

vi.mock('@toolpad/core', () => ({
	useNotifications: () => ({ show: vi.fn() }),
}));

vi.mock('../../../../app/hooks/useUnsavedChangesBlocker', () => ({
	useUnsavedChangesBlocker: vi.fn(),
}));

vi.mock('../../../../app/routing/navigationHelpers/navigationHelpersMetaPollingPlaceTasks', () => ({
	navigateToMetaPollingPlaceNextTaskJobByName: navigateToNextTaskMock,
}));

vi.mock('../../../../app/services/metaPollingPlaces', () => ({
	useGetPollingPlaceFacilityTypesQuery: () => ({
		data: [
			{ id: 1, name: 'Community Hall' },
			{ id: 2, name: 'School' },
		],
		isLoading: false,
	}),
	useUpdateMetaPollingPlaceMutation: () => [vi.fn(() => ({ unwrap: async () => ({}) })), { isLoading: false }],
	useRearrangePollingPlacesMutation: () => [vi.fn(() => ({ unwrap: async () => ({}) })), { isLoading: false }],
}));

vi.mock('../../../../app/services/metaPollingPlaceTasks', () => ({
	useCompleteTaskMutation: () => [completeTaskTriggerMock, { isLoading: false }],
}));

vi.mock('../../common/MetaPollingPlaceHistorySummaryCard', () => ({ default: () => <div>History Card</div> }));
vi.mock('../../common/MetaPollingPlaceLinksManager', () => ({ default: () => <div>Links Manager</div> }));
vi.mock('../../common/MetaPollingPlaceRemarks', () => ({ default: () => <div>Remarks</div> }));
vi.mock('../../common/MetaPollingPlaceTaskHistory', () => ({ default: () => <div>Task History</div> }));
vi.mock('../../common/MetaPollingPlacePollingPlacesReviewList', () => ({
	default: () => <div>Polling Places Review List</div>,
}));

vi.mock('../../common/MetaPollingPlaceTaskActionBar', () => ({
	default: function MockActionBar(props: {
		isCompleteAllowed: boolean;
		onClickComplete?: () => void;
		additionalActions?: React.ReactNode;
	}) {
		return (
			<div>
				<button type="button" disabled={!props.isCompleteAllowed} onClick={props.onClickComplete}>
					Complete
				</button>
				{props.additionalActions}
			</div>
		);
	},
}));

function buildMetaPollingPlace(): IMetaPollingPlace {
	return {
		id: 10,
		status: IMetaPollingPlaceStatus.DRAFT,
		created_on: '2026-03-21T00:00:00Z',
		modified_on: '2026-03-21T00:00:00Z',
		name: 'Southbank Booth',
		premises: 'Southbank Primary School',
		address_1: '',
		address_2: '',
		address_3: '',
		locality: '',
		postcode: '',
		jurisdiction: 'VIC' as IMetaPollingPlaceJurisdiction,
		overseas: false,
		geom_location: { type: 'Point', coordinates: [144.9631, -37.8136] },
		geom_boundary: null,
		facility_type: 1,
		wheelchair_access: PollingPlaceWheelchairAccess.FULL,
		wheelchair_access_description: '',
		chance_of_sausage: {},
		polling_places: [],
		links: [],
		task_outcomes: { passed_review: false },
	};
}

function buildTaskJob(overrides?: Partial<IMetaPollingPlaceTaskJob>): IMetaPollingPlaceTaskJob {
	return {
		id: 123,
		status: IMetaPollingPlaceTaskStatus.IN_PROGRESS,
		created_on: '2026-03-21T00:00:00Z',
		job_name: 'Review Draft Job',
		category: IMetaPollingPlaceTaskCategory.REVIEW,
		type: IMetaPollingPlaceTaskType.REVIEW_DRAFT,
		outcome: IMetaPollingPlaceTaskOutcome.BLANK,
		actioned_on: null,
		actioned_by: null,
		history: [],
		meta_polling_place: buildMetaPollingPlace(),
		nearby_meta_polling_places: [],
		remarks: [],
		...overrides,
	};
}

function renderComponent(taskJob: IMetaPollingPlaceTaskJob) {
	const router = createMemoryRouter(
		[
			{
				path: '*',
				element: <MetaPollingPlaceTaskReviewDraft metaPollingPlaceTaskJob={taskJob} />,
			},
		],
		{
			initialEntries: ['/'],
		},
	);

	return render(<RouterProvider router={router} />);
}

describe('MetaPollingPlaceTaskReviewDraft', () => {
	it('shows concurrent-session dialog and lets user move to next task', async () => {
		completeTaskTriggerMock.mockImplementation(() => ({ unwrap: completeTaskUnwrapMock }));
		completeTaskUnwrapMock.mockRejectedValue({ data: "This task isn't in progress." });

		renderComponent(
			buildTaskJob({
				meta_polling_place: {
					...buildMetaPollingPlace(),
					task_outcomes: { passed_review: true },
				},
			}),
		);

		fireEvent.click(screen.getByRole('button', { name: 'Complete' }));
		fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

		expect(await screen.findByText('Task already completed')).toBeInTheDocument();

		fireEvent.click(screen.getByRole('button', { name: 'Go to next task' }));
		expect(navigateToNextTaskMock).toHaveBeenCalledWith(expect.anything(), 'Review Draft Job', {
			lat: -37.8136,
			lon: 144.9631,
		});
	});

	it('renders without crashing', () => {
		completeTaskTriggerMock.mockImplementation(() => ({ unwrap: completeTaskUnwrapMock }));
		completeTaskUnwrapMock.mockResolvedValue({});
		renderComponent(buildTaskJob());
		expect(screen.getByText('Southbank Primary School')).toBeInTheDocument();
	});

	it('shows premises name', () => {
		completeTaskTriggerMock.mockImplementation(() => ({ unwrap: completeTaskUnwrapMock }));
		completeTaskUnwrapMock.mockResolvedValue({});
		renderComponent(buildTaskJob());
		expect(screen.getByText('Southbank Primary School')).toBeInTheDocument();
	});

	it('shows Draft chip', () => {
		completeTaskTriggerMock.mockImplementation(() => ({ unwrap: completeTaskUnwrapMock }));
		completeTaskUnwrapMock.mockResolvedValue({});
		renderComponent(buildTaskJob());
		expect(screen.getByText('Draft')).toBeInTheDocument();
	});

	it('shows form fields: Name, Premises, Wheelchair Access, and Edit location', () => {
		completeTaskTriggerMock.mockImplementation(() => ({ unwrap: completeTaskUnwrapMock }));
		completeTaskUnwrapMock.mockResolvedValue({});
		renderComponent(buildTaskJob());
		expect(screen.getByLabelText('Name')).toBeInTheDocument();
		expect(screen.getByLabelText('Premises')).toBeInTheDocument();
		expect(screen.getAllByText('Wheelchair Access').length).toBeGreaterThan(0);
		expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2);
		expect(screen.getByRole('button', { name: 'Edit location' })).toBeInTheDocument();
	});

	it('shows Save changes button', () => {
		completeTaskTriggerMock.mockImplementation(() => ({ unwrap: completeTaskUnwrapMock }));
		completeTaskUnwrapMock.mockResolvedValue({});
		renderComponent(buildTaskJob());
		expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
	});

	it('shows Complete button', () => {
		completeTaskTriggerMock.mockImplementation(() => ({ unwrap: completeTaskUnwrapMock }));
		completeTaskUnwrapMock.mockResolvedValue({});
		renderComponent(buildTaskJob());
		expect(screen.getByRole('button', { name: 'Complete' })).toBeInTheDocument();
	});

	it('has Complete disabled when pristine and PP review not actioned', () => {
		completeTaskTriggerMock.mockImplementation(() => ({ unwrap: completeTaskUnwrapMock }));
		completeTaskUnwrapMock.mockResolvedValue({});
		renderComponent(buildTaskJob());
		expect(screen.getByRole('button', { name: 'Complete' })).toBeDisabled();
	});

	it('shows near-duplicate alert when nearby MPP is within threshold', () => {
		completeTaskTriggerMock.mockImplementation(() => ({ unwrap: completeTaskUnwrapMock }));
		completeTaskUnwrapMock.mockResolvedValue({});
		renderComponent(
			buildTaskJob({
				nearby_meta_polling_places: [
					{
						...buildMetaPollingPlace(),
						id: 11,
						premises: 'Nearby Hall',
						distance_from_task_mpp_metres: 75,
					},
				],
			}),
		);
		expect(screen.getByText(/Another MPP is 75m away/i)).toBeInTheDocument();
		expect(screen.getByText('Nearby Hall')).toBeInTheDocument();
	});

	it('does not show near-duplicate alert when no nearby MPP is within threshold', () => {
		completeTaskTriggerMock.mockImplementation(() => ({ unwrap: completeTaskUnwrapMock }));
		completeTaskUnwrapMock.mockResolvedValue({});
		renderComponent(
			buildTaskJob({
				nearby_meta_polling_places: [
					{
						...buildMetaPollingPlace(),
						id: 12,
						premises: 'Far Hall',
						distance_from_task_mpp_metres: 150,
					},
				],
			}),
		);
		expect(screen.queryByText(/Another MPP is .* away/i)).not.toBeInTheDocument();
	});
});
