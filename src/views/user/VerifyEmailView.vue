<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <div class="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">
        Email Verification
      </h1>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex flex-col items-center gap-2"
      >
        <span
          class="loader border-4 border-gray-200 border-t-blue-500 rounded-full w-12 h-12 animate-spin"
        />
        <p class="text-gray-600">
          Verifying your email, please wait...
        </p>
      </div>

      <!-- Success State -->
      <div v-else-if="success">
        <p class="text-green-600 font-semibold mb-4">
          ✅ Your account has been successfully activated!
        </p>
        <router-link
          to="/login"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Login
        </router-link>
      </div>

      <!-- Error State (invalid or expired token) -->
      <div v-else-if="error">
        <p class="text-red-600 font-semibold mb-4">
          ❌ {{ errorMessage }}
        </p>
        <button
          :disabled="resendLoading || resendCooldown > 0"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          @click="resendVerification"
        >
          <span v-if="resendLoading">Sending...</span>
          <span v-else-if="resendCooldown > 0"> Resend available in {{ resendCooldown }}s </span>
          <span v-else>Resend Verification Email</span>
        </button>
        <p
          v-if="resendSuccess"
          class="text-green-600 mt-3"
        >
          📧 New verification email sent successfully!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserService } from '@/services'
import { useToastStore } from '@/stores/toast.store'

const route = useRoute()
const router = useRouter()
const token = route.query.token
const toast = useToastStore()

// State
const loading = ref(true)
const success = ref(false)
const error = ref(false)
const errorMessage = ref('')
const resendLoading = ref(false)
const resendSuccess = ref(false)
const resendCooldown = ref(0)
let cooldownInterval = null

// ฟังก์ชันตรวจสอบ token และ activate user
const verifyEmail = async () => {
  loading.value = true;
  const response = await UserService.verifyEmail(token)

    if (response.error) {
      loading.value = false
      error.value = true
      errorMessage.value = response.error || 'Failed to verify email.'
      toast.add({
        title: 'Error',
        message: errorMessage.value,
        type: 'error'
      })
      return
    }

    success.value = true
    toast.add({
      title: 'Success',
      message: 'Your email has been verified successfully!',
      type: 'success'
    })
    setTimeout(() => {
      router.push('/')
    }, 2000)

    loading.value = false
}

// ฟังก์ชัน resend verification email
const resendVerification = async () => {
  resendLoading.value = true
  resendSuccess.value = false
  try {
    await UserService.resendVerification({ token })
    resendSuccess.value = true
    toast.success('New verification email sent!')

    // เริ่ม cooldown 30 วินาที
    startResendCooldown(30)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to resend verification email.')
  } finally {
    resendLoading.value = false
  }
}

// เริ่มนับ cooldown
const startResendCooldown = (seconds) => {
  resendCooldown.value = seconds
  cooldownInterval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownInterval)
    }
  }, 1000)
}

// ตรวจสอบว่ามี token หรือไม่
onMounted(() => {
  if (!token) {
    loading.value = false
    error.value = true
    errorMessage.value = 'Token not found. Please check your email link again.'
    return
  }
  verifyEmail()
})
</script>

<style scoped>
.loader {
  border-top-color: #2563eb;
}
</style>
