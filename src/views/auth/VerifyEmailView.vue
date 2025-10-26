<template>
  <div class="">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex flex-col items-center gap-6"
    >
      <div class="relative">
        <Loader2 class="w-16 h-16 text-green-500 animate-spin" />
      </div>
      <div class="text-center">
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">
          Verifying Email
        </h2>
        <p class="text-gray-500">
          Please wait while we verify your account...
        </p>
      </div>
    </div>

    <!-- Success State -->
    <div
      v-else-if="success"
      class="flex flex-col items-center gap-6"
    >
      <div class="relative">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 class="w-12 h-12 text-green-600" />
        </div>
      </div>
      <div class="text-center">
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">
          Email Verified!
        </h2>
        <p class="text-gray-600 mb-6">
          Your account has been successfully activated.
        </p>
        <router-link
          to="/login"
          class="inline-block bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
        >
          Go to Login
        </router-link>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="flex flex-col items-center gap-6"
    >
      <div class="relative">
        <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle class="w-12 h-12 text-red-600" />
        </div>
      </div>
      <div class="text-center">
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">
          Verification Failed
        </h2>
        <p class="text-gray-600 mb-6">
          {{ errorMessage }}
        </p>
        <button
          :disabled="resendLoading || resendCooldown > 0"
          class="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
          @click="resendVerification"
        >
          <span
            v-if="resendLoading"
            class="flex items-center gap-2"
          >
            <svg
              class="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Sending...
          </span>
          <span v-else-if="resendCooldown > 0">
            Resend in {{ resendCooldown }}s
          </span>
          <span v-else>Resend Verification Email</span>
        </button>
        <p
          v-if="resendSuccess"
          class="text-green-600 mt-4 font-medium flex items-center justify-center gap-2"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          New verification email sent!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AuthService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-vue-next'
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

// Verify email function
const verifyEmail = async () => {
  loading.value = true
  const response = await AuthService.verifyEmail(token)

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

// Resend verification email
const resendVerification = async () => {
  resendLoading.value = true
  resendSuccess.value = false
  try {
    await AuthService.resendVerification({ token })
    resendSuccess.value = true
    toast.add({
      title: 'Success',
      message: 'New verification email sent!',
      type: 'success'
    })

    // Start 30 second cooldown
    startResendCooldown(30)
  } catch (err) {
    toast.add({
      title: 'Error',
      message: err.response?.data?.message || 'Failed to resend verification email.',
      type: 'error'
    })
  } finally {
    resendLoading.value = false
  }
}

// Start cooldown timer
const startResendCooldown = (seconds) => {
  resendCooldown.value = seconds
  cooldownInterval = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownInterval)
    }
  }, 1000)
}

// Check if token exists
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
