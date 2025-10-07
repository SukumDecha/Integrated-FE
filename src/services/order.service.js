import { get } from './helper/api'

const BASE_URL_V2 = '/v2/users'

const OrderService = {

  async getOrderById(id) {
    return await get(`${BASE_URL_V2}/${id}/orders`)
  },

}

export default OrderService
