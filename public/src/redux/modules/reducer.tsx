import * as Redux from "redux"
import { reducer as form } from "redux-form"
import { routerReducer } from "react-router-redux"

import { default as app, IModule as IAppModule } from "./app"
import { default as snackbars, IModule as ISnackbarsModule } from "./snackbars"
import { default as elections, IModule as IElectionsModule } from "./elections"
import { default as polling_places, IModule as IPollingPlacesModule, reduxFormReducer as pollingPlaceFormReducer } from "./polling_places"
import { default as stalls, IModule as IStallsModule } from "./stalls"

const formReducer: any = form // Silencing TypeScript errors due to older @types/redux-form package

export interface IStore {
    app: IAppModule
    snackbars: ISnackbarsModule
    elections: IElectionsModule
    polling_places: IPollingPlacesModule
    stalls: IStallsModule
}

const rootReducer: Redux.Reducer<IStore> = Redux.combineReducers<IStore>({
    app,
    snackbars,
    elections,
    polling_places,
    stalls,
    routing: routerReducer,
    form: formReducer.plugin({ pollingPlace: pollingPlaceFormReducer }),
})

export default rootReducer
