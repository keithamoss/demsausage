import styled from '@emotion/styled';
import { SvgIcon } from '@mui/material';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import {
	BaconEggs,
	Cake,
	CakeSausage,
	CakeSausage_Plus,
	CakeSausage_SoldOut,
	Cake_Plus,
	Cake_SoldOut,
	Coffee,
	Green_Plus,
	Green_Tick,
	Grey_Question,
	Halal,
	React_BaconEggs,
	React_Cake,
	React_CakeSausage,
	React_CakeSausage_Plus,
	React_CakeSausage_SoldOut,
	React_Cake_Plus,
	React_Cake_SoldOut,
	React_Coffee,
	React_Green_Plus,
	React_Green_Tick,
	React_Grey_Question,
	React_Halal,
	React_Red_Cross,
	React_Sausage,
	React_Sausage_Plus,
	React_Sausage_SoldOut,
	React_Vego,
	React_Yellow_Minus,
	Red_Cross,
	Sausage,
	Sausage_Plus,
	Sausage_SoldOut,
	Vego,
	Yellow_Minus,
} from './icons';
import { createReactSvgIcon, prepareRawSVGForOpenLayers } from './svgHelpers';

export const createOLIcon = (rawSVG: string, zIndex: number, width: number, height: number, style?: string) =>
	new Style({
		image: new Icon({
			src: `data:image/svg+xml;utf8,${prepareRawSVGForOpenLayers(rawSVG, width, height, style)}`,
			// According to https://github.com/openlayers/openlayers/issues/11133#issuecomment-638987210, this forces the icon to be rendered to a canvas internally (whilst not changing the colour).
			// This should result in a performance improvement.
			// Untested, but it doesnt't appear to do any harm.
			color: 'white',
			scale: 0.5,
		}),
		zIndex,
	});

export const createOLDetailedIcon = (rawSVG: string) =>
	new Style({
		image: new Icon({
			src: `data:image/svg+xml;utf8,${prepareRawSVGForOpenLayers(rawSVG, 40, 40)}`,
			// According to https://github.com/openlayers/openlayers/issues/11133#issuecomment-638987210, this forces the icon to be rendered to a canvas internally (whilst not changing the colour).
			// This should result in a performance improvement.
			// Untested, but it doesnt't appear to do any harm.
			color: 'white',
			scale: 0.5,
			anchorXUnits: 'pixels',
			anchorYUnits: 'pixels',
		}),
		zIndex: 1,
	});

// Displays a set of food options icons in a horizontal row
export const IconsFlexboxHorizontalSummaryRow = styled('div')(() => ({
	flexGrow: 1,
	svg: {
		width: '34px',
		height: '34px',
		marginRight: '5px',
	},
}));

// Used when we're displaying the icons in a set of stacked rows e.g. the add stall and filter interfaces
export const standaloneIconSize = { width: 34, height: 34 };

export const getAllFoodsAvailableOnStalls = () => [
	...getPrimaryFoodsAvailableOnStalls(),
	...getSecondaryFoodsAvailableOnStalls(),
];

export const getPrimaryFoodsAvailableOnStalls = () => [primaryFoodIcons.bbq, primaryFoodIcons.cake];

export const getSecondaryFoodsAvailableOnStalls = () => [
	secondaryFoodIcons.vego,
	secondaryFoodIcons.halal,
	secondaryFoodIcons.bacon_and_eggs,
	secondaryFoodIcons.coffee,
];

// #############################################
// NOTE:
// If adding any primary or secondary food icons, be sure
// to also update getFoodDescription() in polling_places.py
// #############################################

