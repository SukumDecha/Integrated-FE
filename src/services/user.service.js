import {  post, } from './helper/api'

const BASE_URL = '/v2/users'

const UserService = {
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
  },

  async login(credentials) {
    return await post(`${BASE_URL}/authentications`, credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },


}

export default UserService
