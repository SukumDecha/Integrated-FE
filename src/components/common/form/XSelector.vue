<template>
  <label v-if="label" class="form-label">
    {{ label }}
    <span v-if="required" class="text-red-500">*</span>
  </label>

  <select
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
    :disabled="disabled"
    :class="inputClass"
  >
    <option disabled value="">{{ placeholder || 'Select an option' }}</option>
    <option v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  class: {
    type: String,
    default: '',
  },
  label: String,
  placeholder: String,
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue'])

const inputClass = computed(() => `input ${props.class}`)
</script>

<style scoped>
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #6b7280;
  border-radius: 0.5rem;
  color: #374151;
  transition: all 0.2s;
}
.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.5);
}
.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
}
</style>
