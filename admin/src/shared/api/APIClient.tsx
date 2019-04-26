import * as Cookies from "js-cookie"
import * as qs from "qs"
import * as Raven from "raven-js"
import "whatwg-fetch"
import { beginFetch, finishFetch, getAPIBaseURL, isDevelopment } from "../../redux/modules/app"
import { sendNotification } from "../../redux/modules/snackbars"

export class APIClient {
    private baseURL: string

    constructor() {
        this.baseURL = getAPIBaseURL()
    }

    public handleResponse(url: string, response: any, dispatch: any) {
        if (response.status >= 401) {
            return response.json().then((json: any) => {
                this.handleError(json, url, dispatch)
                return {
                    response: response,
                    json: json,
                }
            })
        }

        return response.json().then((json: any) => {
            if (response.status === 400) {
                dispatch(sendNotification("Sorry about this, but there's been an error handling your request."))
            }

            return {
                response: response,
                json: json,
            }
        })
    }

    public async get(
        url: string,
        dispatch: Function,
        params: object = {},
        quiet: boolean = false,
        fetchOptions: object = {}
    ): Promise<IAPIResponse> {
        if (dispatch !== null && quiet === false) {
            dispatch(beginFetch())
        }

        if (Object.keys(params).length > 0) {
            // Yay, a library just to do query string operations for fetch()
            // https://github.com/github/fetch/issues/256
            url += "?" + qs.stringify(params)
        }

        const promise = await fetch(this.baseURL + url, { ...{ credentials: "include" }, ...fetchOptions })
            .then((response: any) => {
                if (dispatch !== null && quiet === false) {
                    dispatch(finishFetch())
                }

                return this.handleResponse(url, response, dispatch)
            })
            .catch((error: any) => this.handleError(error, url, dispatch))

        if (promise !== undefined) {
            return promise
        }

        this.handleError({ error: "Fetch promise is undefined", url }, url, dispatch)

        return new Promise(resolve => {
            return resolve({ response: new Response(null, { status: 499, statusText: "Client Closed Request" }), json: null })
        })
    }

    public post(url: string, body: object = {}, dispatch: any): Promise<IAPIResponse> {
        dispatch(beginFetch())

        return fetch(this.baseURL + url, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": Cookies.get("csrftoken")!,
            },
            body: JSON.stringify(body),
        })
            .then((response: any) => {
                dispatch(finishFetch())
                return this.handleResponse(url, response, dispatch)
            })
            .catch((error: any) => this.handleError(error, url, dispatch))
    }

    public put(url: string, body: any, headers: object = {}, dispatch: any): Promise<IAPIResponse> {
        dispatch(beginFetch())

        return fetch(this.baseURL + url, {
            method: "PUT",
            mode: "cors",
            credentials: "include",
            headers: { "X-CSRFToken": Cookies.get("csrftoken")!, ...headers },
            body: body,
        })
            .then((response: any) => {
                dispatch(finishFetch())
                return this.handleResponse(url, response, dispatch)
            })
            .catch((error: any) => this.handleError(error, url, dispatch))
    }

    public patch(url: string, body: object = {}, dispatch: any): Promise<IAPIResponse> {
        dispatch(beginFetch())

        return fetch(this.baseURL + url, {
            method: "PATCH",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": Cookies.get("csrftoken")!,
            },
            body: JSON.stringify(body),
        })
            .then((response: any) => {
                dispatch(finishFetch())
                return this.handleResponse(url, response, dispatch)
            })
            .catch((error: any) => this.handleError(error, url, dispatch))
    }

    public delete(url: string, dispatch: any, params: object = {}): Promise<IAPIResponse> {
        dispatch(beginFetch())

        if (Object.keys(params).length > 0) {
            // Yay, a library just to do query string operations for fetch()
            // https://github.com/github/fetch/issues/256
            url += "?" + qs.stringify(params)
        }

        return fetch(this.baseURL + url, {
            method: "DELETE",
            mode: "cors",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": Cookies.get("csrftoken")!,
            },
        })
            .then((response: any) => {
                dispatch(finishFetch())
                return response
            })
            .catch((error: any) => this.handleError(error, url, dispatch))
    }

    // Handles fatal errors from the API
    private handleError(error: any, url: string, dispatch: any) {
        if (isDevelopment() === true) {
            // tslint:disable-next-line:no-console
            console.error(error)
        }

        Raven.captureException(error)
        Raven.showReportDialog()
    }
}

// Models
export interface IAPIClient {
    get: Function
    post: Function
    put: Function
    patch: Function
    delete: Function
}

export interface IAPIResponse {
    response: Response
    json: any
}

export interface IHTTPResponse {
    status: number
}
