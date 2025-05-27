export class PaginationResponse {
    constructor() {
      this._message = ""
      this._error = null
      this._pagination = {
        page: null,
        perPage: null,
        totalPages: null,
        totalItems: null,
        sortBy: null,
        sortOrder: null
      }
      this._data = null
    }

    message(message) {
      this._message = message
      return this
    }

    data(data) {
      this._data = data
      return this
    }

    error(message) {
      this._error = message
      return this
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
      return {
              message: this._message,
              pagination: this._pagination,
              data: this._data,
              error: this._error
          };
    }
  }
