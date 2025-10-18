<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import XInput from '@/components/common/form/XInput.vue'
import XButton from '@/components/common/XButton.vue'
import XConfirmModal from '@/components/common/modal/XConfirmModal.vue'
import AuthService from '@/services/auth.service'
import { useToastStore } from '@/stores/toast.store'
import { useLoaderStore } from '@/stores/loader.store'

const router = useRouter()
const route = useRoute()
const toastStore = useToastStore()
const loaderStore = useLoaderStore()

const form = ref({
  newPassword: '',
  confirmPassword: '',
})

const showSuccessModal = ref(false)
const token = ref('')
const tokenValid = ref(false)
const userEmail = ref('')
const expiresInSeconds = ref(0)
const remainingSeconds = ref(0)
let countdownTimer = null

// --- แปลงเวลานับถอยหลังเป็น mm:ss ---
const countdownLabel = computed(() => {
  const s = Math.max(0, remainingSeconds.value)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
})

// --- เริ่มนับถอยหลัง ---
function startCountdown(seconds) {
  remainingSeconds.value = seconds
  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    remainingSeconds.value -= 1
    if (remainingSeconds.value <= 0) {
      clearInterval(countdownTimer)
      toastStore.add({ type: 'error', message: 'Reset password link has expired' })
      router.push('/signin')
    }
  }, 1000)
}

onBeforeUnmount(() => clearInterval(countdownTimer))

onMounted(async () => {
  // Get token from URL query params
  token.value = route.query.token || ''

  if (!token.value) {
    toastStore.add({ type: 'error', message: 'Invalid reset password link' })
    router.push('/signin')
    return
  }

  // Validate token
  loaderStore.startLoading()
  const res = await AuthService.validateResetPasswordToken(token.value)
  const response = res.data 

  if (response.valid) {
    tokenValid.value = true
    userEmail.value = response.email
    expiresInSeconds.value = response.expiresInSeconds
    startCountdown(expiresInSeconds.value)
  } else {
    toastStore.add({ type: 'error', message: 'Reset password link has expired or is invalid' })
    router.push('/signin')
  }
  loaderStore.stopLoading()
})

const handleSubmit = async () => {
  // Check if passwords match
  if (form.value.newPassword !== form.value.confirmPassword) {
    toastStore.add({ type: 'error', message: 'Passwords do not match!' })
    return
  }

  loaderStore.startLoading()

  const response = await AuthService.resetPassword(token.value, {
    newPassword: form.value.newPassword,
    confirmPassword: form.value.confirmPassword,
  })

  if (response?.message) {
    showSuccessModal.value = true
  } else {
    toastStore.add({ type: 'error', message: response?.message || 'Failed to reset password' })
  }

  loaderStore.stopLoading()
}

const goToLogin = () => {
  router.push('/signin')
}
</script>

<template>
  <div class="max-w-md mx-auto mt-12 p-6 space-y-6">
    <!-- Header -->
    <div class="text-center space-y-1 mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">Reset Password</h2>
      <p class="text-sm text-gray-500">Enter your new password below</p>

      <div class="flex justify-center mt-7">
        <!-- ยัง valid อยู่ -->
        <div
          v-if="tokenValid && remainingSeconds > 0"
          class="shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-white border border-emerald-700 text-emerald-700"
        >
          Expires in {{ countdownLabel }}
        </div>

        <!-- ถ้าหมดอายุหรือ token ไม่ valid -->
        <div
          v-else
          class="shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-white border border-red-200 text-red-700"
        >
          Reset link expired or invalid
        </div>
      </div>
    </div>

    <!-- Form -->
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <XInput
        v-model="form.newPassword"
        label="New Password"
        type="password"
        placeholder="Enter your new password"
        required
        :disabled="!tokenValid || remainingSeconds <= 0"
      />
      <XInput
        v-model="form.confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Re-enter your new password"
        required
        :disabled="!tokenValid || remainingSeconds <= 0"
      />

      <div class="flex justify-end pt-4">
        <XButton
          label="Reset Password"
          type="submit"
          class="itbms-save-button"
          :disabled="!tokenValid || remainingSeconds <= 0"
        />
      </div>
    </form>
  </div>

  <!-- Success Modal -->
  <XConfirmModal
    v-model="showSuccessModal"
    title="Password Reset Successful"
    message="Your password has been successfully updated."
    :showConfirm="false"
    cancelLabel="OK"
    @update:modelValue="goToLogin"
  />
</template>
