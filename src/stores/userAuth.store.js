import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
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
  const user = ref(token.value ? parseToken(token.value) : null)

  const login = (jwt) => {
    token.value = jwt
    localStorage.setItem('token', jwt)
    user.value = parseToken(jwt)
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  const setUserFromToken = () => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      user.value = parseToken(savedToken)
    }
  }

  const isLoggedIn = computed(() => !!user.value)
  const userId = computed(() => user.value?.id || null)
  const userNickname = computed(() => user.value?.nickname || '')
  const userRole = computed(() => user.value?.role || '')

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
  }
})
