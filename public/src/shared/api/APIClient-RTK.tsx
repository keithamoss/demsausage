import { isRejectedWithValue, Middleware, MiddlewareAPI } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import * as Sentry from '@sentry/browser'
import { getAPIBaseURL, isDevelopment } from '../../redux/modules/app'
import { IPollingPlace } from '../../redux/modules/polling_places'

export const sausageApi = createApi({
  reducerPath: 'sausageApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${getAPIBaseURL()}/0.1/` }),
  endpoints: (builder) => ({
    getNearbyPollingPlaces: builder.query<IPollingPlace[], { election_id: number; lonlat: string }>({
      query: (arg) => {
        const { election_id, lonlat } = arg
        return {
          url: `polling_places/nearby/`,
          params: { election_id, lonlat },
        }
      },
    }),
  }),
})

// Global API error handling
export const rtkQueryErrorLogger: Middleware = (_api: MiddlewareAPI) => (next) => (action) => {
  // c.f. https://github.com/reduxjs/redux-toolkit/issues/331
  if (isRejectedWithValue(action)) {
    if (action.payload.originalStatus === 400 || action.payload.originalStatus === 404) {
      // APIClient used to handle these differently, but we didn't document why...
      console.error('@TODO Implement 400 and 404 handling')
      // ...so we'll continue and let it be logged by Sentry so we can find out
    }

    if (isDevelopment() === true) {
      console.error(
        `${action.error.message} [${action.payload.originalStatus}: ${action.payload.status}] for ${action.type}`,
        action
      )
    } else {
      Sentry.captureException(
        `${action.error.message} [${action.payload.originalStatus}: ${action.payload.status}] for ${action.type}`
      )
      Sentry.captureException(action)
      Sentry.showReportDialog()
    }
  }

  return next(action)
}

// Export hooks for usage in functional components.
// They're auto-generated based on the defined endpoints.
export const { useGetNearbyPollingPlacesQuery } = sausageApi
