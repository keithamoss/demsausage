import { Tooltip } from '@mui/material';
import React from 'react';
import type { StallFoodOptions, StallNonFoodOptions } from '../../app/services/stalls';
import { getAllFoodsAvailableOnStalls, supportingIcons } from '../icons/iconHelpers';

export const isSearchingYet = (search_term: string) => search_term.length >= 3;

// https://stackoverflow.com/a/57528471
export const wrapIconWithTooltip = (icon: JSX.Element, title: string) => (
	<Tooltip key={title} title={title} disableFocusListener enterTouchDelay={0}>
		{icon}
	</Tooltip>
);

export const getNomsIconsBar = (
	noms: StallFoodOptions & StallNonFoodOptions,
	allowRedCrossOfShame: boolean,
	allowSoldOut: boolean,
) => {
	if (noms.nothing) {
		// For PollingPlaceCards, we don't display the Red Cross of Shame in the list of noms icons, it gets displayed as part of other elements of the card
		return allowRedCrossOfShame === true
			? wrapIconWithTooltip(supportingIcons.red_cross.icon.react, supportingIcons.red_cross.description)
			: null;
	}
	const foodIcons = getAllFoodsAvailableOnStalls();

	return (
		<React.Fragment>
			{Object.keys(noms || {}).map((key) => {
				const foodIcon = foodIcons.find((i) => i.value === key);

				if (foodIcon !== undefined) {
					return wrapIconWithTooltip(foodIcon.icon.react, foodIcon.label);
				}
			})}
			{/* For PollingPlaceCards, we don't display the Sold Out icon in the list of noms icons, it gets displayed as part of other elements of the card */}
			{allowSoldOut === true &&
				noms.run_out === true &&
				wrapIconWithTooltip(supportingIcons.yellow_minus.icon.react, supportingIcons.yellow_minus.description)}
		</React.Fragment>
	);
};
