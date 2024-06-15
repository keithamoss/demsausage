// export interface IConfig {
//   GOOGLE_ANALYTICS_UA: string
//   GOOGLE_MAPS_API_KEY: string
//   MAPBOX_API_KEY: string
//   RAVEN_URL: string
// }

/* Material UI muiThemeable palette object */
export interface IMUIThemePalette extends __MaterialUI.Styles.ThemePalette {}

export interface IMUITheme {
  palette: IMUIThemePalette
}

export interface IMUIThemeProps {
  muiTheme: IMUITheme
}

export interface IGeoJSON {
  type: string
  coordinates: [number, number]
}
