<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// กำหนดข้อความสำหรับแต่ละหน้า
const pageContent = computed(() => {
  const path = route.path.toLowerCase()

  if (path.includes('register') || path.includes('signup')) {
    return {
      title: 'Join Us Today!',
      description: 'Create your account and start your amazing shopping journey with exclusive deals and personalized recommendations.',
      icon: 'M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z'
    }
  } else if (path.includes('forgot') || path.includes('forget')) {
    return {
      title: 'Forgot Password?',
      description: 'Don\'t worry! It happens to the best of us. Just enter your email and we\'ll send you a link to reset your password.',
      icon: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'
    }
  } else if (path.includes('reset') || path.includes('change-password') || path.includes('new-password')) {
    return {
      title: 'Reset Password',
      description: 'Please enter your new password. Make sure it\'s strong and secure to protect your account.',
      icon: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z'
    }
  } else {
    // Default (Sign In)
    return {
      title: 'Welcome Back!',
      description: 'Sign in to access your account and continue your shopping experience with us.',
      icon: 'M3 3h18a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm9 12.5l-5-5 1.5-1.5L12 12.5l7.5-7.5L21 6.5l-9 9z'
    }
  }
})
</script>

<template>
  <!-- Main Container -->
  <div class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <!-- Background Layer with Emerald Theme and Cloud Effects -->
    <div class="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100">
      <!-- Large Cloud Blobs -->
      <div class="absolute top-10 left-20 w-96 h-96 bg-white/60 rounded-full blur-3xl"></div>
      <div class="absolute top-32 left-10 w-80 h-80 bg-emerald-100/50 rounded-full blur-3xl"></div>
      <div class="absolute top-20 right-32 w-[500px] h-[500px] bg-white/50 rounded-full blur-3xl"></div>

      <!-- Medium Cloud Blobs -->
      <div class="absolute bottom-20 right-20 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl"></div>
      <div class="absolute bottom-32 left-40 w-72 h-72 bg-white/70 rounded-full blur-2xl"></div>
      <div class="absolute top-1/2 right-10 w-64 h-64 bg-emerald-50/60 rounded-full blur-3xl"></div>

      <!-- Small Accent Clouds -->
      <div class="absolute top-40 left-1/3 w-48 h-48 bg-white/40 rounded-full blur-2xl"></div>
      <div class="absolute bottom-40 right-1/3 w-56 h-56 bg-green-50/50 rounded-full blur-2xl"></div>
      <div class="absolute top-1/3 left-1/4 w-40 h-40 bg-teal-50/60 rounded-full blur-xl"></div>

      <!-- Center Large Cloud -->
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/30 rounded-full blur-3xl"></div>
    </div>

    <!-- Left Panel - Only on Desktop -->
    <div class="hidden lg:flex absolute top-0 left-0 w-[45%] h-full bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 shadow-2xl">
      <!-- Decorative Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-1/4 left-1/4 w-64 h-64 border-2 border-white rounded-full"></div>
        <div class="absolute bottom-1/4 right-1/4 w-48 h-48 border-2 border-white rounded-full"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white rounded-full"></div>
      </div>

      <!-- Content on Left Panel -->
      <div class="relative h-full flex flex-col items-center justify-center text-white px-12 w-full">
        <div class="max-w-md space-y-6">
          <div class="flex items-center space-x-3 mb-8">
            <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h18a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm9 12.5l-5-5 1.5-1.5L12 12.5l7.5-7.5L21 6.5l-9 9z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold">Green Cart</h1>
          </div>

          <h2 class="text-4xl font-bold leading-tight transition-all duration-300">
  {{ pageContent.title }}
</h2>
<p class="text-emerald-100 text-lg leading-relaxed transition-all duration-300">
  {{ pageContent.description }}
</p>

          <div class="flex items-center space-x-2 text-sm text-emerald-100">
            <div class="flex space-x-1">
              <div class="w-2 h-2 bg-white rounded-full"></div>
              <div class="w-2 h-2 bg-white/50 rounded-full"></div>
              <div class="w-2 h-2 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Card -->
    <div
      class="relative w-full lg:ml-[45%] lg:max-w-2xl max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mx-4 overflow-y-auto transition-all duration-300 hover:shadow-emerald-200/50"
      style="max-height: calc(100vh - 40px);"
    >
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
html,
body,
#app {
  height: 100%;
}
</style>
