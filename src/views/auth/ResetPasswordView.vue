<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import XInput from '@/components/common/form/XInput.vue'
import XButton from '@/components/common/XButton.vue'
import XConfirmModal from '@/components/common/modal/XConfirmModal.vue'

const router = useRouter()

const form = ref({
  newPassword: '',
  confirmPassword: '',
})

const showSuccessModal = ref(false)

const handleSubmit = () => {
  // ตรวจสอบว่ารหัสตรงกันไหม
  if (form.value.newPassword !== form.value.confirmPassword) {
    alert('Passwords do not match!')
    return
  }

  // เรียก API reset password (ตัวอย่าง)
  // await AuthService.resetPassword(form.value.newPassword)

  // แสดง popup แจ้งเตือนสำเร็จ
  showSuccessModal.value = true
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
