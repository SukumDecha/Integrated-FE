import { getErrorMessage } from '@/utils/ErrorUtils'
import { BaseResponse, BaseResponseMessage } from '../models/api.response'

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`

const httpHeaders = {
  'Content-Type': 'application/json',
}

const request = async (url, method, payload) => {
  const response = new BaseResponse()

  const httpOptions = {
    method,
    headers: httpHeaders,
  }

  if (payload) {
    httpOptions.body = JSON.stringify(payload)
  }

  try {
    const res = await fetch(`${BASE_URL}${url}`, httpOptions)

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`)
    }

    if (method !== 'DELETE') {
      const item = await res.json()
      response.data(item).message(BaseResponseMessage.Success)
    }
    return response.build()
  } catch (err) {
    console.error(getErrorMessage(err))

    response.error(getErrorMessage(err))
    return response.build()
  }
}

const get = async (url) => {
  return request(url, 'GET')
}

const post = async (url, payload) => {
  return request(url, 'POST', payload)
}

const patch = async (url, payload) => {
  return request(url, 'PATCH', payload)
}

const put = async (url, payload) => {
  return request(url, 'PUT', payload)
}

const remove = async (url) => {
  return request(url, 'DELETE')
}

export { get, post, patch, put, remove }
