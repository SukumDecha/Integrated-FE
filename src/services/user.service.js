import { put } from './helper/api'

const BASE_URL_V2 = '/v2/users'

const UserService = {
  async updateUser(id, data) {
    return await put(`${BASE_URL_V2}/${id}`, data)
  },
}

export default UserService
