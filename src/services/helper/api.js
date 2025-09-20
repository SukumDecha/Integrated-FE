import { getErrorMessage } from '@/utils/ErrorUtils'
import { BaseResponse, BaseResponseMessage } from '../models/api.response'
import { PaginationResponse } from '../models/paginated.response'
import { useAuthStore } from '@/stores/userAuth.store'

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`


const request = async (
  url,
  method,
  payload,
  options = {
    isPaginated: false,
  },
) => {
  const { isPaginated = false } = options

  const authStore = useAuthStore()
  const token = authStore.token

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  const httpOptions = {
    method,
    headers,
    credentials: 'include', 
    ...options,
  }

  if (payload instanceof FormData) {
    delete httpOptions.headers['Content-Type']
    httpOptions.body = payload
  } else if (payload && httpOptions.headers['Content-Type'] === 'application/json') {
    httpOptions.body = JSON.stringify(payload)
  }

  try {
    const res = await fetch(`${API_BASE_URL}${url}`, httpOptions)

    if (!res.ok) {
      let errorMessage = `HTTP error! Status: ${res.status}`
      try {
        const body = await res.json()
        if (body?.message || body?.errorMessage) {
          errorMessage = body.message || body.errorMessage
        }
      } catch (error) {
        console.error('Error parsing response body:', error)
      }

      if (isPaginated) {
        return new PaginationResponse().error(errorMessage).build()
      } else {
        return new BaseResponse().error(errorMessage).build()
      }
    }

    if (method === 'DELETE') {
      if (isPaginated) {
        return new PaginationResponse().message(BaseResponseMessage.Success).build()
      } else {
        return new BaseResponse().message(BaseResponseMessage.Success).build()
      }
    }

    const item = await res.json()

    if (isPaginated) {
      const paginatedResponse = new PaginationResponse()
        .data(item.content)
        .message(BaseResponseMessage.Success)

      paginatedResponse.page(item.page)
      paginatedResponse.perPage(item.size)
      paginatedResponse.totalPages(item.totalPages)
      paginatedResponse.totalItems(item.totalElements)

      const splitedSort = item.sort ? item.sort.split(': ') : []
      if (splitedSort.length === 2) {
        paginatedResponse.sortBy(splitedSort[0])
        paginatedResponse.sortOrder(splitedSort[1])
      }

      return paginatedResponse.build()
    } else {
      return new BaseResponse()
        .data(item)
        .message(item.message || BaseResponseMessage.Success)
        .build()
    }
  } catch (err) {
    const errorMessage = getErrorMessage(err)

    if (isPaginated) {
      return new PaginationResponse().error(errorMessage).build()
    } else {
      return new BaseResponse().error(errorMessage).build()
    }
  }
}

const get = async (url, options) => request(url, 'GET', null, options)
const post = async (url, payload, options) => request(url, 'POST', payload, options)
const patch = async (url, payload, options) => request(url, 'PATCH', payload, options)
const put = async (url, payload, options) => request(url, 'PUT', payload, options)
const remove = async (url) => request(url, 'DELETE')

export { get, post, patch, put, remove }
