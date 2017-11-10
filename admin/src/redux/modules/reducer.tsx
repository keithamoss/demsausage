import * as Redux from "redux"
import { reducer as form } from "redux-form"
import { routerReducer } from "react-router-redux"

import { default as app, IModule as IAppModule } from "./app"

const formReducer: any = form // Silencing TypeScript errors due to older @types/redux-form package

export interface IStore {
    app: IAppModule
}

const rootReducer: Redux.Reducer<IStore> = Redux.combineReducers<IStore>({
    app,
    routing: routerReducer,
    form: formReducer.plugin({}),
})

export default rootReducer
