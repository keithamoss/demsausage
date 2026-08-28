import type { ObjectSchema } from 'yup';
import * as yup from 'yup';
import type { PollingPlaceWheelchairAccess } from '../../../features/pollingPlaces/pollingPlacesInterfaces';

export interface IMetaPollingPlaceCoreFieldsFormValues {
	name: string;
	premises: string;
	facility_type: number | null;
	wheelchair_access: PollingPlaceWheelchairAccess;
	wheelchair_access_description: string;
	/** Latitude component of geom_location — stored separately for form inputs */
	lat: number;
	/** Longitude component of geom_location — stored separately for form inputs */
	lng: number;
}

export const metaPollingPlaceCoreFieldsFormValidationSchema: ObjectSchema<IMetaPollingPlaceCoreFieldsFormValues> = yup
	.object({
		name: yup.string().required('Name is required'),
		premises: yup.string().default(''),
		/** Optional FK id of PollingPlaceFacilityType — null means "no type set" */
		facility_type: yup.number().nullable().default(null),
		wheelchair_access: yup.mixed<PollingPlaceWheelchairAccess>().required('Wheelchair access is required'),
		wheelchair_access_description: yup.string().default(''),
		// GeoJSON stores coordinates as [longitude, latitude]. We split them into
		// separate fields for the Phase 1 text inputs and reassemble in the submit
		// handler as { type: 'Point', coordinates: [lng, lat] }.
		lat: yup
			.number()
			.required('Latitude is required')
			.min(-90, 'Latitude must be between -90 and 90')
			.max(90, 'Latitude must be between -90 and 90'),
		lng: yup
			.number()
			.required('Longitude is required')
			.min(-180, 'Longitude must be between -180 and 180')
			.max(180, 'Longitude must be between -180 and 180'),
	})
	.required();
