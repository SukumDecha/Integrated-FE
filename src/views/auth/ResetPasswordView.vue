<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
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

const form = reactive({
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  newPassword: '',
  confirmPassword: '',
})

const touched = reactive({
  newPassword: false,
  confirmPassword: false,
})

const loading = ref(false)
const showSuccessModal = ref(false)
const token = ref('')
const tokenValid = ref(false)
const userEmail = ref('')
const expiresInSeconds = ref(0)
const remainingSeconds = ref(0)
let countdownTimer = null

const countdownLabel = computed(() => {
  const s = Math.max(0, remainingSeconds.value)
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
})

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
  token.value = route.query.token || ''
  if (!token.value) {
    toastStore.add({ type: 'error', message: 'Invalid reset password link' })
    router.push('/signin')
    return
  }

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

const onBlur = (field) => {
  touched[field] = true
  validateField(field)
}

const validateField = (field) => {
  errors[field] = ''
  const value = form[field]

  if (!value) {
    if (field === 'newPassword') {
      errors[field] = 'New password is required.'
    } else if (field === 'confirmPassword') {
      errors[field] = 'Confirm password is required.'
    }
    return
  }

  if (field === 'newPassword') {
    const rules = [
      { regex: /.{8,}/, message: 'Password must be at least 8 characters long.' },
      { regex: /[a-z]/, message: 'Password must contain at least one lowercase letter.' },
      { regex: /[A-Z]/, message: 'Password must contain at least one uppercase letter.' },
      { regex: /\d/, message: 'Password must contain at least one number.' },
      { regex: /[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\\/;`~]/, message: 'Password must contain at least one special character.' },
    ]

    for (const rule of rules) {
      if (!rule.regex.test(value)) {
        errors[field] = rule.message
        return
      }
    }
  }

  if (field === 'confirmPassword' && value !== form.newPassword) {
    errors[field] = 'Passwords do not match.'
    return
  }

  if (field === 'newPassword' && touched.confirmPassword && form.confirmPassword) {
    if (form.confirmPassword !== value) {
      errors.confirmPassword = 'Passwords do not match.'
    } else {
      errors.confirmPassword = ''
    }
  }
}

const validateForm = () => {
  validateField('newPassword')
  validateField('confirmPassword')
  return !errors.newPassword && !errors.confirmPassword
}

const isValid = computed(() => {
  return (
    form.newPassword.length >= 8 &&
    form.confirmPassword.length > 0 &&
    form.newPassword === form.confirmPassword &&
    !errors.newPassword &&
    !errors.confirmPassword
  )
})

const handleSubmit = async () => {
  touched.newPassword = true
  touched.confirmPassword = true

  if (!validateForm()) {
    toastStore.add({ type: 'error', message: 'Please fill in all required fields correctly.' })
    return
  }

  if (!tokenValid.value || remainingSeconds.value <= 0) {
    toastStore.add({ type: 'error', message: 'Reset link has expired or is invalid.' })
    return
  }

  loading.value = true
  loaderStore.startLoading()

  const response = await AuthService.resetPassword(token.value, {
    newPassword: form.newPassword.trim(),
    confirmPassword: form.confirmPassword.trim(),
  })

  loaderStore.stopLoading()
  loading.value = false

  if (response?.message === 'Password reset successful') {
    showSuccessModal.value = true
  } else {
    toastStore.add({ type: 'error', message: 'Failed to reset password' })
  }
}

const goToLogin = () => {
  router.push('/signin')
}
</script>

<template>
  <div class="max-w-md mx-auto mt-12 p-6 space-y-6">
    <!-- Header -->
    <div class="text-center space-y-1 mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">
        Reset Password
      </h2>
      <p class="text-sm text-gray-500">
        Enter your new password below
      </p>

      <div class="flex justify-center mt-7">
        <div
          v-if="tokenValid && remainingSeconds > 0"
          class="shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-white border border-emerald-700 text-emerald-700"
        >
          Expires in {{ countdownLabel }}
        </div>
        <div
          v-else
          class="shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-white border border-red-200 text-red-700"
        >
          Reset link expired or invalid
        </div>
      </div>
    </div>

    <!-- Form -->
    <form
      class="space-y-4"
      @submit.prevent="handleSubmit"
    >
      <XInput
        v-model="form.newPassword"
        label="New Password"
        type="password"
        placeholder="Enter your new password"
        required
        :error-message="touched.newPassword ? errors.newPassword : ''"
        maxlength="50"
        :disabled="!tokenValid || remainingSeconds <= 0"
        @blur="onBlur('newPassword')"
      />

      <XInput
        v-model="form.confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Re-enter your new password"
        required
        :error-message="touched.confirmPassword ? errors.confirmPassword : ''"
        maxlength="50"
        :disabled="!tokenValid || remainingSeconds <= 0"
        @blur="onBlur('confirmPassword')"
      />

      <div class="flex justify-end pt-4">
        <XButton
          label="Reset Password"
          type="submit"
          class="itbms-save-button"
          :loading="loading"
          :disabled="!isValid || !tokenValid || remainingSeconds <= 0 || loading"
        />
      </div>
    </form>
  </div>

  <!-- Success Modal -->
  <XConfirmModal
    v-model="showSuccessModal"
    title="Password Reset Successful"
    message="Your password has been successfully updated."
    type="success"
    :show-confirm="false"
    cancel-label="OK"
    @update:model-value="goToLogin"
  />
</template>
