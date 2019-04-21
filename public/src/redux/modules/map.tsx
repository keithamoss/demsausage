import * as dotProp from "dot-prop-immutable"
import Icon from "ol/style/Icon"
import Style from "ol/style/Style"
import * as sprite from "../../icons/sprite_v5.json"
import { IMapPollingGeoJSONNoms, IMapPollingPlaceFeature } from "./polling_places"
// import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"

// Actions
const SEARCH_MAP = "ealgis/map/SEARCH_MAP"
const CLEAR_MAP_SEARCH = "ealgis/map/CLEAR_MAP_SEARCH"

const initialState: Partial<IModule> = {
    search: null,
}

// Reducer
export default function reducer(state: Partial<IModule> = initialState, action: IAction) {
    switch (action.type) {
        case SEARCH_MAP:
            return dotProp.set(state, "search", action.searchParams)
        case CLEAR_MAP_SEARCH:
            return dotProp.set(state, "search", null)
        default:
            return state
    }
}

// Action Creators

export function setMapToSearch(searchParams: IMapSearchResults) {
    return {
        type: SEARCH_MAP,
        searchParams,
    }
}
export function clearMapToSearch() {
    return {
        type: CLEAR_MAP_SEARCH,
    }
}

// Models
export interface IModule {
    search: IMapSearchResults | null
}

export interface IMapSearchResults {
    lon: number
    lat: number
    extent: [number, number, number, number] | null
    formattedAddress: string
}

export interface IMapFilterOptions {
    vego?: boolean
    halal?: boolean
    coffee?: boolean
    bacon_and_eggs?: boolean
}

export interface IAction {
    type: string
    searchParams?: IMapSearchResults
    meta?: {
        // analytics: IAnalyticsMeta
    }
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera

// Utilities
const spriteIconConfig = {
    cake: { zIndex: 2, scale: 0.5 },
    cake_plus: { zIndex: 3, scale: 0.5 },
    cake_run_out: { zIndex: 1, scale: 0.5 },
    cake_tick: { zIndex: 3, scale: 0.5 },
    sausage_and_cake: { zIndex: 2, scale: 0.5 },
    sausage_and_cake_plus: { zIndex: 3, scale: 0.5 },
    sausage_and_cake_run_out: { zIndex: 1, scale: 0.5 },
    sausage_and_cake_tick: { zIndex: 3, scale: 0.5 },
    sausage: { zIndex: 2, scale: 0.5 },
    sausage_plus: { zIndex: 3, scale: 0.5 },
    sausage_run_out: { zIndex: 1, scale: 0.5 },
    sausage_tick: { zIndex: 3, scale: 0.5 },
    "red-cross-of-shame": { zIndex: 2, scale: 0.4 },
    unknown: { zIndex: 0, scale: 1, opacity: 0.4 },

    // Unused
    vegetables: { zIndex: 0, scale: 0.5 },
    "egg-and-bacon": { zIndex: 0, scale: 0.5 },
    coffee: { zIndex: 0, scale: 0.5 },
}

let spriteIcons = {}
Object.entries(spriteIconConfig).forEach(([iconName, iconConfig]: any) => {
    const spriteConfig = sprite.frames.find((config: any) => config.filename === `${iconName}.png`)

    if (spriteConfig !== undefined) {
        spriteIcons[iconName] = new Style({
            image: new Icon({
                src: "./icons/sprite_v5.png",
                offset: [Math.abs(spriteConfig.frame.x), Math.abs(spriteConfig.frame.y)],
                size: [spriteConfig.sourceSize.w, spriteConfig.sourceSize.h],
                scale: iconConfig.scale,
                opacity: "opacity" in iconConfig ? iconConfig.opacity : undefined,
            }),
            zIndex: iconConfig.zIndex,
        })
    }
})

export const hasFilterOptions = (mapFilterOptions: IMapFilterOptions) =>
    Object.values(mapFilterOptions).filter((enabled: boolean) => enabled === true).length > 0

export const isFilterEnabled = (option: string, mapFilterOptions: IMapFilterOptions) =>
    option in mapFilterOptions && mapFilterOptions[option] === true

export const hasNomsOption = (option: string, noms: IMapPollingGeoJSONNoms) => option in noms && noms[option] === true

export const satisfiesMapFilter = (noms: IMapPollingGeoJSONNoms, mapFilterOptions: IMapFilterOptions) => {
    if (hasFilterOptions(mapFilterOptions) && noms !== null) {
        for (const [option, enabled] of Object.entries(mapFilterOptions)) {
            if (enabled === true && hasNomsOption(option, noms) === false) {
                return false
            }
        }
        return true
    }

    return true
}

export const getIconForNoms = (noms: IMapPollingGeoJSONNoms) => {
    const hasMoreOptions = (noms: IMapPollingGeoJSONNoms) => Object.keys(noms).length > ("run_out" in noms ? 3 : 2)

    if (noms.nothing === true) {
        return spriteIcons["red-cross-of-shame"]
    } else if (noms.bbq === true && noms.cake === true) {
        if (noms.run_out === true) {
            return spriteIcons["sausage_and_cake_run_out"]
        } else if (hasMoreOptions(noms) === true) {
            return spriteIcons["sausage_and_cake_plus"]
        }
        return spriteIcons["sausage_and_cake"]
    } else if (noms.bbq === true) {
        if (noms.run_out === true) {
            return spriteIcons["sausage_run_out"]
        } else if (hasMoreOptions(noms) === true) {
            return spriteIcons["sausage_plus"]
        }
        return spriteIcons["sausage"]
    } else if (noms.cake === true) {
        if (noms.run_out === true) {
            return spriteIcons["cake_run_out"]
        } else if (hasMoreOptions(noms) === true) {
            return spriteIcons["cake_plus"]
        }
        return spriteIcons["cake"]
    }

    return null
}

export const olStyleFunction = function(feature: IMapPollingPlaceFeature, resolution: number, mapFilterOptions: IMapFilterOptions) {
    const noms: IMapPollingGeoJSONNoms = feature.get("noms")

    if (noms !== null) {
        if (hasFilterOptions(mapFilterOptions) === true && satisfiesMapFilter(noms, mapFilterOptions) === false) {
            return null
        }

        return getIconForNoms(noms)
    }

    return hasFilterOptions(mapFilterOptions) === false ? spriteIcons["unknown"] : null
}
