import * as dotProp from "dot-prop-immutable"
import { IAnalyticsMeta } from "../../shared/analytics/GoogleAnalytics"
import { IAPIClient } from "../../shared/api/APIClient"
import { fetchElections } from "./elections"

// Actions
const LOADING = "ealgis/app/LOADING"
const LOADED = "ealgis/app/LOADED"
const BEGIN_FETCH = "ealgis/app/BEGIN_FETCH"
const FINISH_FETCH = "ealgis/app/FINISH_FETCH"
const SET_LAST_PAGE = "ealgis/app/SET_LAST_PAGE"
const TOGGLE_SIDEBAR = "ealgis/app/TOGGLE_SIDEBAR"
const TOGGLE_MODAL = "ealgis/app/TOGGLE_MODAL"
const SET_POLLING_PLACE_FINDER_MODE = "ealgis/app/SET_POLLING_PLACE_FINDER_MODE"

export enum eAppEnv {
    DEV = 1,
    TEST = 2,
    PROD = 3,
}

export enum ePollingPlaceFinderInit {
    DO_NOTHING = 1,
    FOCUS_INPUT = 2,
    GEOLOCATION = 3,
}

const initialState: IModule = {
    loading: true,
    requestsInProgress: 0,
    sidebarOpen: false,
    previousPath: "",
    modals: new Map(),
    geolocationSupported: typeof navigator !== "undefined" && "geolocation" in navigator,
    pollingPlaceFinderMode: ePollingPlaceFinderInit.DO_NOTHING,
}

// Reducer
export default function reducer(state: IModule = initialState, action: IAction) {
    let requestsInProgress = dotProp.get(state, "requestsInProgress")

    switch (action.type) {
        case LOADING:
            return dotProp.set(state, "loading", true)
        case LOADED:
            return dotProp.set(state, "loading", false)
        case BEGIN_FETCH:
            return dotProp.set(state, "requestsInProgress", ++requestsInProgress)
        case FINISH_FETCH:
            return dotProp.set(state, "requestsInProgress", --requestsInProgress)
        case SET_LAST_PAGE:
            return dotProp.set(state, "previousPath", action.previousPath)
        case TOGGLE_SIDEBAR:
            return dotProp.toggle(state, "sidebarOpen")
        case TOGGLE_MODAL:
            const modals = dotProp.get(state, "modals")
            modals.set(action.modalId, !modals.get(action.modalId))
            return dotProp.set(state, "modals", modals)
        case SET_POLLING_PLACE_FINDER_MODE:
            return dotProp.set(state, "pollingPlaceFinderMode", action.pollingPlaceFinderMode)
        default:
            return state
    }
}

// Action Creators
export function loading(): IAction {
    return {
        type: LOADING,
    }
}

export function loaded(): IAction {
    return {
        type: LOADED,
    }
}

export function beginFetch(): IAction {
    return {
        type: BEGIN_FETCH,
    }
}

export function finishFetch(): IAction {
    return {
        type: FINISH_FETCH,
    }
}

export function setLastPage(previousPath: string): IAction {
    return {
        type: SET_LAST_PAGE,
        previousPath,
    }
}

export function toggleSidebarState(): IAction {
    return {
        type: TOGGLE_SIDEBAR,
        meta: {
            analytics: {
                category: "App",
            },
        },
    }
}

export function toggleModalState(modalId: string): IAction {
    return {
        type: TOGGLE_MODAL,
        modalId,
    }
}

export function setPollingPlaceFinderMode(mode: ePollingPlaceFinderInit): IAction {
    return {
        type: SET_POLLING_PLACE_FINDER_MODE,
        pollingPlaceFinderMode: mode,
    }
}

// Models
export interface IModule {
    loading: boolean
    requestsInProgress: number
    sidebarOpen: boolean
    previousPath: string
    modals: Map<string, boolean>
    geolocationSupported: boolean
    pollingPlaceFinderMode: ePollingPlaceFinderInit
}

export interface IAction {
    type: string
    previousPath?: string
    modalId?: string
    open?: boolean
    pollingPlaceFinderMode?: ePollingPlaceFinderInit
    meta?: {
        analytics: IAnalyticsMeta
    }
}

