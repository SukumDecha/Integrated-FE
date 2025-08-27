<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <div>
        <div class="text-6xl font-bold text-emerald-600 mb-4">
          404
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Page Not Found
        </h1>
        <p class="text-gray-600 mb-8">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <div class="space-y-4">
          <router-link
            to="/"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
          >
            Back to Home
          </router-link>
          <div>
            <router-link
              to="/sale-items"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
            >
              Browse Products
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No script needed for this component
</script>