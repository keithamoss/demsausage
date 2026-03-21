import { yupResolver } from '@hookform/resolvers/yup';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	type SxProps,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { useNotifications } from '@toolpad/core';
import { useCallback, useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import {
	type IMetaPollingPlaceCoreFieldsFormValues,
	metaPollingPlaceCoreFieldsFormValidationSchema,
} from '../../../app/forms/metaPollingPlaces/metaPollingPlaceCoreFieldsForm';
import {
	useGetPollingPlaceFacilityTypesQuery,
	useUpdateMetaPollingPlaceMutation,
} from '../../../app/services/metaPollingPlaces';
import { PollingPlaceWheelchairAccess } from '../../pollingPlaces/pollingPlacesInterfaces';
import type { IMetaPollingPlace, IMetaPollingPlaceNearbyToTask } from '../interfaces/metaPollingPlaceInterfaces';
import MetaPollingPlaceLocationPickerDialog from './MetaPollingPlaceLocationPickerDialog';
import MetaPollingPlaceLocationStaticMap from './MetaPollingPlaceLocationStaticMap';

/** Distance threshold (metres) for showing the near-duplicate alert (FR-15). */
const NEAR_DUPLICATE_DISTANCE_THRESHOLD_METRES = 100;

interface Props {
	metaPollingPlace: IMetaPollingPlace;
	nearbyMetaPollingPlaces: IMetaPollingPlaceNearbyToTask[];
	onIsDirtyChange: (isDirty: boolean) => void;
	cardSxProps?: SxProps;
}

/**
 * Editable form card for the core MPP fields used in the REVIEW_DRAFT task.
 *
 * Exposes Save/Discard for the writable fields (name, premises, facility_type,
 * wheelchair_access, wheelchair_access_description, geom_location).
 *
 * `overseas` is intentionally read-only — it is derived from the originating
 * polling place at MPP creation time and cannot be changed here.
 */
function MetaPollingPlaceCoreFieldsEditCard(props: Props) {
	const { metaPollingPlace, nearbyMetaPollingPlaces, onIsDirtyChange, cardSxProps } = props;

	const notifications = useNotifications();

	// ######################
	// Facility Types
	// ######################
	const { data: facilityTypes, isLoading: isFacilityTypesLoading } = useGetPollingPlaceFacilityTypesQuery();
	// ######################
	// Facility Types (End)
	// ######################

	// ######################
	// Near-duplicate alert (FR-15)
	// ######################
	const nearestNearby = nearbyMetaPollingPlaces
		.filter((n) => n.distance_from_task_mpp_metres <= NEAR_DUPLICATE_DISTANCE_THRESHOLD_METRES)
		.sort((a, b) => a.distance_from_task_mpp_metres - b.distance_from_task_mpp_metres)[0];
	// ######################
	// Near-duplicate alert (End)
	// ######################

	// ######################
	// Form Management
	// ######################

	/**
	 * Build default form values from the MPP.
	 *
	 * GeoJSON stores coordinates as [longitude, latitude], so:
	 *   coordinates[0] = lng
	 *   coordinates[1] = lat
	 */
	const buildDefaultValues = useCallback(
		(mpp: IMetaPollingPlace): IMetaPollingPlaceCoreFieldsFormValues => ({
			name: mpp.name,
			premises: mpp.premises,
			facility_type: mpp.facility_type,
			wheelchair_access: mpp.wheelchair_access,
			wheelchair_access_description: mpp.wheelchair_access_description,
			// GeoJSON order is [lng, lat] — see comment above
			lng: mpp.geom_location.coordinates[0],
			lat: mpp.geom_location.coordinates[1],
		}),
		[],
	);

	const {
		register,
		control,
		watch,
		setValue,
		handleSubmit,
		reset,
		formState: { errors, isDirty },
	} = useForm<IMetaPollingPlaceCoreFieldsFormValues>({
		resolver: yupResolver(metaPollingPlaceCoreFieldsFormValidationSchema),
		defaultValues: buildDefaultValues(metaPollingPlace),
	});

	// Notify the parent whenever isDirty changes so it can gate the Complete button
	useEffect(() => {
		onIsDirtyChange(isDirty);
	}, [isDirty, onIsDirtyChange]);

	const watchedWheelchairAccess = watch('wheelchair_access');
	const [watchedLat, watchedLng] = watch(['lat', 'lng']);

	const showWheelchairDescription = watchedWheelchairAccess !== PollingPlaceWheelchairAccess.FULL;
	const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

	const currentGeomLocation = {
		type: 'Point' as const,
		coordinates: [watchedLng, watchedLat] as [number, number],
	};

	const onClickOpenLocationPicker = useCallback(() => {
		setIsLocationPickerOpen(true);
	}, []);

	const onCloseLocationPicker = useCallback(() => {
		setIsLocationPickerOpen(false);
	}, []);

	const onConfirmLocationPicker = useCallback(
		(nextGeomLocation: { type: 'Point'; coordinates: [number, number] }) => {
			const [nextLng, nextLat] = nextGeomLocation.coordinates;
			setIsLocationPickerOpen(false);

			const latChanged = nextLat !== watchedLat;
			const lngChanged = nextLng !== watchedLng;

			setValue('lat', nextLat, { shouldDirty: latChanged, shouldValidate: true });
			setValue('lng', nextLng, { shouldDirty: lngChanged, shouldValidate: true });
		},
		[setValue, watchedLat, watchedLng],
	);
	// ######################
	// Form Management (End)
	// ######################

	// ######################
	// Save Changes
	// ######################
	const [updateMetaPollingPlace, { isLoading: isUpdating }] = useUpdateMetaPollingPlaceMutation();

	const onSubmit: SubmitHandler<IMetaPollingPlaceCoreFieldsFormValues> = useCallback(
		async (data) => {
			try {
				// Build GeoJSON point — GeoJSON order is [longitude, latitude]
				const geomLocation = {
					type: 'Point' as const,
					coordinates: [data.lng, data.lat] as [number, number],
				};

				const updatedMetaPollingPlace = await updateMetaPollingPlace({
					id: metaPollingPlace.id,
					name: data.name,
					premises: data.premises,
					facilityTypeId: data.facility_type,
					wheelchairAccess: data.wheelchair_access,
					wheelchairAccessDescription: data.wheelchair_access_description,
					geomLocation,
				}).unwrap();

				// FR-8: reset from transformed server response so form defaults
				// exactly match persisted values (e.g. normalised coordinates).
				reset(buildDefaultValues(updatedMetaPollingPlace));

				notifications.show('Changes saved', {
					severity: 'success',
					autoHideDuration: 3000,
				});
			} catch (err) {
				notifications.show(`Failed to save changes: ${JSON.stringify(err)}`, {
					severity: 'error',
					autoHideDuration: 6000,
				});
			}
		},
		[metaPollingPlace.id, updateMetaPollingPlace, reset, notifications.show, buildDefaultValues],
	);
	// ######################
	// Save Changes (End)
	// ######################

	return (
		<Card variant="outlined" sx={cardSxProps}>
			<CardContent>
				{/* FR-15: Near-duplicate alert */}
				{nearestNearby !== undefined && (
					<Alert severity="warning" sx={{ mb: 2 }}>
						Another MPP is {Math.round(nearestNearby.distance_from_task_mpp_metres)}m away:{' '}
						<strong>{nearestNearby.premises || 'NO_PREMISES'}</strong>
					</Alert>
				)}

				<Stack spacing={2}>
					{/* Name */}
					<TextField
						label="Name"
						size="small"
						fullWidth
						{...register('name')}
						error={Boolean(errors.name)}
						helperText={errors.name?.message}
					/>

					{/* Premises */}
					<TextField
						label="Premises"
						size="small"
						fullWidth
						{...register('premises')}
						error={Boolean(errors.premises)}
						helperText={errors.premises?.message}
					/>

					{/* Facility Type */}
					<Controller
						name="facility_type"
						control={control}
						render={({ field }) => (
							<FormControl size="small" fullWidth error={Boolean(errors.facility_type)}>
								<InputLabel>Facility Type</InputLabel>
								<Select {...field} value={field.value ?? ''} label="Facility Type" disabled={isFacilityTypesLoading}>
									<MenuItem value="">
										<em>None</em>
									</MenuItem>
									{facilityTypes?.map((ft) => (
										<MenuItem key={ft.id} value={ft.id}>
											{ft.name}
										</MenuItem>
									))}
								</Select>
								{errors.facility_type && <FormHelperText>{errors.facility_type.message}</FormHelperText>}
							</FormControl>
						)}
					/>

					{/* Wheelchair Access */}
					<Controller
						name="wheelchair_access"
						control={control}
						render={({ field }) => (
							<FormControl size="small" fullWidth error={Boolean(errors.wheelchair_access)}>
								<InputLabel>Wheelchair Access</InputLabel>
								<Select {...field} label="Wheelchair Access">
									{Object.values(PollingPlaceWheelchairAccess).map((value) => (
										<MenuItem key={value} value={value}>
											{value}
										</MenuItem>
									))}
								</Select>
								{errors.wheelchair_access && <FormHelperText>{errors.wheelchair_access.message}</FormHelperText>}
							</FormControl>
						)}
					/>

					{/* Wheelchair Access Description — only shown when relevant */}
					{showWheelchairDescription && (
						<TextField
							label="Wheelchair Access Description"
							size="small"
							fullWidth
							{...register('wheelchair_access_description')}
							error={Boolean(errors.wheelchair_access_description)}
							helperText={errors.wheelchair_access_description?.message}
						/>
					)}

					{/* Location (Phase 2: static map + map picker dialog) */}
					<Typography variant="body2" color="text.secondary">
						Location
					</Typography>

					<MetaPollingPlaceLocationStaticMap
						mppLocation={currentGeomLocation}
						attachedPollingPlaces={metaPollingPlace.polling_places}
						nearbyMetaPollingPlaces={nearbyMetaPollingPlaces}
					/>

					<Box>
						<Button size="small" variant="outlined" onClick={onClickOpenLocationPicker}>
							Edit location
						</Button>
						{(errors.lat !== undefined || errors.lng !== undefined) && (
							<FormHelperText error>
								{errors.lat?.message ?? errors.lng?.message ?? 'Please select a valid location'}
							</FormHelperText>
						)}
					</Box>

					{/* Overseas — read-only, non-editable */}
					<Tooltip
						title="'Overseas' is derived from the originating polling place at MPP creation time and cannot be changed here."
						placement="top-start"
					>
						<span>
							<TextField
								label="Overseas"
								size="small"
								value={metaPollingPlace.overseas ? 'Yes' : 'No'}
								disabled
								fullWidth
							/>
						</span>
					</Tooltip>

					{/* Save button */}
					<Box>
						<Button
							variant="contained"
							onClick={handleSubmit(onSubmit)}
							disabled={isUpdating || !isDirty}
							startIcon={isUpdating ? <CircularProgress size={16} /> : undefined}
						>
							{isUpdating ? 'Saving…' : 'Save changes'}
						</Button>
					</Box>
				</Stack>

				<MetaPollingPlaceLocationPickerDialog
					open={isLocationPickerOpen}
					initialLocation={currentGeomLocation}
					attachedPollingPlaces={metaPollingPlace.polling_places}
					nearbyMetaPollingPlaces={nearbyMetaPollingPlaces}
					onClose={onCloseLocationPicker}
					onConfirm={onConfirmLocationPicker}
				/>
			</CardContent>
		</Card>
	);
}

export default MetaPollingPlaceCoreFieldsEditCard;
