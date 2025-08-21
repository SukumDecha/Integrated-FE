import { buildSearchParams } from '@/utils/SearchParamsUtils'
import { get, post, put, remove } from './helper/api'

const BASE_URL_V1 = '/v1/sale-items'
const BASE_URL_V2 = '/v2/sale-items'

const SaleItemService = {
  async getAllSaleItems() {
    return await get(`${BASE_URL_V1}`)
  },

  async getSaleItemById(id) {
    return await get(`${BASE_URL_V2}/${id}`)
  },

  async addSaleItem(data) {
    return await post(`${BASE_URL_V2}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async updateSaleItem(id, data) {
    return await put(`${BASE_URL_V2}/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async deleteSaleItem(id) {
    return await remove(`${BASE_URL_V2}/${id}`)
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
    filterPrices = undefined,
    filterStorages = [],
    priceMin = undefined,
    priceMax = undefined,
  }) {
    //brand
    const normalizedFilterBrands = Array.isArray(filterBrands)
      ? filterBrands
      : typeof filterBrands === 'string'
        ? [filterBrands]
        : []

    //storage
    const normalizedFilterStorages = Array.isArray(filterStorages)
      ? filterStorages
      : typeof filterStorages === 'string'
        ? filterStorages
            .split(',')
            .map((v) => Number(v))
            .filter((n) => !Number.isNaN(n))
        : []

    //price
    let normalizedFilterPrices
    if (Array.isArray(filterPrices)) {
      normalizedFilterPrices = filterPrices.length > 0 ? filterPrices.join(',') : undefined
    } else if (typeof filterPrices === 'string' && filterPrices.trim() !== '') {
      normalizedFilterPrices = filterPrices.trim() // เช่น '5001-10000' หรือ '50000+'
    } else {
      normalizedFilterPrices = undefined
    }

    // --- normalize custom min/max เป็น number หรือ undefined ---
    const toNumOrUndef = (v) => {
      if (v === null || v === undefined || v === '') return undefined
      const n = Number(v)
      return Number.isNaN(n) ? undefined : n
    }
    const normalizedPriceMin = toNumOrUndef(priceMin)
    const normalizedPriceMax = toNumOrUndef(priceMax)

    // ถ้ากรอกเฉพาะ min (ตาม requirement “exact match”) → ส่ง lower=upper=min
    let lower = normalizedPriceMin
    let upper = normalizedPriceMax
    if (normalizedPriceMin !== undefined && normalizedPriceMax === undefined) {
      lower = normalizedPriceMin
      upper = normalizedPriceMin
    }

    // ADD: แปลง '10001-20000' หรือ '50000+' -> [lower, upper]
    const parsePriceRange = (s) => {
      if (!s || typeof s !== 'string') return [undefined, undefined]
      const t = s.trim()
      if (t.endsWith('+')) {
        const num = Number(t.slice(0, -1))
        return [Number.isNaN(num) ? undefined : num, undefined]
      }
      const [a, b] = t.split('-').map((v) => Number(v))
      return [Number.isNaN(a) ? undefined : a, Number.isNaN(b) ? undefined : b]
    }

    // ADD: ถ้ายังไม่มี custom ใด ๆ → ใช้ค่าจาก dropdown
    if (
      lower === undefined &&
      upper === undefined &&
      typeof filterPrices === 'string' &&
      filterPrices.trim() !== ''
    ) {
      const [l, u] = parsePriceRange(filterPrices)
      lower = l
      upper = u
    }

    const searchParams = buildSearchParams({
      page,
      size,
      sortField,
      sortDirection,
      filterBrands:
        normalizedFilterBrands.length > 0 ? normalizedFilterBrands.join(',') : undefined,
      filterStorages:
        normalizedFilterStorages.length > 0 ? normalizedFilterStorages.join(',') : undefined,
      filterPrices: normalizedFilterPrices,
      filterPriceLower: lower,
      filterPriceUpper: upper,
    })

    const url = `${BASE_URL_V2}?${searchParams}`
    return await get(url, {
      isPaginated: true,
    })
  },

  async getStorageSizes() {
    return await get(`${BASE_URL_V2}/storage-sizes`)
  }
}

export default SaleItemService
