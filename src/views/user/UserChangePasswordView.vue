<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import XInput from '@/components/common/form/XInput.vue'
import XButton from '@/components/common/XButton.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'


const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Profile', path: '/profile' },
  { text: 'Change Password', active: true },
]

const router = useRouter()

const form = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})


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
    <form class="space-y-4">
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
          type="submit"
          class="itbms-save-button"
        />
      </div>
    </form>
  </div>
</template>