export const primaryFoodIcons /*: {
    [key in keyof IMapFilterSettings]: {
        icon: ReactElement;
        label: string;
        value: string;
        description: string;
    };
}*/ = {
	// ######################################
	// These are the core noms with their
	// associated modifiers (e.g. plus, sold out)
	// Includes:
	// - BBQ
	// - Cake
	// - BBQ and Cake
	// ######################################
	bbq: {
		icon: {
			raw: Sausage,
			react: createReactSvgIcon(React_Sausage),
			ol: createOLIcon(Sausage, 2, 40, 40),
			olDetailed: createOLDetailedIcon(Sausage),
		},
		iconPlus: {
			raw: Sausage_Plus,
			react: createReactSvgIcon(React_Sausage_Plus),
			ol: createOLIcon(Sausage_Plus, 3, 40, 40),
		},
		iconSoldOut: {
			raw: Sausage_SoldOut,
			react: createReactSvgIcon(React_Sausage_SoldOut),
			ol: createOLIcon(Sausage_SoldOut, 1, 40, 40),
		},
		value: 'bbq',
		label: 'Sausage sizzle',
		description: "There's a sausage sizzle here",
	},
	cake: {
		icon: {
			raw: Cake,
			react: createReactSvgIcon(React_Cake),
			ol: createOLIcon(Cake, 2, 40, 40),
			olDetailed: createOLDetailedIcon(Cake),
		},
		iconPlus: {
			raw: Cake_Plus,
			react: createReactSvgIcon(React_Cake_Plus),
			ol: createOLIcon(Cake_Plus, 3, 40, 40),
		},
		iconSoldOut: {
			raw: Cake_SoldOut,
			react: createReactSvgIcon(React_Cake_SoldOut),
			ol: createOLIcon(Cake_SoldOut, 1, 40, 40),
		},
		label: 'Cake stall',
		value: 'cake',
		description: "There's a cake stall here",
	},
	bbqandcake: {
		icon: {
			raw: CakeSausage,
			react: createReactSvgIcon(React_CakeSausage),
			ol: createOLIcon(CakeSausage, 2, 40, 40),
			olDetailed: createOLDetailedIcon(CakeSausage),
		},
		iconPlus: {
			raw: CakeSausage_Plus,
			react: createReactSvgIcon(React_CakeSausage_Plus),
			ol: createOLIcon(CakeSausage_Plus, 3, 40, 40),
		},
		iconSoldOut: {
			raw: CakeSausage_SoldOut,
			react: createReactSvgIcon(React_CakeSausage_SoldOut),
			ol: createOLIcon(CakeSausage_SoldOut, 1, 40, 40),
		},
		label: 'Sausage sizzle and cake stall',
		value: 'bbqandcake',
		description: "There's a sausage sizzle and a cake stall here",
	},
};

export const secondaryFoodIcons = {
	// ######################################
	// These are the secondary noms
	// Includes:
	// - Vego
	// - Halal
	// - Bacon and Eggs
	// - Coffee
	// ######################################
	vego: {
		icon: {
			raw: Vego,
			react: createReactSvgIcon(React_Vego),
			ol: createOLIcon(Vego, 0, 40, 40),
			olDetailed: createOLDetailedIcon(Vego),
		},
		label: 'Savoury vegetarian options',
		value: 'vego',
		description: 'This booth has savoury vegetarian options',
	},
	halal: {
		icon: {
			raw: Halal,
			react: createReactSvgIcon(React_Halal),
			ol: createOLIcon(Halal, 0, 40, 40),
			olDetailed: createOLDetailedIcon(Halal),
		},
		label: 'Halal options',
		value: 'halal',
		description: 'This booth has halal food',
	},
	bacon_and_eggs: {
		icon: {
			raw: BaconEggs,
			react: createReactSvgIcon(React_BaconEggs),
			ol: createOLIcon(BaconEggs, 0, 40, 40),
			olDetailed: createOLDetailedIcon(BaconEggs),
		},
		label: 'Bacon and eggs',
		value: 'bacon_and_eggs',
		description: "There's bacon and egg rolls or sandwiches",
	},
	coffee: {
		icon: {
			raw: Coffee,
			react: createReactSvgIcon(React_Coffee),
			ol: createOLIcon(Coffee, 0, 40, 40),
			olDetailed: createOLDetailedIcon(Coffee),
		},
		label: 'Coffee',
		value: 'coffee',
		description: "There's coffee available",
	},
};

