import Circle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Icon from "ol/style/Icon";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { NomsReader } from "./noms";
import sprite from "./sprite.json";

export function getAPIBaseURL(): string {
  return process.env.REACT_APP_API_BASE_URL!;
}

export interface IGeoJSONFeatureCollection {
  type: string;
  features: IGeoJSON[];
}

export interface IGeoJSON {
  type: string;
  coordinates: [number, number];
}

export interface IMapSearchResults {
  lon: number;
  lat: number;
  extent: [number, number, number, number] | null;
  formattedAddress: string;
  padding?: boolean;
  animation?: boolean;
}
export interface IMapFilterOptions {
  bbq?: boolean;
  cake?: boolean;
  vego?: boolean;
  halal?: boolean;
  coffee?: boolean;
  bacon_and_eggs?: boolean;
}

export interface IMapPollingGeoJSONNoms {
  bbq?: boolean;
  cake?: boolean;
  nothing?: boolean;
  run_out?: boolean;
  bacon_and_eggs?: boolean;
  halal?: boolean;
  vego?: boolean;
  coffee?: boolean;
  free_text?: boolean; // This is actually a boolean - Map GeoJSON returns summary info only
}

const spriteIconConfig = {
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

const spriteIcons = {};
const spriteIconsDetailed = {};
Object.entries(spriteIconConfig).forEach(([iconName, iconConfig]: any) => {
  const spriteConfig = sprite.frames.find(
    (config: any) => config.filename === `${iconName}.png`
  );

  if (spriteConfig !== undefined) {
    const iconAttributes = {
      src: `./icons/sprite_${sprite.meta.hash}.png`,
      offset: [Math.abs(spriteConfig.frame.x), Math.abs(spriteConfig.frame.y)],
      size: [spriteConfig.spriteSourceSize.w, spriteConfig.spriteSourceSize.h],
      scale: iconConfig.scale,
      opacity: "opacity" in iconConfig ? iconConfig.opacity : undefined,
    } as any; /* IconOptions */

    // An initial attempt to give icons background colour
    // It doesn't look great (like Apple Maps), I think in part because our
    // icons have such different colours (and dimensions?).
    // Needs some design love.
    // https://blog.mercury.io/revisiting-the-iconography-of-apple-maps/
    if (
      iconName === "disabled"
      // iconName === "cake" ||
      // iconName === "bbq" ||
      // iconName === "bbq_and_cake"
    ) {
      const width = spriteConfig.spriteSourceSize.w / 2.75;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore-next-line
      spriteIcons[iconName] = [
        new Style({
          zIndex: iconConfig.zIndex,
          image: new Icon(iconAttributes),
        }),
        new Style({
          zIndex: iconConfig.zIndex - 1,
          image: new Circle({
            radius: width,
            fill: new Fill({
              // Purple
              // color: [103, 64, 180, 1],
              // White
              color: [250, 250, 248, 1],
            }),
            stroke: new Stroke({
              // Grey
              color: [151, 164, 175, 0.6],
              width: 2,
            }),
          }),
        }),
      ];
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore-next-line
      spriteIcons[iconName] = [
        new Style({
          image: new Icon(iconAttributes),
          zIndex: iconConfig.zIndex,
        }),
      ];
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    spriteIconsDetailed[iconName] = new Style({
      image: new Icon({
        ...iconAttributes,
        anchorXUnits: "pixels",
        anchorYUnits: "pixels",
      }),
      zIndex: 1,
    });
  }
});

export const hasFilterOptions = (mapFilterOptions: IMapFilterOptions) =>
  Object.values(mapFilterOptions).filter((enabled: boolean) => enabled === true)
    .length > 0;

export const satisfiesMapFilter = (
  noms: NomsReader,
  mapFilterOptions: IMapFilterOptions
) => {
  if (hasFilterOptions(mapFilterOptions) && noms.hasAnyNoms() === true) {
    for (const [option, enabled] of Object.entries(mapFilterOptions)) {
      if (enabled === true && noms.hasNomsOption(option) === false) {
        return false;
      }
    }
    return true;
  }

  return true;
};

export const olStyleFunction = (
  feature: IMapPollingPlaceFeature,
  resolution: number,
  mapFilterOptions: IMapFilterOptions
) => {
  const nomsReader = new NomsReader(feature.get("noms"));

  if (nomsReader.hasAnyNoms() === true) {
    if (
      hasFilterOptions(mapFilterOptions) === true &&
      satisfiesMapFilter(nomsReader, mapFilterOptions) === false
    ) {
      return null;
    }

    return resolution >= 7
      ? nomsReader.getIconForNoms(spriteIcons)
      : nomsReader.getDetailedIconsForNoms(
          spriteIcons,
          spriteIconsDetailed,
          feature,
          resolution
        );
  }

  return hasFilterOptions(mapFilterOptions) === false
    ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore-next-line
      spriteIcons.unknown
    : null;
};

// @FIXME Use the inbuilt OLFeature type when we upgrade
export interface IMapPollingPlaceFeature {
  getId: Function;
  getProperties: Function;
  get: Function;
}

export interface IElection {
  id: number;
  geom: IGeoJSONPoylgon;
  name: string;
  short_name: string;
  is_hidden: boolean;
  is_primary: boolean;
  election_day: string; // Datetime
  polling_places_loaded: boolean;
}

export interface IGeoJSONPoylgon {
  type: string;
  // coordinates: [[[number, number]]];
  coordinates: number[][][];
}