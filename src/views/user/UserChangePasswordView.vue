<script setup>
import { ref } from 'vue'
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

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const handleSubmit = async () => {
  // Check if passwords match
  if (form.value.newPassword !== form.value.confirmPassword) {
    toastStore.add({ type: 'error', message: 'New passwords do not match!' })

    return
  }

  loaderStore.startLoading()

  const response = await AuthService.changePassword({
    oldPassword: form.value.currentPassword,
    newPassword: form.value.newPassword,
    confirmPassword: form.value.confirmPassword,
  })

  if (response?.message === 'Password changed successfully') {
    toastStore.add({ type: 'success', message: 'Your password has been updated.' })
    router.push('/profile')
  } else {
    toastStore.add({ type: 'error', message: response?.message || 'Failed to change password' })
  }

  loaderStore.stopLoading()
}

const goBack = () => {
  router.push('/profile')
}
</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />
  <div class="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md space-y-6">
    <!-- Header -->
    <div class="text-center space-y-1">
      <h2 class="text-2xl font-semibold text-gray-800">Change Password</h2>
      <p class="text-sm text-gray-500">Update your password for account security</p>
    </div>

    <!-- Password Form -->
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <XInput
        v-model="form.currentPassword"
        label="Current Password"
        type="password"
        placeholder="Enter your current password"
        required
      />

      <XInput
        v-model="form.newPassword"
        label="New Password"
        type="password"
        placeholder="Enter your new password"
        required
      />

      <XInput
        v-model="form.confirmPassword"
        label="Confirm New Password"
        type="password"
        placeholder="Re-enter your new password"
        required
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
          type="button"
          class="itbms-save-button"
          @click="handleSubmit"
        />
      </div>
    </form>
  </div>
</template>
