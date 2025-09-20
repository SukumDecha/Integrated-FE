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
    
  const { isPaginated } = options;

  const ResponseBuilder = isPaginated ? PaginationResponse : BaseResponse;

  const httpOptions = {
    method,
    headers: { ...httpHeaders },
    ...options
  }

  const token = localStorage.getItem('token')
  if (token) {
    httpOptions.headers['Authorization'] = `Bearer ${token}`
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
          errorMessage = body.message || body.errorMessage || errorMessage
        }
      } catch (error) {
        console.error('Error parsing response body:', error)
      }

      return new ResponseBuilder()
        .error(errorMessage)
        .status(res.status)
        .build();
    }

    if (res.status === 204 || method === 'DELETE') {
      return new ResponseBuilder()
        .message(BaseResponseMessage.Success)
        .status(res.status)
        .build();
    }

    const item = await res.json()
    const response = new ResponseBuilder()
      .data(isPaginated ? item.content : item)
      .message(item.message || BaseResponseMessage.Success)
      .status(res.status);

    // If it's a paginated response, add pagination details
    if (response instanceof PaginationResponse) {
      response
        .page(item.page)
        .perPage(item.size)
        .totalPages(item.totalPages)
        .totalItems(item.totalElements);

      const [sortBy, sortOrder] = item.sort ? item.sort.split(': ') : [];
      if (sortBy && sortOrder) {
        response.sortBy(sortBy).sortOrder(sortOrder);
      }
    }

    return response.build();
  } catch (err) {
    const errorMessage = getErrorMessage(err)
     return new ResponseBuilder()
      .error(errorMessage)
      .status(0)
      .build();
  }
}

const get = async (url, options) => request(url, 'GET', null, options)
const post = async (url, payload, options) => request(url, 'POST', payload, options)
const patch = async (url, payload, options) => request(url, 'PATCH', payload, options)
const put = async (url, payload, options) => request(url, 'PUT', payload, options)
const remove = async (url) => request(url, 'DELETE')

export { get, post, patch, put, remove }
