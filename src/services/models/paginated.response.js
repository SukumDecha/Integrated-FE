import { BaseResponse } from './api.response'

export class PaginationResponse extends BaseResponse {
  constructor() {
    super()
    this._pagination = {
      page: null,
      perPage: null,
      totalPages: null,
      totalItems: null,
      sortBy: null,
      sortOrder: null,
    }
  }

  page(number) {
    this._pagination.page = number
    return this
  }

  perPage(number) {
    this._pagination.perPage = number
    return this
  }

  totalPages(number) {
    this._pagination.totalPages = number
    return this
  }

  totalItems(number) {
    this._pagination.totalItems = number
    return this
  }

  sortBy(field) {
    this._pagination.sortBy = field
    return this
  }

  sortOrder(order) {
    this._pagination.sortOrder = order
    return this
  }

  build() {
    const base = super.build()
    return {
      ...base,
      pagination: this._pagination,
    }
  }
}
