import { getErrorMessage } from '@/utils/ErrorUtils'
import { BaseResponse, BaseResponseMessage } from '../models/api.response'
import { PaginationResponse } from '../models/paginated.response'
import { useAuthStore } from '@/stores/auth.store'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const SESSION_EXPIRED_MSG = 'Session expired'

/**
 * ส่ง request ไปยัง API โดยมีการ handle 401 (access token หมดอายุ)
 * → refresh → retry 1 ครั้ง
 * → ถ้า refresh token หมด → logout
 */
const request = async (url, method, payload = null, options = { isPaginated: false }) => {
  const authStore = useAuthStore()
  const { isPaginated } = options

  const headers = {
    'Content-Type': 'application/json',
    ...(authStore.token && { Authorization: `Bearer ${authStore.token}` }),
  }

  const httpOptions = {
    method,
    headers,
    credentials: 'include',
  }

  // handle payload
  if (payload instanceof FormData) {
    delete httpOptions.headers['Content-Type']
    httpOptions.body = payload
  } else if (payload) {
    httpOptions.body = JSON.stringify(payload)
  }

  const ResponseBuilder = isPaginated ? PaginationResponse : BaseResponse

  try {
    const res = await fetch(`${API_BASE_URL}${url}`, httpOptions)

    // ────────────────────────────────
    // 401 → Access token หมดอายุ → refresh
    // ────────────────────────────────
    if (res.status === 401) {
      console.warn('[401] Access token may have expired → trying refresh…')
      const refreshResult = await authStore.refreshAccessToken()

      if (refreshResult?.success) {
        console.info('[401] Refresh successful → retrying original request…')
        return await request(url, method, payload, { ...options })
      }

      // Refresh token หมดอายุ → logout
      let errorMessage = SESSION_EXPIRED_MSG
      try {
        const body = await res.json()
        errorMessage = body?.errorMessage || body?.message || errorMessage
      } catch {
        // ignore parse error
      }

      console.warn('[401] Refresh failed → logout')
      await authStore.logout()
      return new ResponseBuilder().error(errorMessage).build()
    }

    // ────────────────────────────────
    // Non-200 response
    // ────────────────────────────────
    if (!res.ok) {
      let errorMessage = `HTTP error! Status: ${res.status}`
      try {
        const body = await res.json()
        errorMessage = body?.message || body?.errorMessage || errorMessage
      } catch {
        // ignore parse error
      }

      return new ResponseBuilder().error(errorMessage).build()
    }

    // ────────────────────────────────
    // No Content
    // ────────────────────────────────
    if (res.status === 204) {
      return new ResponseBuilder().message(BaseResponseMessage.Success).build()
    }

    // ────────────────────────────────
    // Success Response
    // ────────────────────────────────
    const item = await res.json()
    const response = new ResponseBuilder()
      .data(isPaginated ? item.content : item)
      .message(item.message || BaseResponseMessage.Success)

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
    // Network error (เช่น offline, server ตาย)
    const errorMessage = getErrorMessage(err)
    console.error('[Request Error]', errorMessage)
    return new ResponseBuilder().error(errorMessage).status(0).build()
  }
}

// ────────────────────────────────
// Method shortcuts
// ────────────────────────────────
const get = (url, options) => request(url, 'GET', null, options)
const post = (url, payload, options) => request(url, 'POST', payload, options)
const patch = (url, payload, options) => request(url, 'PATCH', payload, options)
const put = (url, payload, options) => request(url, 'PUT', payload, options)
const remove = (url) => request(url, 'DELETE')

export { get, post, patch, put, remove }