export const getSupportingIconsForAboutPage = () => [
	supportingIcons.yellow_minus,
	supportingIcons.red_cross,
	supportingIcons.grey_question,
];

export const supportingIcons = {
	// ######################################
	// These are the supporting icons that
	// we use on polling places
	// Includes:
	// - Green Plus
	// - Green Tick
	// - Yellow Minus
	// - Red Cross
	// - Grey Question
	// ######################################
	green_plus: {
		// Used to indicate that there are secondary noms in
		// addition to the core noms show on the icon.
		// e.g. A sausage with a plus can indicate
		// "Sausage sizzle and coffee"
		// This standalone verison is used in one place:
		// - The 'detailed' view show on the map
		icon: {
			raw: Green_Plus,
			react: createReactSvgIcon(React_Green_Plus),
			ol: createOLIcon(Green_Plus, 2, 40, 40),
			olDetailed: createOLDetailedIcon(Green_Plus),
		},
		label: 'Green Plus',
		value: 'green_plus',
		description: 'The user never sees this icon on its own',
	},
	green_tick: {
		// Used to indicate there are reports for a booth.
		// This standalone verison is used in one place:
		// - The 'detailed' view show on the map (where it
		// appears as the first icon in the list)
		// NOTE: Once we rewrite that ugly bit of code, we
		// could probably get rid of it as it I don't think it
		// really adds anything.
		icon: {
			raw: Green_Tick,
			react: createReactSvgIcon(React_Green_Tick),
			ol: createOLIcon(Green_Tick, 2, 40, 40),
			olDetailed: createOLDetailedIcon(Green_Tick),
		},
		label: 'Green Tick',
		value: 'green_tick',
		description: 'The user never sees this icon on its own',
	},
	yellow_minus: {
		// Used to indicate that a polling place has run out of
		// one or more of the noms they had on offer.
		// This standalone verison is used in two places:
		// - The 'detailed' view show on the map
		// - On polling place cards
		icon: {
			raw: Yellow_Minus,
			react: createReactSvgIcon(React_Yellow_Minus),
			ol: createOLIcon(Yellow_Minus, 2, 40, 40),
			olDetailed: createOLDetailedIcon(Yellow_Minus),
		},
		label: 'Sold Out',
		value: 'yellow_minus',
		description: "Our roving reporters have informed us that they've run out of food here",
	},
	red_cross: {
		// Used to indicate that a polling place has a definite
		// negative report of no stall.
		// This standalone version is used in four places:
		// - The primary view show on the map
		// - The 'detailed' view show on the map
		// - In polling place search results
		// - On polling place cards
		icon: {
			raw: Red_Cross,
			// react: createReactSvgIcon(React_Red_Cross),
			// @TODO Temporary until resized icons are available
			react: (
				<SvgIcon>
					<React_Red_Cross width={'36'} height={'36'} />
				</SvgIcon>
			),
			ol: createOLIcon(Red_Cross, 1, 40, 40),
			olDetailed: createOLDetailedIcon(Red_Cross),
		},
		label: 'Red Cross of Shame',
		value: 'red_cross',
		description: "Our roving reporters have informed us that there's no stall here",
	},
	grey_question: {
		// Used to indicate we don't yet have any reports
		// for this polling place.
		// This standalone version is used in one place:
		// - The primary view show on the map
		icon: {
			raw: Grey_Question,
			react: createReactSvgIcon(React_Grey_Question),
			ol: createOLIcon(Grey_Question, 0, 30, 30, 'opacity: 0.7'),
			olDetailed: createOLDetailedIcon(Grey_Question),
		},
		label: 'No reports',
		value: 'grey_question',
		description: "We don't have any reports for this polling place",
	},
};
