import { get, patch, post } from './helper/api'

const BASE_URL = '/v2/auth'

const AuthService = {
  async login(data) {
    return await post(`${BASE_URL}/login`, data)
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
    return await post(`${BASE_URL}/verify-email?jwtToken=${token}`)
  },

  async resendVerification(data) {
    return await post(`${BASE_URL}/resend-verification`, data)
  },

  async refresh() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${BASE_URL}/refresh`, {
        method: 'POST',
        credentials: 'include',
      })

      if (res.status === 401) {
        const errData = await res.json().catch(() => ({}))
        return { error: errData?.errorMessage || 'Refresh token expired' }
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        return { error: errData?.errorMessage || `Failed to refresh (${res.status})` }
      }

      const data = await res.json()
      return { data }
    } catch (e) {
      return { error: e.message }
    }
  },

  async logout() {
    return await post(`${BASE_URL}/logout`)
  },

  async forgotPassword(data) {
    return await post(`${BASE_URL}/forgot-password`, data)
  },

  async validateResetPasswordToken(token) {
    return await get(`${BASE_URL}/reset-password/validate?token=${token}`)
  },

  async resetPassword(token, data) {
    return await post(`${BASE_URL}/reset-password?token=${token}`, data)
  },

  async changePassword(data) {
    return await patch(`${BASE_URL}/change-password`, data)
  },
}

export default AuthService
