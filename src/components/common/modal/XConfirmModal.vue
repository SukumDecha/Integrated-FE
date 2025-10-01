<template>
  <teleport to="body">
    <!-- Fade overlay -->
    <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      ></div>
    </transition>

    <!-- Scale modal -->
    <transition
      enter-active-class="transform transition duration-300 ease-out"
      enter-from-class="scale-95 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transform transition duration-200 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-95 opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 flex items-center justify-center z-50"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
        >
          <!-- Icon -->
          <div class="flex justify-center mb-4">
            <div
              class="bg-red-100 text-red-500 w-12 h-12 flex items-center justify-center rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          <!-- Title -->
          <h2 class="text-xl font-bold text-gray-800 mb-2">
            {{ title }}
          </h2>
          <p class="text-gray-600 mb-6 leading-relaxed">
            {{ message }}
          </p>

          <!-- Buttons -->
          <div class="flex justify-center gap-4">
            <XButton
              :label="cancelLabel"
              variant="outline"
              class-name="itbms-cancel-button px-6 py-2 rounded-lg"
              @click="emitCancel"
            />
            <XButton
              v-if="showConfirm"
              :label="confirmLabel"
              variant="primary"
              class-name="itbms-confirm-button px-6 py-2 rounded-lg"
              @click="emitConfirm"
            />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import XButton from '../XButton.vue'

defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    default: 'Are you sure?',
  },
  message: {
    type: String,
    default: 'Do you want to proceed with this action?',
  },
  confirmLabel: {
    type: String,
    default: 'Confirm',
  },
  cancelLabel: {
    type: String,
    default: 'Cancel',
  },
  showConfirm: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const emitCancel = () => {
  emit('update:modelValue', false)
}

const emitConfirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>
