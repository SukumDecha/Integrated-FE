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
        :variant="userType === UserRole.BUYER ? 'primary' : 'outline'"
        class="itbms-register-buyer"
        @click="userType = UserRole.BUYER"
      />
      <XButton
        label="I'm a Seller"
        :variant="userType === UserRole.SELLER ? 'primary' : 'outline'"
        class="itbms-register-seller"
        @click="userType = UserRole.SELLER"
      />
    </div>

    <!-- ฟอร์มลงทะเบียน -->
    <RegisterForm
      :mode="userType"
      @submitted="handleSuccess"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import RegisterForm from '@/components/auth/RegisterForm.vue'
import XButton from '@/components/common/XButton.vue'
import { UserRole } from '@/constants'

const userType = ref(UserRole.BUYER)
const router = useRouter()

const handleSuccess = () => {
  router.push('/')
}
</script>
