import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import { stringDivider } from '../../app/utils';
import { IMapPollingGeoJSONNoms, IMapPollingNoms, NomsOptionsAvailable } from '../icons/noms';
import { IMapPollingPlaceFeature, getStringOrEmptyStringFromFeature } from './mapHelpers';
import { SpriteIcons, SpriteIconsDetailed } from './mapStyleHelpers';

export class NomsReader {
	static coreNomsIcons = Object.values(NomsOptionsAvailable)
		.filter((noms) => noms.is_primary === true)
		.map((noms) => noms.value)
		.concat(['nothing', 'run_out']);

	static foodNomsIcons = Object.values(NomsOptionsAvailable).map((noms) => noms.value);

	static additionalFoodNomsIcons = Object.values(NomsOptionsAvailable)
		.filter((noms) => noms.is_primary === false)
		.map((noms) => noms.value);

	noms: IMapPollingNoms | IMapPollingGeoJSONNoms | null;

	constructor(noms: IMapPollingNoms | IMapPollingGeoJSONNoms | null) {
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

	public hasExtraNoms() {
		return this.hasAnyPropertiesTrue(NomsReader.additionalFoodNomsIcons);
	}

	public hasCoreNoms() {
		return this.hasAnyPropertiesTrue(NomsReader.coreNomsIcons);
	}

	public onlyHasExtraNoms() {
		return this.hasExtraNoms() === true && this.hasCoreNoms() === false;
	}

	public getFoodIconNamesFromNoms() {
		if (this.noms === null) {
			return [];
		}

		return Object.keys(this.noms).filter((nomsName: string) => NomsReader.foodNomsIcons.includes(nomsName));
	}

	public onlyHasFreeText() {
		// @TODO I think the free_text thing here works to handle the difference between IMapPollingNoms | IMapPollingGeoJSONNoms
		return (
			this.hasCoreNoms() === false &&
			this.hasExtraNoms() === false &&
			this.noms !== null &&
			(this.noms.free_text === true || typeof this.noms.free_text === 'string')
		);
	}

	public getIconForNoms(spriteIcons: SpriteIcons) {
		const hasMoreOptions = this.hasExtraNoms();

		if (this.isPropertyTrue('nothing') === true) {
			return spriteIcons.red_cross_of_shame;
		}

		if (this.hasAllPropertiesTrue(['bbq', 'cake'])) {
			if (this.isPropertyTrue('run_out') === true) {
				return spriteIcons.bbq_and_cake_run_out;
			}
			if (hasMoreOptions === true) {
				return spriteIcons.bbq_and_cake_plus;
			}
			return spriteIcons.bbq_and_cake;
		}

		if (this.isPropertyTrue('bbq') === true) {
			if (this.isPropertyTrue('run_out') === true) {
				return spriteIcons.bbq_run_out;
			}
			if (hasMoreOptions === true) {
				return spriteIcons.bbq_plus;
			}
			return spriteIcons.bbq;
		}

		if (this.isPropertyTrue('cake') === true) {
			if (this.isPropertyTrue('run_out') === true) {
				return spriteIcons.cake_run_out;
			}
			if (hasMoreOptions === true) {
				return spriteIcons.cake_plus;
			}
			return spriteIcons.cake;
		}

		if (this.onlyHasExtraNoms()) {
			const firstExtraNomsIcon = Object.keys(this.noms!)[0];
			return firstExtraNomsIcon in spriteIcons ? spriteIcons[firstExtraNomsIcon] : spriteIcons.unknown;
		}

		if (this.onlyHasFreeText()) {
			return spriteIcons.tick;
		}

		return null;
	}

	public getDetailedIconsForNoms(
		spriteIcons: SpriteIcons,
		spriteIconsDetailed: SpriteIconsDetailed,
		feature: IMapPollingPlaceFeature,
		// _resolution: number,
	) {
		const scaleFactor = 0.4;
		const iconSize = 64;
		const olStyles: Style[] = [];

		if (this.hasRedCrossOfShame() === true) {
			return spriteIcons.red_cross_of_shame;
		}

		// 1. Determine the primary icon to use: The green tick, plus, run out, or red cross of shame.
		//    This is used to decorate the actual lat,lon the polling place is at.
		const primaryIconName = this.getPrimaryIconName();
		const primaryIcon = spriteIconsDetailed[primaryIconName];
		// @TODO
		// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
		(primaryIcon.getImage() as any).setAnchor([iconSize * scaleFactor, iconSize * scaleFactor]);
		primaryIcon.getImage().setScale(scaleFactor);
		primaryIcon.setZIndex(0);
		olStyles.push(primaryIcon);

		// 2. Label the polling place with the name of its premises
		const fontSize = 16;
		const [label, replaceCount] = stringDivider(getStringOrEmptyStringFromFeature(feature, 'premises'), 16, '\n');
		const numberOfLines = replaceCount + 1;
		olStyles.push(
			new Style({
				text: new Text({
					text: label,
					font: `${fontSize}px Roboto, sans-serif`,
					textAlign: 'left',
					offsetX: -(fontSize * 0.5),
					offsetY: replaceCount === 0 ? -(fontSize * 1.15) : -(fontSize * numberOfLines) + fontSize * 0.25,
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
		const spriteIconNames: string[] = this.getFoodIconNamesFromNoms().sort();

		spriteIconNames.forEach((iconName, index) => {
			const icon = spriteIconsDetailed[iconName];
			// @TODO
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
			(icon.getImage() as any).setAnchor(this.getIconAnchorPosition(index, iconSize, scaleFactor));
			icon.getImage().setScale(scaleFactor);
			olStyles.push(icon);
		});

		return olStyles;
	}

	public getPrimaryIconName() {
		if (this.hasRunOut() === true) {
			return 'run_out';
		}
		if (this.hasExtraNoms() === true) {
			return 'plus';
		}
		return 'tick';
	}

	public getIconAnchorPosition(position: number, iconSize: number, scaleFactor: number) {
		const columnCount = 3;
		const rowPosition = Math.floor(position / columnCount);
		const columnPosition = position % columnCount;

		const paddingX = 18;
		const paddingY = 18;
		const startX = -iconSize + iconSize * scaleFactor - paddingX;
		const startY = iconSize * scaleFactor;

		const anchorX = startX - columnPosition * (iconSize + paddingX);
		const anchorY = startY - rowPosition * (iconSize + paddingY);

		return [anchorX, anchorY];
	}

	private filterFalsey(noms: IMapPollingNoms | IMapPollingGeoJSONNoms | null) {
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
		return this.noms !== null && prop in this.noms && this.noms[prop as keyof IMapPollingNoms] === true;
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
