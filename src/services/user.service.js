import {  get, put, } from './helper/api'

const BASE_URL = '/v2/users'

const UserService = {
  // async getAllUsers() {
  //   return await get(`${BASE_URL}`)
  // },

  async getUserById(id) {
    return await get(`${BASE_URL}/${id}`)
  },

  async updateUser(id, data) {
    return await put(`${BASE_URL}/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },


}

export default UserService
