import {  post, } from './helper/api'

const BASE_URL = '/v2/users'

const UserService = {
  // async getAllUsers() {
  //   return await get(`${BASE_URL}`)
  // },

  // async getUserById(id) {
  //   return await get(`${BASE_URL}/${id}`)
  // },

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

  // async updateUser(id, data) {
  //   return await put(`${BASE_URL}/${id}`, data, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data',
  //     },
  //   })
  // },

  // async deleteUser(id) {
  //   return await remove(`${BASE_URL}/${id}`)
  // },
}

export default UserService
