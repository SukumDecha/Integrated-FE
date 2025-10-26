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
    }
  } catch {
    return null
  }
}

const isLoggingOut = ref(false)

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(token.value ? parseToken(token.value) : null)

  // ────────────────────────────────
  // Computed
  // ────────────────────────────────
  const userInfo = computed(() => {
    const u = user.value
    return {
      isLoggedIn: Boolean(u),
      id: u?.id ?? null,
      nickname: u?.nickname ?? '',
      role: u?.role ?? '',
    }
  })

  // ────────────────────────────────
  // Actions
  // ────────────────────────────────
  const login = (jwt) => {
    token.value = jwt
    localStorage.setItem('token', jwt)
    user.value = parseToken(jwt)
  }

  const logout = async () => {
    if (isLoggingOut.value) return
    isLoggingOut.value = true

    try {
      await AuthService.logout()
    } catch (e) {
      console.warn('Logout request failed:', e)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      router.push('/signin')
      isLoggingOut.value = false
    }
  }

  const setUserFromToken = () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      user.value = parseToken(savedToken)
    } else {
      token.value = null
      user.value = null
    }
  }

  const setUser = (userData) => {
    user.value = userData
  }

  const refreshAccessToken = async () => {
    const res = await AuthService.refresh()
    if (res.error) {
      console.warn('Refresh token failed:', res.error)
      return { error: res.error }
    }

    const newToken = res.data?.access_token || res.access_token || res.data?.token || res.token
    if (!newToken) {
      console.error('No access token found in refresh response')
      return { error: 'No access token received' }
    }

    login(newToken)
    return { success: true }
  }

  return {
    token,
    user,
    userInfo,
    login,
    logout,
    setUserFromToken,
    setUser,
    refreshAccessToken,
  }
})
