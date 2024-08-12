import CloseIcon from '@mui/icons-material/Close';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import MapIcon from '@mui/icons-material/Map';
import { Alert, AlertTitle, Badge, styled, useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React, { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppSelector } from '../../../../app/hooks';
import { navigateToMapUsingURLParamsWithoutUpdatingTheView } from '../../../../app/routing/navigationHelpers/navigationHelpersMap';
import { mapaThemePrimaryPurple } from '../../../../app/ui/theme';
import { selectIsMapFiltered, selectNumberOfMapFilterSettingsApplied } from '../../../app/appSlice';
import SearchFilterComponent from '../../shared/searchFilterComponent';

const IconButtonOutlined = styled(Button)({
	minWidth: '39px',
	'& .MuiButton-icon': {
		marginLeft: 0,
		marginRight: 0,
	},
});

interface Props {
	numberOfResults: number;
	isFiltered: boolean;
	pollingPlacesLoaded: boolean;
	onViewOnMap: () => void;
	children: JSX.Element[];
}

export default function SearchByIdsResultsContainer(props: Props) {
	const { numberOfResults, isFiltered, pollingPlacesLoaded, onViewOnMap, children } = props;

	const params = useParams();
	const navigate = useNavigate();

	const isMobile = useMediaQuery('(max-width: 485px)');

	// ######################
	// Filter Control
	// ######################
	const [isSearchBarFilterControlOpen, setIsSearchBarFilterControlOpen] = useState(false);
	const isMapFiltered = useAppSelector(selectIsMapFiltered);
	const numberOfMapFilterSettingsApplied = useAppSelector(selectNumberOfMapFilterSettingsApplied);

	const onClickFilterControl = useCallback(() => {
		setIsSearchBarFilterControlOpen(!isSearchBarFilterControlOpen);
	}, [isSearchBarFilterControlOpen]);
	// ######################
	// Filter Control (End)
	// ######################

	// ######################
	// Close Panel
	// ######################
	const onClose = useCallback(() => {
		// We always arrive here by coming directly from the map, so we can
		// just send the user right back to their current view of the map.
		navigateToMapUsingURLParamsWithoutUpdatingTheView(params, navigate);
	}, [navigate, params]);
	// ######################
	// Close Panel (End)
	// ######################

	return (
		<Box
			sx={{
				width: '100%',
				// Matches the 12px we have on our <Box> child when add the 8px of padding on the <Box> that's our parent
				marginTop: 0.5,
			}}
		>
			<Box
				sx={{
					width: '100%',
					marginBottom: 1.5,
					display: 'flex',
				}}
			>
				<Button
					size="small"
					sx={{
						flex: 1,
						justifyContent: 'flex-start',
						alignItems: 'flex-start',
						color: 'black !important',
					}}
					disabled={true}
				>
					{numberOfResults} result{numberOfResults === 0 || numberOfResults > 1 ? 's' : ''} nearby
				</Button>

				<Button size="small" sx={{ mr: 1 }} startIcon={<MapIcon />} onClick={onViewOnMap} variant="outlined">
					view on map
				</Button>

				{isMobile === true ? (
					<React.Fragment>
						<IconButtonOutlined
							size="small"
							sx={{ mr: 1 }}
							startIcon={
								isMapFiltered === true ? (
									<Badge badgeContent={numberOfMapFilterSettingsApplied} color="secondary">
										<FilterAltOutlinedIcon sx={{ color: mapaThemePrimaryPurple }} />
									</Badge>
								) : (
									<FilterAltOffOutlinedIcon sx={{ color: mapaThemePrimaryPurple }} />
								)
							}
							onClick={onClickFilterControl}
							aria-label="Open the filter panel to control which types of polling places are shown on the map"
							variant="outlined"
						/>

						<IconButtonOutlined size="small" startIcon={<CloseIcon />} onClick={onClose} variant="outlined" />
					</React.Fragment>
				) : (
					<React.Fragment>
						<Button
							size="small"
							sx={{ mr: 1 }}
							startIcon={
								isMapFiltered === true ? (
									<Badge badgeContent={numberOfMapFilterSettingsApplied} color="secondary">
										<FilterAltOutlinedIcon sx={{ color: mapaThemePrimaryPurple }} />
									</Badge>
								) : (
									<FilterAltOffOutlinedIcon sx={{ color: mapaThemePrimaryPurple }} />
								)
							}
							onClick={onClickFilterControl}
							aria-label="Open the filter panel to control which types of polling places are shown on the map"
							variant="outlined"
						>
							filter
						</Button>

						<Button size="small" startIcon={<CloseIcon />} onClick={onClose} variant="outlined">
							close
						</Button>
					</React.Fragment>
				)}
			</Box>

			{isSearchBarFilterControlOpen === true && <SearchFilterComponent marginBottom={1} />}

			{pollingPlacesLoaded === false && (
				<Alert
					severity="warning"
					sx={{
						mb: 1,
						// The banner's colour at 50% opacity
						backgroundColor: 'rgba(249, 205, 95, 0.5)',
						color: 'rgba(0, 0, 0, 0.87)',
						'& svg': {
							// The primary colour on the sausage icon
							// color: '#ff9000',
						},
					}}
				>
					<AlertTitle>We don&apos;t have the official list of polling places yet</AlertTitle>
					So for now, we&apos;re listing stall locations based on reports from the community.
				</Alert>
			)}

			{/* Handles not found and all other types of error */}
			{numberOfResults === 0 && (
				<Alert severity="info">
					<AlertTitle>No results found</AlertTitle>
					{isFiltered === true
						? "Sorry, we couldn't find any polling places that match your filter criteria 😢"
						: "Sorry, we couldn't find any polling places 😢"}
				</Alert>
			)}

			<Stack spacing={1}>{children}</Stack>
		</Box>
	);
}
