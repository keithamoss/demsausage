import {
	Looks3Outlined,
	Looks4Outlined,
	Looks5Outlined,
	Looks6Outlined,
	LooksOneOutlined,
	LooksTwoOutlined,
} from '@mui/icons-material';
import { Tooltip, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import React from 'react';
import type { PendingStall, PollingPlaceWithPendingStall } from '../../app/services/stalls';
import { default as Owl } from '../../assets/illustrations/illlustrations.co/owl.svg?react';
import { getAllFoodsAvailableOnStalls, supportingIcons } from '../icons/iconHelpers';
import type { IPollingPlaceNoms } from '../pollingPlaces/pollingPlacesInterfaces';

export const getCountOfExistingStallsIcon = (count: number) => {
	switch (count) {
		case 0:
			return undefined;
		case 1:
			return <LooksOneOutlined />;
		case 2:
			return <LooksTwoOutlined />;
		case 3:
			return <Looks3Outlined />;
		case 4:
			return <Looks4Outlined />;
		case 5:
			return <Looks5Outlined />;
		case 6:
			return <Looks6Outlined />;
		default:
			return <LooksOneOutlined />;
	}
};

export const PendingStallsAllCaughtUp = () => (
	<Stack
		spacing={2}
		sx={{
			justifyContent: 'center',
			alignItems: 'center',
			'& > *': { maxWidth: 400 },
		}}
	>
		<Owl />

		<Box sx={{ textAlign: 'center', marginTop: '-40px !important' }}>
			<Typography variant="h4" gutterBottom>
				We're all caught up! There are no pending submissions.
			</Typography>

			<Typography variant="subtitle2">(Nor are the owls what they seem.)</Typography>
		</Box>
	</Stack>
);

// https://stackoverflow.com/a/57528471
export const wrapIconWithTooltip = (icon: JSX.Element, title: string, showFaded = false) => (
	<Tooltip
		key={title}
		title={title}
		disableFocusListener
		enterTouchDelay={0}
		sx={showFaded === true ? { filter: 'grayscale(1) sepia(30%) opacity(60%)' } : undefined}
	>
		{icon}
	</Tooltip>
);

export const getNomsIconsForPendingStall = (
	stall: PendingStall,
	pollingPlace: PollingPlaceWithPendingStall,
	allowRedCrossOfShame: boolean,
	allowSoldOut: boolean,
) => {
	if (stall.noms.nothing) {
		// For PollingPlaceCards, we don't display the Red Cross of Shame in the list of noms icons, it gets displayed as part of other elements of the card
		return allowRedCrossOfShame === true
			? wrapIconWithTooltip(supportingIcons.red_cross.icon.react, supportingIcons.red_cross.description)
			: null;
	}
	const foodIcons = getAllFoodsAvailableOnStalls();

	return (
		<React.Fragment>
			{Object.keys(stall.noms || {}).map((key) => {
				const foodIcon = foodIcons.find((i) => i.value === key);

				if (foodIcon !== undefined) {
					const isAlreadyOnPollingPlaceNoms =
						pollingPlace.stall?.noms !== undefined &&
						pollingPlace.stall.noms[foodIcon.value as keyof IPollingPlaceNoms] === true;

					return wrapIconWithTooltip(foodIcon.icon.react, foodIcon.label, isAlreadyOnPollingPlaceNoms === true);
				}
			})}

			{/* For PollingPlaceCards, we don't display the Sold Out icon in the list of noms icons, it gets displayed as part of other elements of the card */}
			{allowSoldOut === true &&
				stall.noms.run_out === true &&
				wrapIconWithTooltip(supportingIcons.yellow_minus.icon.react, supportingIcons.yellow_minus.description)}
		</React.Fragment>
	);
};
