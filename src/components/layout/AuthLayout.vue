<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <!-- Main Container -->
  <div class="relative min-h-screen flex items-center justify-center overflow-hidden">
    <!-- Background Layer -->
    <div class="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <!-- Decorative Circles -->
      <div class="absolute top-20 left-10 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl"></div>
      <div class="absolute bottom-20 right-10 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-3xl"></div>
    </div>

    <!-- Left Panel - Only on Desktop -->
    <div class="hidden md:block absolute top-0 left-0 w-[40%] h-full bg-gradient-to-br from-emerald-700 to-emerald-900 shadow-2xl">
      <!-- Decorative Pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-1/4 left-1/4 w-64 h-64 border-2 border-white rounded-full"></div>
        <div class="absolute bottom-1/4 right-1/4 w-48 h-48 border-2 border-white rounded-full"></div>
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white rounded-full"></div>
      </div>

      <!-- Content on Left Panel -->
      <div class="relative h-full flex flex-col items-center justify-center text-white px-12 space-y-6">
        <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
          <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 3h18a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm9 12.5l-5-5 1.5-1.5L12 12.5l7.5-7.5L21 6.5l-9 9z"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Mobile Top Bar -->
    <div class="md:hidden absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-emerald-700 to-emerald-900"></div>

    <!-- Form Card -->
    <div
      class="relative w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 mx-4 overflow-y-auto transition-all duration-300 hover:shadow-emerald-200/50"
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
