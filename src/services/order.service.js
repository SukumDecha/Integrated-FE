import { get, post } from './helper/api'
import { buildSearchParams } from '@/utils'

const BASE_USER_URL_V2 = '/v2/users'
const BASE_ORDER_URL_V2 = '/v2/orders'
const BASE_SALE_ORDERS_V2 = '/v2/sellers'

const OrderService = {
  async getOrderByUserId(id, paginationParams = {}) {
    const queryString = buildSearchParams(paginationParams)
    const url = `${BASE_USER_URL_V2}/${id}/orders?${queryString}`

    return await get(url, {
      isPaginated: true,
    })
  },

  async placeOrder(payload) {
    return await post(`${BASE_ORDER_URL_V2}`, payload)
  },

  async getOrderById(id) {
    return await get(`${BASE_ORDER_URL_V2}/${id}`)
  },

  async getOrdersBySellerId(sellerId, paginationParams = {}) {
    const queryString = buildSearchParams(paginationParams)
    const url = `${BASE_SALE_ORDERS_V2}/${sellerId}/orders?${queryString}`
    const res = await get(url, { isPaginated: true })
    return res
  },
}

export default OrderService
