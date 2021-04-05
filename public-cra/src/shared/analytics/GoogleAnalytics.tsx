import * as ReactGA from "react-ga"
import { IStore } from "../../redux/modules/reducer"

if ("REACT_APP_GOOGLE_ANALYTICS_UA" in process.env) {
    ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_UA!)
}

class GATracker {
    verbose: boolean
    alwaysSend: boolean

    constructor(verbose: boolean = false, alwaysSend: boolean = false) {
        this.verbose = verbose
        this.alwaysSend = alwaysSend
    }

    pageview(path: string) {
        if (process.env.NODE_ENV !== "development" || this.alwaysSend === true) {
            ReactGA.set({ page: path })
            ReactGA.pageview(path)
        }

        if (this.verbose === true) {
            console.log("GATracker:pageview", path)
        }
    }

    // event(cfg: ReactGA.EventArgs) {
    event(cfg: any) {
        if (process.env.NODE_ENV !== "development" || this.alwaysSend === true) {
            ReactGA.event(cfg)
        }

        if (this.verbose === true) {
            console.log("GATracker:event", cfg)
        }
    }
}

const gaTrack = new GATracker()

const AnalyticsMiddleware = (store: IStore) => (next: Function) => (action: any) => {
    if ("meta" in action && "analytics" in action.meta) {
        gaTrack.event({ ...action.meta.analytics, type: action.type })
    }

    let result = next(action)
    return result
}

const fireAnalyticsTracking = () => {
    gaTrack.pageview(window.location.pathname + window.location.search)
}

export interface IAnalyticsMeta {
    category: string
    type?: string
    payload?: {
        [key: string]: any
    }
}

export { AnalyticsMiddleware, fireAnalyticsTracking, gaTrack }
