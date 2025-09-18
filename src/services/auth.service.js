import { post } from './helper/api'

const BASE_URL = '/v2/auth'

const AuthService = {

  async registerUser(data) {
    return await post(`${BASE_URL}/register`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  async verifyEmail(token) {
    return await post((`${BASE_URL}/verify-email?jwtToken=${token}`))
  },

  async resendVerification(data) {
    return await post(`${BASE_URL}/resend-verification`, data)
  }
}

export default AuthService
