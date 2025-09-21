import {  get, put, post } from './helper/api'

const BASE_URL_V2 = '/v2/users'

const UserService = {
  // async getAllUsers() {
  //   return await get(`${BASE_URL}`)
  // },

  async getUserById(id) {
    return await get(`${BASE_URL_V2}/${id}`)
  },

  async login(credentials) {
    return await post(`${BASE_URL_V2}/authentications`, credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },

  async updateUser(id, data) {
    return await put(`${BASE_URL_V2}/${id}`, data)
  },

}

export default UserService
