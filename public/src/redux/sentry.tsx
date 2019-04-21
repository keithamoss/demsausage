// https://github.com/captbaritone/raven-for-redux/issues/93#issuecomment-435854873

import * as Sentry from "@sentry/browser"
import { Event } from "@sentry/types"
import { Action, Dispatch, MiddlewareAPI } from "redux"
import { IStore } from "./modules/reducer"

const sentry = (store: MiddlewareAPI<IStore>) => {
    Sentry.addGlobalEventProcessor((event: Event) => {
        return {
            ...event,
            extra: {
                ...event.extra,
                "redux:state": store.getState(),
            },
        }
    })

    return (next: Dispatch<IStore>) => (action: Action) => {
        Sentry.addBreadcrumb({
            category: "redux-action",
            message: action.type,
        })

        return next(action)
    }
}

export default sentry
