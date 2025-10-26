<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import XInput from '@/components/common/form/XInput.vue'
import XButton from '@/components/common/XButton.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import AuthService from '@/services/auth.service'
import { useToastStore } from '@/stores/toast.store'
import { useLoaderStore } from '@/stores/loader.store'

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Profile', path: '/profile' },
  { text: 'Change Password', active: true },
]

const router = useRouter()
const toastStore = useToastStore()
const loaderStore = useLoaderStore()

const form = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const touched = reactive({
  currentPassword: false,
  newPassword: false,
  confirmPassword: false,
})

const loading = ref(false)

const onBlur = (field) => {
  touched[field] = true
  validateField(field)
}

const validateField = (field) => {
  errors[field] = ''
  const value = form[field]

  if (!value) {
    if (field === 'currentPassword') {
      errors[field] = 'Current password is required.'
    } else if (field === 'newPassword') {
      errors[field] = 'New password is required.'
    } else if (field === 'confirmPassword') {
      errors[field] = 'Confirm password is required.'
    }
    return
  }

  // Validate new password strength
  if (field === 'newPassword' && value.length < 8) {
    errors[field] = 'Password must be at least 8 characters long.'
    return
  }

  // Validate confirm password matches new password
  if (field === 'confirmPassword' && value !== form.newPassword) {
    errors[field] = 'Passwords do not match.'
    return
  }

  // Revalidate confirm password when new password changes
  if (field === 'newPassword' && touched.confirmPassword && form.confirmPassword) {
    if (form.confirmPassword !== value) {
      errors.confirmPassword = 'Passwords do not match.'
    } else {
      errors.confirmPassword = ''
    }
  }
}

const validateForm = () => {
  validateField('currentPassword')
  validateField('newPassword')
  validateField('confirmPassword')
  return !errors.currentPassword && !errors.newPassword && !errors.confirmPassword
}

const isValid = computed(() => {
  return (
    form.currentPassword.length > 0 &&
    form.newPassword.length >= 8 &&
    form.confirmPassword.length > 0 &&
    form.newPassword === form.confirmPassword &&
    !errors.currentPassword &&
    !errors.newPassword &&
    !errors.confirmPassword
  )
})

const handleSubmit = async () => {
  touched.currentPassword = true
  touched.newPassword = true
  touched.confirmPassword = true

  if (!validateForm()) {
    toastStore.add({ type: 'error', message: 'Please fill in all required fields correctly.' })
    return
  }

  loading.value = true
  loaderStore.startLoading()

  try {
    const response = await AuthService.changePassword({
      oldPassword: form.currentPassword.trim(),
      newPassword: form.newPassword.trim(),
      confirmPassword: form.confirmPassword.trim(),
    })

    if (response?.message === 'Password changed successfully') {
      toastStore.add({ type: 'success', message: 'Your password has been updated.' })
      router.push('/profile')
    } else {
      toastStore.add({ type: 'error', message: response?.message || 'Failed to change password' })
    }
  } catch (err) {
    console.error('Change password error:', err)
    const message = err?.message || 'Unexpected error occurred during password change.'
    toastStore.add({ type: 'error', message })
  } finally {
    loading.value = false
    loaderStore.stopLoading()
  }
}

const goBack = () => {
  form.currentPassword = ''
  form.newPassword = ''
  form.confirmPassword = ''
  touched.currentPassword = false
  touched.newPassword = false
  touched.confirmPassword = false
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''
  router.push('/profile')
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />
  <div class="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md space-y-6">
    <!-- Header -->
    <div class="text-center space-y-1">
      <h2 class="text-2xl font-semibold text-gray-800">
        Change Password
      </h2>
      <p class="text-sm text-gray-500">
        Update your password for account security
      </p>
    </div>

    <!-- Password Form -->
    <form
      class="space-y-4"
      @submit.prevent="handleSubmit"
    >
      <XInput
        v-model="form.currentPassword"
        label="Current Password"
        type="password"
        placeholder="Enter your current password"
        required
        :error-message="touched.currentPassword ? errors.currentPassword : ''"
        maxlength="50"
        @blur="onBlur('currentPassword')"
      />
      <div class="flex justify-end">
        <span
          class="text-gray-500 hover:text-gray-700 px-0 py-0 text-sm hover:underline cursor-pointer"
          @click="goToForgotPassword"
        >
          Forgot Password?
        </span>
      </div>

      <XInput
        v-model="form.newPassword"
        label="New Password"
        type="password"
        placeholder="Enter your new password"
        required
        :error-message="touched.newPassword ? errors.newPassword : ''"
        maxlength="50"
        @blur="onBlur('newPassword')"
      />

      <XInput
        v-model="form.confirmPassword"
        label="Confirm New Password"
        type="password"
        placeholder="Re-enter your new password"
        required
        :error-message="touched.confirmPassword ? errors.confirmPassword : ''"
        maxlength="50"
        @blur="onBlur('confirmPassword')"
      />

      <!-- Buttons -->
      <div class="flex justify-between items-center pt-4">
        <XButton
          label="Back to Profile"
          variant="ghost"
          type="button"
          class="text-gray-500 hover:text-gray-700 px-0"
          @click="goBack"
        />

        <XButton
          label="Change Password"
          type="submit"
          :loading="loading"
          :disabled="!isValid || loading"
          class="itbms-save-button"
        />
      </div>
    </form>
  </div>
</template>
