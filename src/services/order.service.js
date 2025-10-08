import { get, post } from './helper/api'
import { buildSearchParams } from '@/utils'

const BASE_URL_V2 = '/v2/users'
const BASE_URL_V3 = '/v2/orders'

const OrderService = {
  async getOrderByUserId(id, paginationParams = {}) {
    const queryString = buildSearchParams(paginationParams)
    const url = `${BASE_URL_V2}/${id}/orders?${queryString}`

    return await get(url, {
      isPaginated: true,
    })
  },

  async placeOrder(payload) {
    return await post(`${BASE_URL_V3}`, payload)
  },

  async getOrderById(id) {
    return await get(`${BASE_URL_V3}/${id}`)
  },
}

export default OrderService
