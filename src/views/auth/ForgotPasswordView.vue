<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import XInput from '@/components/common/form/XInput.vue'
import XButton from '@/components/common/XButton.vue'

const router = useRouter()
const email = ref('')

const goBack = () => {
  router.push('/signin')
}
</script>

<template>
  <div class="max-w-md mx-auto mt-12 p-6">
    <h2 class="text-2xl font-semibold text-gray-800 mb-6 text-center">Forgot Password</h2>

    <form class="space-y-4">
      <XInput v-model="email" label="Email" type="email" required placeholder="Enter your email" />

      <div class="flex justify-between items-center pt-4">
        <XButton
          label="Back to Sign in"
          variant="ghost"
          type="button"
          class="text-gray-500  hover:text-gray-500"
          @click="goBack"
        />

        <XButton label="Send Reset Link" type="button" />
      </div>
    </form>
  </div>
</template>
