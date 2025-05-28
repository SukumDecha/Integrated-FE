<script setup>
import { computed } from 'vue';
import { useLoaderStore } from '@/stores/loader.store';

const loaderStore = useLoaderStore();
const isVisible = computed(() => loaderStore.isVisible);
</script>


<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 transition-opacity duration-300 ease-out"
  >
    <div class="flex flex-col items-center">
      <div class="xspin-loader w-16 h-16 border-4 border-t-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p class="mt-4 text-white text-lg font-semibold">
        Loading...
      </p>
    </div>
  </div>
</template>
<style scoped>

.xspin-loader {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
