<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 w-80">
    <transition-group name="fade" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'rounded-lg px-4 py-3 shadow text-white flex justify-between items-center',
          toast.type === 'success' && 'bg-green-500',
          toast.type === 'error' && 'bg-red-500',
          toast.type === 'info' && 'bg-blue-500',
          toast.type === 'warn' && 'bg-yellow-400 text-black'
        ]"
      >
        <span class="itbms-message">{{ toast.message }}</span>
        <button
          class="ml-4 text-sm opacity-70 hover:opacity-100"
          @click="remove(toast.id)"
        >×</button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toast.store'

const toastStore = useToastStore()
const { toasts } = storeToRefs(toastStore)
const { remove } = toastStore
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
