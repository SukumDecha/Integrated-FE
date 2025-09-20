<template>
  <div class="max-w-md mx-auto p-6">
    <h1 class="text-3xl font-semibold text-center text-gray-800 mb-6">
      Welcome Back
    </h1>
    <p class="text-center text-gray-500 mb-8 text-sm">
      Sign in to your account to continue shopping
    </p>

    <!-- Sign In Form -->
    <UserLoginForm />
  </div>
</template>

<script setup>
import UserLoginForm from  '@/components/user/UserLoginForm.vue'
</script>
