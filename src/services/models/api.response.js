export class BaseResponse {
    constructor() {
      this._message = ""
      this._data = null
      this._error = null
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
  
    build() {
      return {
        message: this._message,
        data: this._data,
        error: this._error
      }
    }
  }
  
  export const BaseResponseMessage = {
      Success: 'Successfully fetch data',
      Failed: 'Failed to fetch data',
      NotFound: 'Data not found'
  };