<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import XInput from '@/components/common/form/XInput.vue'
import XButton from '@/components/common/XButton.vue'
import AuthService from '@/services/auth.service'
import { useToastStore } from '@/stores/toast.store'
import { useLoaderStore } from '@/stores/loader.store'

const router = useRouter()
const toastStore = useToastStore()
const loaderStore = useLoaderStore()
const email = ref('')

const goBack = () => {
  router.push('/signin')
}

const handleSubmit = async () => {
    loaderStore.startLoading()
    const response = await AuthService.forgotPassword({ email: email.value })

    if (response?.message === 'If email exists, a reset link has been sent to your email.') {
      toastStore.add({ type: 'success', message: 'Reset password link has been sent to your email' })
      router.push('/signin')
    } else {
      toastStore.add({ type: 'error', message: response.message || 'Failed to send reset password link' })
      router.push('/signin')
    }
     loaderStore.stopLoading()
  }
</script>

<template>
  <div class="max-w-md mx-auto mt-12 p-6">
    <h2 class="text-2xl font-semibold text-gray-800 mb-6 text-center">Forgot Password</h2>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <XInput v-model="email" label="Email" type="email" required placeholder="Enter your email" />

      <div class="flex justify-between items-center pt-4">
        <XButton
          label="Back to Sign in"
          variant="ghost"
          type="button"
          class="text-gray-500  hover:text-gray-500"
          @click="goBack"
        />

        <XButton label="Send Reset Link" type="submit" />
      </div>
    </form>
  </div>
</template>
