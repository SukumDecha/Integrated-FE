<script setup>
import { ref, onMounted } from 'vue'
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

onMounted(async () => {
  // Get token from URL query params
  token.value = route.query.token || ''

  if (!token.value) {
    toastStore.error('Invalid reset password link')
    router.push('/signin')
    return
  }

  // Validate token
  try {
    loaderStore.startLoading()
    const response = await AuthService.validateResetPasswordToken(token.value)
    if (response.valid) {
      tokenValid.value = true
      userEmail.value = response.email || ''
    } else {
      toastStore.error('Reset password link has expired or is invalid')
      router.push('/signin')
    }
  } catch (error) {
    toastStore.error('Failed to validate reset password link', error)
    router.push('/signin')
  } finally {
    loaderStore.stopLoading()
  }
})

const handleSubmit = async () => {
  // Check if passwords match
  if (form.value.newPassword !== form.value.confirmPassword) {
    toastStore.error('Passwords do not match!')
    return
  }

  try {
    loaderStore.show()
    await AuthService.resetPassword(token.value, {
      newPassword: form.value.newPassword,
      confirmPassword: form.value.confirmPassword
    })
    showSuccessModal.value = true
  } catch (error) {
    toastStore.error(error.message || 'Failed to reset password')
  } finally {
    loaderStore.hide()
  }
}

const goToLogin = () => {
  router.push('/signin')
}
</script>

<template>

  <div class="max-w-md mx-auto mt-12 p-6space-y-6">
    <!-- Header -->
    <div class="text-center space-y-1">
      <h2 class="text-2xl font-semibold text-gray-800">Reset Password</h2>
      <p class="text-sm text-gray-500">Enter your new password below</p>
    </div>

    <!-- Form -->
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <XInput
        v-model="form.newPassword"
        label="New Password"
        type="password"
        placeholder="Enter your new password"
        required
      />
      <XInput
        v-model="form.confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="Re-enter your new password"
        required
      />

      <div class="flex justify-end pt-4">
        <XButton label="Reset Password" type="submit" class="itbms-save-button" />
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