// Side effects, only as applicable
// e.g. thunks, epics, et cetera
export function getEnvironment(): eAppEnv {
    return process.env.NODE_ENV === "development" ? eAppEnv.DEV : eAppEnv.PROD
}

export function isDevelopment(): boolean {
    return getEnvironment() !== eAppEnv.PROD
}

export function getAPIBaseURL(): string {
    return process.env.REACT_APP_API_BASE_URL!
}

export function getBaseURL(): string {
    return process.env.REACT_APP_SITE_BASE_URL!
}

export function getMapboxAPIKey(): any {
    return getEnvironment() === eAppEnv.DEV ? process.env.REACT_APP_MAPBOX_API_KEY_DEV : process.env.REACT_APP_MAPBOX_API_KEY_PROD
}

export function fetchInitialAppState(initialElectionName: string) {
    return async (dispatch: Function, getState: Function, api: IAPIClient) => {
        dispatch(loading())
        await Promise.all([dispatch(fetchElections(initialElectionName))])
        dispatch(loaded())
    }
}

export function isUserABot() {
    // https://stackoverflow.com/a/33941034
    // Hacky, but good enough for our purposes (showing a different basemap)

    var botPattern =
        // tslint:disable-next-line:max-line-length
        "(googlebot/|Googlebot-Mobile|Googlebot-Image|Google favicon|Mediapartners-Google|bingbot|slurp|java|wget|curl|Commons-HttpClient|Python-urllib|libwww|httpunit|nutch|phpcrawl|msnbot|jyxobot|FAST-WebCrawler|FAST Enterprise Crawler|biglotron|teoma|convera|seekbot|gigablast|exabot|ngbot|ia_archiver|GingerCrawler|webmon |httrack|webcrawler|grub.org|UsineNouvelleCrawler|antibot|netresearchserver|speedy|fluffy|bibnum.bnf|findlink|msrbot|panscient|yacybot|AISearchBot|IOI|ips-agent|tagoobot|MJ12bot|dotbot|woriobot|yanga|buzzbot|mlbot|yandexbot|purebot|Linguee Bot|Voyager|CyberPatrol|voilabot|baiduspider|citeseerxbot|spbot|twengabot|postrank|turnitinbot|scribdbot|page2rss|sitebot|linkdex|Adidxbot|blekkobot|ezooms|dotbot|Mail.RU_Bot|discobot|heritrix|findthatfile|europarchive.org|NerdByNature.Bot|sistrix crawler|ahrefsbot|Aboundex|domaincrawler|wbsearchbot|summify|ccbot|edisterbot|seznambot|ec2linkfinder|gslfbot|aihitbot|intelium_bot|facebookexternalhit|yeti|RetrevoPageAnalyzer|lb-spider|sogou|lssbot|careerbot|wotbox|wocbot|ichiro|DuckDuckBot|lssrocketcrawler|drupact|webcompanycrawler|acoonbot|openindexspider|gnam gnam spider|web-archive-net.com.bot|backlinkcrawler|coccoc|integromedb|content crawler spider|toplistbot|seokicks-robot|it2media-domain-crawler|ip-web-crawler.com|siteexplorer.info|elisabot|proximic|changedetection|blexbot|arabot|WeSEE:Search|niki-bot|CrystalSemanticsBot|rogerbot|360Spider|psbot|InterfaxScanBot|Lipperhey SEO Service|CC Metadata Scaper|g00g1e.net|GrapeshotCrawler|urlappendbot|brainobot|fr-crawler|binlar|SimpleCrawler|Livelapbot|Twitterbot|cXensebot|smtbot|bnf.fr_bot|A6-Indexer|ADmantX|Facebot|Twitterbot|OrangeBot|memorybot|AdvBot|MegaIndex|SemanticScholarBot|ltx71|nerdybot|xovibot|BUbiNG|Qwantify|archive.org_bot|Applebot|TweetmemeBot|crawler4j|findxbot|SemrushBot|yoozBot|lipperhey|y!j-asr|Domain Re-Animator Bot|AddThis)"
    var re = new RegExp(botPattern, "i")
    return re.test(navigator.userAgent)
}
