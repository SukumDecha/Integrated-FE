<template>
  <div class="fixed top-6 right-6 z-50 space-y-3 w-96">
    <transition-group
      name="toast"
      tag="div"
      class="space-y-3"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'rounded-xl px-5 py-4 shadow-xl flex items-start gap-4 border-l-4 bg-white transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl',
          toast.type === 'success' && 'border-emerald-500',
          toast.type === 'error' && 'border-red-500',
          toast.type === 'info' && 'border-blue-500',
          toast.type === 'warn' && 'border-amber-500'
        ]"
      >
        <!-- Icon with colored background -->
        <div
          :class="[
            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
            toast.type === 'success' && 'bg-emerald-500',
            toast.type === 'error' && 'bg-red-500',
            toast.type === 'info' && 'bg-blue-500',
            toast.type === 'warn' && 'bg-amber-500'
          ]"
        >
          <svg
            v-if="toast.type === 'success'"
            class="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <svg
            v-else-if="toast.type === 'error'"
            class="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg
            v-else-if="toast.type === 'info'"
            class="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg
            v-else-if="toast.type === 'warn'"
            class="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <!-- Title -->
          <div
            :class="[
              'font-bold text-base mb-0.5',
              toast.type === 'success' && 'text-emerald-700',
              toast.type === 'error' && 'text-red-700',
              toast.type === 'info' && 'text-blue-700',
              toast.type === 'warn' && 'text-amber-700'
            ]"
          >
            {{ toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : toast.type === 'info' ? 'Info' : 'Warning' }}
          </div>

          <!-- Message -->
          <div class="text-gray-600 text-sm leading-relaxed">
            {{ toast.message }}
          </div>
        </div>

        <!-- Close Button -->
        <button
          class="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-200 group -mr-1 -mt-1"
          @click="remove(toast.id)"
          aria-label="Close notification"
        >
          <svg
            class="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
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
.toast-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(50%) scale(0.95);
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
