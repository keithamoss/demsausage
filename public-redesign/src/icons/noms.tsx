import Tooltip from '@mui/material/Tooltip';
import React from 'react';
import BaconandEggsIcon from './bacon-and-eggs';
import CakeIcon from './cake';
import CoffeeIcon from './coffee';
import HalalIcon from './halal';
import SausageIcon from './sausage';
import VegoIcon from './vego';

// IMPORTANT!
// Noms aren't fully data-driven yet.
// See NomsReader in the other noms.tsx for more manual additions.

export interface IMapFilterOptions {
	bbq?: boolean;
	cake?: boolean;
	vego?: boolean;
	halal?: boolean;
	coffee?: boolean;
	bacon_and_eggs?: boolean;
}

export interface IMapPollingGeoJSONNoms extends IMapFilterOptions {
	free_text?: boolean; // This is actually a boolean - Map GeoJSON returns summary info only
	nothing?: boolean;
	run_out?: boolean;
}

export const spriteIconConfig = {
	// Core icons
	cake: { zIndex: 2, scale: 0.5 },
	cake_plus: { zIndex: 3, scale: 0.5 },
	cake_run_out: { zIndex: 1, scale: 0.5 },
	cake_tick: { zIndex: 3, scale: 0.5 },
	bbq_and_cake: { zIndex: 2, scale: 0.5 },
	bbq_and_cake_plus: { zIndex: 3, scale: 0.5 },
	bbq_and_cake_run_out: { zIndex: 1, scale: 0.5 },
	bbq_and_cake_tick: { zIndex: 3, scale: 0.5 },
	bbq: { zIndex: 2, scale: 0.5 },
	bbq_plus: { zIndex: 3, scale: 0.5 },
	bbq_run_out: { zIndex: 1, scale: 0.5 },
	bbq_tick: { zIndex: 3, scale: 0.5 },

	// Other icons
	unknown: { zIndex: 0, scale: 1, opacity: 0.4 },

	// Additional info icons
	tick: { zIndex: 2, scale: 0.5 },
	plus: { zIndex: 2, scale: 0.5 },
	run_out: { zIndex: 2, scale: 0.5 },
	red_cross_of_shame: { zIndex: 1, scale: 0.4 },

	// Other noms icons
	vego: { zIndex: 0, scale: 0.5 },
	bacon_and_eggs: { zIndex: 0, scale: 0.5 },
	coffee: { zIndex: 0, scale: 0.5 },
	halal: { zIndex: 0, scale: 0.5 },
};

export const nomsData = {
	bbq: {
		icon: <SausageIcon />,
		label: 'Sausage Sizzle',
		value: 'bbq',
		description: "There's a sausage sizzle here",
		is_primary: true,
	},
	cake: {
		icon: <CakeIcon />,
		label: 'Cake Stall',
		value: 'cake',
		description: "There's a cake stall here",
		is_primary: true,
	},
	vego: {
		icon: <VegoIcon />,
		label: 'Savoury Vegetarian',
		value: 'vego',
		description: 'This booth has savoury vegetarian options',
		is_primary: false,
	},
	halal: {
		icon: <HalalIcon />,
		label: 'Halal',
		value: 'halal',
		description: 'This booth has halal food',
		is_primary: false,
	},
	bacon_and_eggs: {
		icon: <BaconandEggsIcon />,
		label: 'Bacon and Eggs',
		value: 'bacon_and_eggs',
		description: "There's coffee available",
		is_primary: false,
	},
	coffee: {
		icon: <CoffeeIcon />,
		label: 'Coffee',
		value: 'coffee',
		description: "There's bacon and egg rolls/sandwiches",
		is_primary: false,
	},
};

export const IconsWithTooltips = () => (
	<React.Fragment>
		{Object.values(nomsData).map((noms) => (
			<Tooltip key={noms.value} disableFocusListener enterTouchDelay={0} title={noms.label}>
				{noms.icon}
			</Tooltip>
		))}
	</React.Fragment>
);
