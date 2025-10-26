import { get, post, put, remove } from './helper/api'

const BASE_URL_V1 = '/v1/brands'

const BrandService = {
  // V1 API Endpoints
  async getAllBrands() {
    return await get(BASE_URL_V1)
  },

  async getBrandById(id) {
    return await get(`${BASE_URL_V1}/${id}`)
  },

  async createBrand(data) {
    return await post(BASE_URL_V1, data)
  },

  async updateBrand(id, data) {
    return await put(`${BASE_URL_V1}/${id}`, data)
  },

  async deleteBrand(id) {
    return await remove(`${BASE_URL_V1}/${id}`)
  },

  async getBrandList() {
    return await remove(`${BASE_URL_V1}/list`)
  },
}

export default BrandService
