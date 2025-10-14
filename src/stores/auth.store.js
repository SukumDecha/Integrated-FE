import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { AuthService } from '@/services'
import router from '@/router'

const parseToken = (jwt) => {
  try {
    const decoded = jwtDecode(jwt)
    return {
      id: decoded.id,
      nickname: decoded.nickname,
      role: decoded.role,
      exp: decoded.exp,
    }
  } catch (e) {
    console.error('Invalid token:', e)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(token.value ? parseToken(token.value) : null)

  const isLoggedIn = computed(() => !!user.value)
  const userId = computed(() => user.value?.id || null)
  const userNickname = computed(() => user.value?.nickname || '')
  const userRole = computed(() => user.value?.role || '')
  const isTokenExpired = () => {
    if (!token.value) {
      return true
    }
    const now = Math.floor(Date.now() / 1000)
    const expired = user.value?.exp <= now

    return expired
  }

  const login = (jwt) => {
    token.value = jwt
    localStorage.setItem('token', jwt)
    user.value = parseToken(jwt)
  }

  const logout = async () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    router.push('/signin')
    await AuthService.logout()
  }

  const setUserFromToken = () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      user.value = parseToken(savedToken)
    }
  }

  const setUser = (userData) => {
    user.value = userData
  }

  const refreshAccessToken = async () => {
    try {
      const res = await AuthService.refresh()

      if (res.error) {
        console.warn('Refresh token failed:', res.error)
        logout()
        return { error: res.error }
      }

      // Check different possible response structures
      const newToken = res.data?.access_token || res.access_token || res.data?.token || res.token

      if (newToken) {
        login(newToken)
        return { success: true }
      } else {
        console.error('No access token found in response')
        logout()
        return { error: 'No access token received' }
      }
    } catch (err) {
      console.error('Refresh error:', err)
      logout()
      return { error: err.message }
    }
  }

  return {
    token,
    user,
    isLoggedIn,
    userId,
    userNickname,
    userRole,
    login,
    logout,
    setUserFromToken,
    setUser,
    refreshAccessToken,
    isTokenExpired,
  }
})
