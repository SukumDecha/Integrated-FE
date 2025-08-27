<template>
  <teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
        <h2 class="text-lg font-bold mb-4">
          {{ title }}
        </h2>
        <p class="itbms-message mb-6">
          {{ message }}
        </p>
        <div class="flex justify-center gap-4">
          <XButton
            :label="cancelLabel"
            variant="outline"
            class-name="itbms-cancel-button"
            @click="emitCancel"
          />
          <XButton
            v-if="showConfirm"
            :label="confirmLabel"
            variant="primary"
            class-name="itbms-confirm-button"
            @click="emitConfirm"
          />
        </div>
      </div>
    </div>
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
