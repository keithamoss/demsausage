export interface IEnvVars {
    NODE_ENV: string // development, test, production
    REACT_APP_SITE_BASE_URL: string
    REACT_APP_API_BASE_URL: string
    REACT_APP_GOOGLE_MAPS_API_KEY: string
    REACT_APP_GOOGLE_ANALYTICS_UA: string
    REACT_APP_MAPBOX_API_KEY_DEV: string
    REACT_APP_MAPBOX_API_KEY_PROD: string
    REACT_APP_RAVEN_URL: string
}

export interface IConfig {
    GOOGLE_ANALYTICS_UA: string
    GOOGLE_MAPS_API_KEY: string
    MAPBOX_API_KEY: string
    RAVEN_URL: string
}

/* Material UI muiThemeable palette object */
export interface IMUIThemePalette extends __MaterialUI.Styles.ThemePalette {}

export interface IMUITheme {
    palette: IMUIThemePalette
}

export interface IMUIThemeProps {
    muiTheme: IMUITheme
}

export interface IGeoJSONFeatureCollection {
    type: string
    features: IGeoJSON[]
}

export interface IGeoJSONFeature {
    id: number
    type: string
    geometry: IGeoJSON
    properties: any
}

export interface IGeoJSON {
    type: string
    coordinates: [number, number]
}
