import { getErrorMessage } from '@/utils/ErrorUtils'
import { BaseResponse, BaseResponseMessage } from '../models/api.response'
import { PaginationResponse } from '../models/paginated.response'
import { useAuthStore } from '@/stores/auth.store'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

let isRefreshing = false
let refreshPromise = null

const ensureAccessToken = async (authStore) => {
  if (!authStore.token) {
    return { error: 'No token' }
  }

  if (!authStore.isTokenExpired()) {
    return { success: true }
  }

  if (!isRefreshing) {
    isRefreshing = true
    refreshPromise = authStore.refreshAccessToken().finally(() => {
      isRefreshing = false
      refreshPromise = null
    })
  }

  return refreshPromise
}

const request = async (url, method, payload = null, options = { isPaginated: false }) => {
  const { isPaginated } = options
  const authStore = useAuthStore()

  // Check if token needs refresh
  if (authStore.token && authStore.isTokenExpired()) {
    const result = await ensureAccessToken(authStore)

    if (result?.error) {
      authStore.logout()
      const ResponseBuilder = isPaginated ? PaginationResponse : BaseResponse
      return new ResponseBuilder().error('Session expired').build()
    }
  }

  // Get token for request
  const token = authStore.token

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const httpOptions = {
    method,
    headers,
    credentials: 'include',
  }

  if (payload instanceof FormData) {
    delete httpOptions.headers['Content-Type']
    httpOptions.body = payload
  } else if (payload && headers['Content-Type'] === 'application/json') {
    httpOptions.body = JSON.stringify(payload)
  }

  const ResponseBuilder = isPaginated ? PaginationResponse : BaseResponse

  try {
    let res = await fetch(`${API_BASE_URL}${url}`, httpOptions)

    if (!res.ok) {
      let errorMessage = `HTTP error! Status: ${res.status}`
      try {
        const body = await res.json()
        if (body?.message || body?.errorMessage) {
          errorMessage = body.message || body.errorMessage || errorMessage
        }
      } catch (error) {
        console.error('Error parsing response body:', error)
      }

      console.error('❌ Request failed:', errorMessage)
      return new ResponseBuilder().error(errorMessage).build()
    }

    if (res.status === 204 || method === 'DELETE') {
      return new ResponseBuilder().message(BaseResponseMessage.Success).build()
    }

    const item = await res.json()
    const response = new ResponseBuilder()
      .data(isPaginated ? item.content : item)
      .message(item.message || BaseResponseMessage.Success)

    // Pagination info
    if (response instanceof PaginationResponse) {
      response
        .page(item.page)
        .perPage(item.size)
        .totalPages(item.totalPages)
        .totalItems(item.totalElements)

      const [sortBy, sortOrder] = item.sort ? item.sort.split(': ') : []
      if (sortBy && sortOrder) {
        response.sortBy(sortBy).sortOrder(sortOrder)
      }
    }

    return response.build()
  } catch (err) {
    const errorMessage = getErrorMessage(err)
    console.error('Request error:', errorMessage, err)
    return new ResponseBuilder().error(errorMessage).status(0).build()
  }
}

// Method shortcuts
const get = async (url, options) => request(url, 'GET', null, options)
const post = async (url, payload, options) => request(url, 'POST', payload, options)
const patch = async (url, payload, options) => request(url, 'PATCH', payload, options)
const put = async (url, payload, options) => request(url, 'PUT', payload, options)
const remove = async (url) => request(url, 'DELETE')

export { get, post, patch, put, remove }
