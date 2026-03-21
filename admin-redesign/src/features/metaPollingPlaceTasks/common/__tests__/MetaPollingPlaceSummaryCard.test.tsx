import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PollingPlaceWheelchairAccess } from '../../../pollingPlaces/pollingPlacesInterfaces';
import {
	type IMetaPollingPlace,
	type IMetaPollingPlaceJurisdiction,
	IMetaPollingPlaceStatus,
} from '../../interfaces/metaPollingPlaceInterfaces';
import MetaPollingPlaceSummaryCard from '../MetaPollingPlaceSummaryCard';

function buildMetaPollingPlace(status: IMetaPollingPlaceStatus): IMetaPollingPlace {
	return {
		id: 1,
		status,
		created_on: '2026-03-21T00:00:00Z',
		modified_on: '2026-03-21T00:00:00Z',
		name: 'Test Name',
		premises: 'Test Premises',
		address_1: '',
		address_2: '',
		address_3: '',
		locality: '',
		postcode: '',
		jurisdiction: 'VIC' as IMetaPollingPlaceJurisdiction,
		overseas: false,
		geom_location: { type: 'Point', coordinates: [144.9631, -37.8136] },
		geom_boundary: null,
		facility_type: null,
		wheelchair_access: PollingPlaceWheelchairAccess.FULL,
		wheelchair_access_description: '',
		chance_of_sausage: {},
		polling_places: [],
		links: [],
		task_outcomes: { passed_review: false },
	};
}

describe('MetaPollingPlaceSummaryCard', () => {
	it('renders premises name', () => {
		render(<MetaPollingPlaceSummaryCard metaPollingPlace={buildMetaPollingPlace(IMetaPollingPlaceStatus.DRAFT)} />);
		expect(screen.getByText('Test Premises')).toBeInTheDocument();
	});

	it('renders Draft chip when status is DRAFT', () => {
		render(<MetaPollingPlaceSummaryCard metaPollingPlace={buildMetaPollingPlace(IMetaPollingPlaceStatus.DRAFT)} />);
		expect(screen.getByText('Draft')).toBeInTheDocument();
	});

	it('does not render Draft chip when status is ACTIVE', () => {
		render(<MetaPollingPlaceSummaryCard metaPollingPlace={buildMetaPollingPlace(IMetaPollingPlaceStatus.ACTIVE)} />);
		expect(screen.queryByText('Draft')).not.toBeInTheDocument();
	});

	it('does not render Draft chip when status is RETIRED', () => {
		render(<MetaPollingPlaceSummaryCard metaPollingPlace={buildMetaPollingPlace(IMetaPollingPlaceStatus.RETIRED)} />);
		expect(screen.queryByText('Draft')).not.toBeInTheDocument();
	});
});
