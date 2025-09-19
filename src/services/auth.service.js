import { get, post } from './helper/api'

const BASE_URL = '/v2/auth'

const AuthService = {
  async login(data) {
    return await post(`${BASE_URL}/authenticate`, data)
  },

  async registerUser(data) {
    return await post(`${BASE_URL}/register`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async getCurrentUser() {
    return await get(`${BASE_URL}/me`)
  },

  async verifyEmail(token) {
    return await post((`${BASE_URL}/verify-email?jwtToken=${token}`))
  },

  async resendVerification(data) {
    return await post(`${BASE_URL}/resend-verification`, data)
  }
}

export default AuthService
