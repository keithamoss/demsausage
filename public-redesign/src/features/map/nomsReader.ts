import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import { stringDivider } from '../../app/utils';
import {
	getAllFoodsAvailableOnStalls,
	getPrimaryFoodsAvailableOnStalls,
	getSecondaryFoodsAvailableOnStalls,
	primaryFoodIcons,
	secondaryFoodIcons,
	supportingIcons,
} from '../icons/iconHelpers';
import type { IMapPollingGeoJSONNoms, IPollingPlaceNoms } from '../pollingPlaces/pollingPlacesInterfaces';
import {
	type IMapPollingPlaceFeature,
	getStringOrEmptyStringFromFeature,
	getStringOrUndefinedFromFeature,
} from './mapHelpers';

export class NomsReader {
	static primaryNomsIconValues = getPrimaryFoodsAvailableOnStalls().map((noms) => noms.value);

	static secondaryNomsIconValues = getSecondaryFoodsAvailableOnStalls().map((noms) => noms.value);

	static allNomsIconValues = getAllFoodsAvailableOnStalls().map((noms) => noms.value);

	noms: IPollingPlaceNoms | IMapPollingGeoJSONNoms | null;

	constructor(noms: IPollingPlaceNoms | IMapPollingGeoJSONNoms | null) {
		this.noms = this.filterFalsey(noms);
	}

	public hasAnyNoms() {
		return this.noms !== null;
	}

	public hasRedCrossOfShame() {
		return this.isPropertyTrue('nothing');
	}

	public hasRunOut() {
		return this.isPropertyTrue('run_out');
	}

	public hasNomsOption(prop: string) {
		return this.isPropertyTrue(prop);
	}

	public hasCoreNoms() {
		return this.hasAnyPropertiesTrue(NomsReader.primaryNomsIconValues);
	}

	public hasExtraNoms() {
		return this.hasAnyPropertiesTrue(NomsReader.secondaryNomsIconValues);
	}

	public hasAtLeastOneFoodOptionSelected() {
		return this.hasCoreNoms() === true || this.hasExtraNoms() === true;
	}

	public onlyHasExtraNoms() {
		return this.hasExtraNoms() === true && this.hasCoreNoms() === false;
	}

	public getOnlyFoodIconsFromNoms() {
		if (this.noms === null) {
			return [];
		}

		// This just means we exclude 'free_text' and 'nothing'
		return Object.keys(this.noms).filter((nomsName: string) => NomsReader.allNomsIconValues.includes(nomsName));
	}

	public onlyHasFreeText() {
		// @TODO I think the free_text thing here works to handle the difference between IMapPollingNoms | IMapPollingGeoJSONNoms
		return (
			this.hasCoreNoms() === false &&
			this.hasExtraNoms() === false &&
			this.noms !== null &&
			(this.noms.free_text === true || (typeof this.noms.free_text === 'string' && this.noms.free_text.length >= 1))
		);
	}

	public getIconForNoms() {
		const hasMoreOptions = this.hasExtraNoms();

		if (this.isPropertyTrue('nothing') === true) {
			return supportingIcons.red_cross.icon.ol;
		}

		if (this.hasAllPropertiesTrue(['bbq', 'cake'])) {
			if (this.isPropertyTrue('run_out') === true) {
				return primaryFoodIcons.bbqandcake.iconSoldOut.ol;
			}
			if (hasMoreOptions === true) {
				return primaryFoodIcons.bbqandcake.iconPlus.ol;
			}
			return primaryFoodIcons.bbqandcake.icon.ol;
		}

		if (this.isPropertyTrue('bbq') === true) {
			if (this.isPropertyTrue('run_out') === true) {
				return primaryFoodIcons.bbq.iconSoldOut.ol;
			}
			if (hasMoreOptions === true) {
				return primaryFoodIcons.bbq.iconPlus.ol;
			}
			return primaryFoodIcons.bbq.icon.ol;
		}

		if (this.isPropertyTrue('cake') === true) {
			if (this.isPropertyTrue('run_out') === true) {
				return primaryFoodIcons.cake.iconSoldOut.ol;
			}
			if (hasMoreOptions === true) {
				return primaryFoodIcons.cake.iconPlus.ol;
			}
			return primaryFoodIcons.cake.icon.ol;
		}

		if (this.onlyHasExtraNoms()) {
			// @TODO FIXME when we decide how to handle this
			const firstExtraNomsIcon = Object.keys(this.noms!)[0] as keyof typeof secondaryFoodIcons;
			return firstExtraNomsIcon in secondaryFoodIcons && secondaryFoodIcons[firstExtraNomsIcon].icon.ol !== undefined
				? secondaryFoodIcons[firstExtraNomsIcon].icon.ol
				: supportingIcons.green_plus.icon.ol;
		}

		if (this.onlyHasFreeText()) {
			return supportingIcons.green_plus.icon.ol;
		}

		return null;
	}

