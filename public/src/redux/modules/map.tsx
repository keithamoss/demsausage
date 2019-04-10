import * as dotProp from "dot-prop-immutable"
import * as ol from "openlayers"
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
const spriteIconConfig = [
    { name: "cake-plus", position: [1, 0], width: 80, height: 73, zIndex: 2, scale: 0.5 },
    { name: "cake-run-out", position: [1, 74], width: 80, height: 73, zIndex: 1, scale: 0.5 },
    { name: "sausage-and-cake", position: [1, 148], width: 80, height: 70, zIndex: 1, scale: 0.5 },
    { name: "sausage-and-cake-plus", position: [1, 219], width: 80, height: 70, zIndex: 2, scale: 0.5 },
    { name: "sausage-and-cake-run-out", position: [1, 290], width: 80, height: 70, zIndex: 1, scale: 0.5 },
    { name: "red-cross-of-shame", position: [1, 361], width: 64, height: 63, zIndex: 1, scale: 0.4 },
    { name: "sausage", position: [1, 425], width: 64, height: 59, zIndex: 1, scale: 0.5 },
    { name: "sausage-plus", position: [1, 485], width: 64, height: 59, zIndex: 2, scale: 0.5 },
    { name: "sausage-run-out", position: [1, 545], width: 64, height: 59, zIndex: 1, scale: 0.5 },
    { name: "cake", position: [1, 605], width: 55, height: 64, zIndex: 1, scale: 0.5 },
    { name: "unknown", position: [1, 670], width: 32, height: 32, zIndex: 0, scale: 0.4, opacity: 0.35 },
]

let spriteIcons = {}
spriteIconConfig.forEach((config: any) => {
    spriteIcons[config.name] = new ol.style.Style({
        image: new ol.style.Icon({
            src: "./icons/sprite_v3.png",
            offset: config.position,
            size: [config.width, config.height],
            scale: config.scale,
            opacity: "opacity" in config ? config.opacity : undefined,
        }),
        zIndex: config.zIndex,
    })
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
            return spriteIcons["sausage-and-cake-run-out"]
        } else if (hasMoreOptions(noms) === true) {
            return spriteIcons["sausage-and-cake-plus"]
        }
        return spriteIcons["sausage-and-cake"]
    } else if (noms.bbq === true) {
        if (noms.run_out === true) {
            return spriteIcons["sausage-run-out"]
        } else if (hasMoreOptions(noms) === true) {
            return spriteIcons["sausage-plus"]
        }
        return spriteIcons["sausage"]
    } else if (noms.cake === true) {
        if (noms.run_out === true) {
            return spriteIcons["cake-run-out"]
        } else if (hasMoreOptions(noms) === true) {
            return spriteIcons["cake-plus"]
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
