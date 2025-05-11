import { get, post, put, remove } from './helper/api'

const BASE_URL = '/v1/brands'

const BrandService = {
  async getAllBrands() {
    return await get(BASE_URL)
  },

  async getBrandById(id) {
    return await get(`${BASE_URL}/${id}`)
  },

  async createBrand(data) {
    return await post(BASE_URL, data)
  },

  async updateBrand(id, data) {
    return await put(`${BASE_URL}/${id}`, data)
  },

  async deleteBrand(id) {
    return await remove(`${BASE_URL}/${id}`)
  }
}

export default BrandService
