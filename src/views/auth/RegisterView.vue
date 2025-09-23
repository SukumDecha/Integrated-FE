<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-semibold text-center text-gray-800 mb-6">
      Create Your Account
    </h1>
    <p class="text-center text-gray-500 mb-8 text-sm">
      Sign up to explore the latest smartphones and exclusive deals
    </p>

    <!-- ปุ่มเลือกโหมด -->
    <div class="flex justify-center gap-4 mb-6">
      <XButton
        label="I'm a Buyer"
        :variant="userType === 'BUYER' ? 'primary' : 'outline'"
        class="itbms-register-buyer"
        @click="userType = 'BUYER'"
      />
      <XButton
        label="I'm a Seller"
        :variant="userType === 'SELLER' ? 'primary' : 'outline'"
        class="itbms-register-seller"
        @click="userType = 'SELLER'"
      />
    </div>

    <!-- ฟอร์มลงทะเบียน -->
    <UserRegisterForm
      :mode="userType"
      @submitted="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import UserRegisterForm from '@/components/user/UserRegisterForm.vue'
import XButton from '@/components/common/XButton.vue'

const userType = ref('BUYER')
const router = useRouter()

const handleSuccess = () => {
  router.push('/')
}
</script>
