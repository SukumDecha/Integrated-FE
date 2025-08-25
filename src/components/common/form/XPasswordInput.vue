<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: String,
  label: { type: String, default: 'Password' },
  placeholder: {
    type: String,
    default: 'At least 8 characters, include A-Z, a-z, 0-9, and special characters',
  },
  required: { type: Boolean, default: true },
  errorMessage: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  class: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const touched = ref(false)
const handleInput = (e) => emit('update:modelValue', e.target.value)
const onBlur = () => (touched.value = true)

const passwordRules = computed(() => {
  const value = props.modelValue || ''
  return {
    length: value.length >= 8,
    lowercase: /[a-z]/.test(value),
    uppercase: /[A-Z]/.test(value),
    number: /\d/.test(value),
    special: /[@$!%*?&.]/.test(value),
  }
})

const isPasswordValid = computed(() => Object.values(passwordRules.value).every(Boolean))
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input -->
    <input
      type="password"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full px-4 py-3 rounded-lg text-gray-700 border transition-all duration-200 focus:outline-none"
      :class="[
        // กรณีผิดพลาด → border แดง
        touched && !isPasswordValid
          ? 'border-red-500 focus:ring-red-300 focus:border-red-500'
          // กรอกครบถูกต้อง → border ดำ
          : modelValue && isPasswordValid
            ? 'border-gray-900 focus:ring-green-300 focus:border-gray-900'
            // ปกติ → border ดำ
            : 'border-gray-900 focus:ring-green-300 focus:border-gray-900',
        props.class,
      ]"
      @input="handleInput"
      @blur="onBlur"
    />

    <!-- Checklist -->
    <div class="mt-3 space-y-1">
      <p
        v-for="(valid, rule) in passwordRules"
        :key="rule"
        class="flex items-center text-sm"
        :class="[
          // ถ้ากรอกครบ rule → สีเขียว
          valid
            ? 'text-green-600'
            // ถ้า touched หรือ submit แล้วผิด → สีแดง
            : touched
              ? 'text-red-500'
              // ตอนเปิดหน้า → สีเทา
              : 'text-gray-500'
        ]"
      >
        <span class="mr-2">
          <svg
            v-if="valid"
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
        <span>
          {{
            rule === 'length'
              ? 'Min. 8 characters'
              : rule === 'lowercase'
                ? 'At least 1 lowercase'
                : rule === 'uppercase'
                  ? 'At least 1 uppercase'
                  : rule === 'number'
                    ? 'At least 1 number'
                    : 'At least 1 special character'
          }}
        </span>
      </p>
    </div>

    <!-- Error Message -->
    <p v-if="touched && !isPasswordValid && !modelValue" class="text-sm text-red-500 mt-1">
      {{ errorMessage || 'Password is required.' }}
    </p>
  </div>
</template>

<style scoped>
@media (max-width: 640px) {
  input {
    padding: 0.6rem 0.8rem;
    font-size: 0.95rem;
  }
}
</style>
