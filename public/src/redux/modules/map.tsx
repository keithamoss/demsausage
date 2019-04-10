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

const spriteCake = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 0],
        size: [32, 32],
        src: "./icons/sprite_v2.png",
    }),
    zIndex: 1,
})
const spriteBBQCakeRunOut = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 32],
        size: [32, 29],
        src: "./icons/sprite_v2.png",
    }),
    zIndex: 1,
})
const spriteBBQCake = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 61],
        size: [32, 29],
        src: "./icons/sprite_v2.png",
    }),
    zIndex: 1,
})
const spriteBBQ = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 90],
        size: [32, 32],
        src: "./icons/sprite_v2.png",
    }),
    zIndex: 1,
})
const spriteNowt = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 122],
        size: [24, 24],
        src: "./icons/sprite_v2.png",
    }),
    zIndex: 1,
})
const spriteUnknown = new ol.style.Style({
    image: new ol.style.Icon({
        offset: [0, 146],
        size: [14, 14],
        src: "./icons/sprite_v2.png",
        opacity: 0.4,
    }),
    zIndex: 0,
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

export const olStyleFunction = function(feature: IMapPollingPlaceFeature, resolution: number, mapFilterOptions: IMapFilterOptions) {
    const noms: IMapPollingGeoJSONNoms = feature.get("noms")

    if (noms !== null) {
        if (hasFilterOptions(mapFilterOptions) === true && satisfiesMapFilter(noms, mapFilterOptions) === false) {
            return null
        }

        if (noms.bbq === true && noms.cake === true) {
            return spriteBBQCake
        } else if ((noms.bbq === true || noms.cake === true) && noms.run_out === true) {
            return spriteBBQCakeRunOut
        } else if (noms.bbq === true) {
            return spriteBBQ
        } else if (noms.cake === true) {
            return spriteCake
        } else if (noms.nothing === true) {
            return spriteNowt
        } else if (noms.bbq === false && noms.cake === false && Object.keys(noms).length > 0) {
            return spriteBBQ
        }
    }

    return hasFilterOptions(mapFilterOptions) === false ? spriteUnknown : null
}
