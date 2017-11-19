export { IStore } from "./reducer"
export { IEALGISApiClient, IHttpResponse, ICartoAPIResponse } from "../../shared/api/EALGISApiClient"
export { IModule as IAppModule, eAppEnv } from "./app"
export { IModule as IUserModule, ISelf, IUser } from "./user"
export { IModule as ISnackbarsModule } from "./snackbars"
export { IModule as IElectionsModule, IElections, IElection } from "./elections"
export { IModule as IPollingPlacesModule, IPollingPlace } from "./polling_places"

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