	// @TODO
	// Rewrite all of this from scratch one day.
	// Do it more based on column/row position than
	// all of the bodgy hacky math and modifiers
	// we're using now.
	public getDetailedIconsForNoms(
		feature: IMapPollingPlaceFeature,
		// _resolution: number,
	) {
		const scaleFactor = 0.5;
		const iconSize = 80;
		const olStyles: Style[] = [];

		if (this.hasRedCrossOfShame() === true) {
			return supportingIcons.red_cross.icon.olDetailed;
		}

		// 1. Determine the primary icon to use: The green tick, plus, run out, or red cross of shame.
		//    This is used to decorate the actual lat,lon the polling place is at.
		const primaryIcon = this.getPrimaryIcon();
		// @TODO
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		(primaryIcon.getImage() as any).setAnchor([iconSize * scaleFactor, iconSize * scaleFactor]);
		primaryIcon.getImage().setScale(scaleFactor);
		primaryIcon.setZIndex(0);
		olStyles.push(primaryIcon);

		// 2. Label the polling place with the name of its premises
		const fontSize = 16;
		const [label, replaceCount] = stringDivider(
			getStringOrUndefinedFromFeature(feature, 'premises') || getStringOrEmptyStringFromFeature(feature, 'name'),
			16,
			'\n',
		);
		const numberOfLines = replaceCount + 1;
		olStyles.push(
			new Style({
				text: new Text({
					text: label,
					font: `${fontSize}px Roboto, sans-serif`,
					textAlign: 'left',
					offsetX: -(fontSize * 0.5),
					offsetY: replaceCount === 0 ? -10 + -(fontSize * 1.15) : -10 + -(fontSize * numberOfLines) + fontSize * 0.25,
					fill: new Fill({
						color: '#000',
					}),
					stroke: new Stroke({
						color: '#fff',
						width: 3,
					}),
				}),
				zIndex: 10,
			}),
		);

		// 3. Create a 3x2 grid of all of the noms options available
		const nomsIconNames: string[] = this.getOnlyFoodIconsFromNoms();
		const nomsIconNamesSorted: string[] = [];

		NomsReader.primaryNomsIconValues.forEach((iconName) => {
			if (nomsIconNames.includes(iconName) === true) {
				nomsIconNamesSorted.push(iconName);
			}
		});

		nomsIconNames.forEach((iconName) => {
			if (nomsIconNamesSorted.includes(iconName) === false) {
				nomsIconNamesSorted.push(iconName);
			}
		});

		nomsIconNamesSorted.forEach((iconName, index) => {
			const foodIcons = getAllFoodsAvailableOnStalls();
			const foodIcon = foodIcons.find((i) => i.value === iconName);

			if (foodIcon !== undefined) {
				const icon = foodIcon.icon.olDetailed;
				// @TODO
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				(icon.getImage() as any).setAnchor(this.getIconAnchorPosition(index, iconSize, scaleFactor));
				icon.getImage().setScale(scaleFactor);
				olStyles.push(icon);
			}
		});

		return olStyles;
	}

	public getIconAnchorPosition(position: number, iconSize: number, scaleFactor: number) {
		const columnCount = 3;
		const rowPosition = Math.floor(position / columnCount);
		const columnPosition = position % columnCount;

		const paddingX = 0;
		const paddingY = 0;
		const startX = -iconSize + iconSize * scaleFactor - paddingX;
		const startY = iconSize * scaleFactor;

		const anchorX = startX - columnPosition * (iconSize + paddingX);
		const anchorY = startY - rowPosition * (iconSize + paddingY);

		return [anchorX, anchorY];
	}

	public getPrimaryIcon() {
		if (this.hasRunOut() === true) {
			return supportingIcons.yellow_minus.icon.olDetailed;
		}

		if (this.hasExtraNoms() === true) {
			return supportingIcons.green_plus.icon.olDetailed;
		}

		// @TODO This is the fallback for polling places with no other noms e.g. just free_text
		// @TODO Make sure this can't happen at data-entry stage
		return supportingIcons.green_tick.icon.olDetailed;
	}

	private filterFalsey(noms: IPollingPlaceNoms | IMapPollingGeoJSONNoms | null) {
		// For legacy reasons the backend stores falsey values for noms.
		// e.g. {bbq: false, cake: true} only contains one piece of information
		// that we really care about: That the polling place has cake.
		// This function filters out all of these falsey values.

		if (noms === null) {
			return null;
		}

		return Object.fromEntries(Object.entries(noms).filter(([, val]) => val === true));
	}

	private isPropertyTrue(prop: string) {
		return this.noms !== null && prop in this.noms && this.noms[prop as keyof IPollingPlaceNoms] === true;
	}

	private hasAnyPropertiesTrue(props: string[]) {
		for (const prop of props) {
			if (this.isPropertyTrue(prop) === true) {
				return true;
			}
		}
		return false;
	}

	private hasAllPropertiesTrue(props: string[]) {
		for (const prop of props) {
			if (this.isPropertyTrue(prop) === false) {
				return false;
			}
		}
		return true;
	}
}
