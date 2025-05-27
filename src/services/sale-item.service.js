import { buildSearchParams } from '@/utils/SearchParamsUtils'
import { get, post, put, remove } from './helper/api'

const BASE_URL_V1 = '/v1/sale-items'
const BASE_URL_V2 = '/v2/sale-items'

const SaleItemService = {
  async getAllSaleItems() {
    return await get(`${BASE_URL_V1}`)
  },

  async getSaleItemById(id) {
    return await get(`${BASE_URL_V1}/${id}`)
  },

  async addSaleItem(data) {
    return await post(`${BASE_URL_V1}`, data)
  },

  async updateSaleItem(id, data) {
    return await put(`${BASE_URL_V1}/${id}`, data)
  },

  async deleteSaleItem(id) {
    return await remove(`${BASE_URL_V1}/${id}`)
  },

  async getSaleItemList() {
    return await get(`${BASE_URL_V1}/list`)
  },

  async getSaleItemListPaginated({
    page = 1,
    size = 10,
    sortField = undefined,
    sortDirection = undefined,
    filterBrands = [],
  }) {
    const normalizedFilterBrands = Array.isArray(filterBrands)
      ? filterBrands
      : typeof filterBrands === 'string'
        ? [filterBrands]
        : []

    const searchParams = buildSearchParams({
      page,
      size,
      sortField,
      sortDirection,
      filterBrands:
        normalizedFilterBrands.length > 0 ? normalizedFilterBrands.join(',') : undefined,
    })

    const url = `${BASE_URL_V2}?${searchParams}`
    return await get(url, {
      isPaginated: true,
    })
  },
}

export default SaleItemService
