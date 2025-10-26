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
          toast.type === 'warn' && 'border-amber-500',
        ]"
      >
        <!-- Icon with colored background -->
        <div
          :class="[
            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
            toast.type === 'success' && 'bg-emerald-500',
            toast.type === 'error' && 'bg-red-500',
            toast.type === 'info' && 'bg-blue-500',
            toast.type === 'warn' && 'bg-amber-500',
          ]"
        >
          <template v-if="toast.type === 'success'">
            <Check class="w-6 h-6 text-white" />
          </template>
          <template v-else-if="toast.type === 'info'">
            <Info class="w-6 h-6 text-white" />
          </template>
          <template v-else-if="toast.type === 'error'">
            <XCircle class="w-6 h-6 text-white" />
          </template>
          <template v-else-if="toast.type === 'warn'">
            <CircleAlert class="w-6 h-6 text-white" />
          </template>
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
              toast.type === 'warn' && 'text-amber-700',
            ]"
          >
            {{
              toast.type === 'success'
                ? 'Success'
                : toast.type === 'error'
                  ? 'Error'
                  : toast.type === 'info'
                    ? 'Info'
                    : 'Warning'
            }}
          </div>

          <!-- Message -->
          <div class="text-gray-600 text-sm leading-relaxed">
            {{ toast.message }}
          </div>
        </div>

        <!-- Close Button -->
        <button
          class="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-200 group -mr-1 -mt-1"
          aria-label="Close notification"
          @click="remove(toast.id)"
        >
          <X class="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useToastStore } from '@/stores/toast.store'
import { Check, Info, XCircle, CircleAlert, X } from 'lucide-vue-next'

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
