import "whatwg-fetch"
import * as qs from "qs"
import cookie from "react-cookie"
// import * as Raven from "raven-js"
import { iterate as iterateSnackbar, sendMessage as sendSnackbarMessage } from "../../redux/modules/snackbars"
import { beginFetch, finishFetch, getAPIBaseURL } from "../../redux/modules/app"

export class EALGISApiClient {
    baseURL: string

    constructor() {
        this.baseURL = getAPIBaseURL()
    }

    // Only handles fatal errors from the API
    // FIXME Refactor to be able to handle errors that the calling action can't handle
    public handleError(error: any, url: string, dispatch: any) {
        // Raven.captureException(error)
        // Raven.showReportDialog({})

        dispatch(
            sendSnackbarMessage({
                message: `Error from ${url}`,
                // key: "SomeUID",
                action: "Dismiss",
                autoHideDuration: 4000,
                onActionTouchTap: () => {
                    dispatch(iterateSnackbar())
                },
            })
        )
    }

    public get(url: string, dispatch: Function, params: object = {}): Promise<void> {
        dispatch(beginFetch())

        if (Object.keys(params).length > 0) {
            // Yay, a library just to do query string operations for fetch()
            // https://github.com/github/fetch/issues/256
            url += "?" + qs.stringify(params)
        }

        return fetch(this.baseURL + url, {
            credentials: "include",
        })
            .then((response: any) => {
                dispatch(finishFetch())
                return response.json().then((json: any) => ({
                    response: response,
                    json: json,
                }))
            })
            .catch((error: any) => this.handleError(error, url, dispatch))
    }

    public post(url: string, body: object, dispatch: any) {
        dispatch(beginFetch())

        return fetch(this.baseURL + url, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookie.load("csrftoken"),
            },
            body: JSON.stringify(body),
        })
            .then((response: any) => {
                dispatch(finishFetch())
                return response.json().then((json: any) => ({
                    response: response,
                    json: json,
                }))
            })
            .catch((error: any) => this.handleError(error, url, dispatch))
    }

    public put(url: string, body: object, dispatch: any) {
        dispatch(beginFetch())

        return fetch(this.baseURL + url, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": cookie.load("csrftoken"),
            },
            body: JSON.stringify(body),
        })
            .then((response: any) => {
                dispatch(finishFetch())
                return response.json().then((json: any) => ({
                    response: response,
                    json: json,
                }))
            })
            .catch((error: any) => this.handleError(error, url, dispatch))
    }

    public delete(url: string, dispatch: any) {
        dispatch(beginFetch())

        return fetch(this.baseURL + url, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "X-CSRFToken": cookie.load("csrftoken"),
            },
        })
            .then((response: any) => {
                dispatch(finishFetch())
                return response
            })
            .catch((error: any) => this.handleError(error, url, dispatch))
    }
}

// Models
export interface IEALGISApiClient {
    handleError: Function
    get: Function
    post: Function
    put: Function
    delete: Function
}

export interface IHttpResponse {
    status: number
}
