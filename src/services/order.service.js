import { get, post } from './helper/api'

const BASE_URL_V2 = '/v2/users'
const BASE_URL_V3 = '/v2/orders'

const OrderService = {

  async getOrderById(id) {
    return await get(`${BASE_URL_V2}/${id}/orders`)
  },
  async placeOrder(payload) {
    return await post(`${BASE_URL_V3}`, payload)
  }
}

export default OrderService
