<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  class: { type: String, default: '' },
  label: String,
  placeholder: String,
  required: Boolean,
  disabled: Boolean,
  type: { type: String, default: 'text' }, // 'text' | 'number' | 'textarea'
  step: [Number, String],
  rows: { type: Number, default: 3 },
  errorMessage: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const inputTag = computed(() => (props.type === 'textarea' ? 'textarea' : 'input'))

const touched = ref(false)

const handleInput = (e) => {
  const raw = e.target.value
  emit('update:modelValue', props.type === 'number' ? +raw || null : raw)
}

const onBlur = () => {
  touched.value = true
}
</script>

<template>
  <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
    {{ label }}
    <span v-if="required" class="text-red-500">*</span>
  </label>

  <component
    :is="inputTag"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :step="step"
    :rows="rows"
    :class="[
      'w-full px-4 py-3 rounded-lg text-gray-800 border transition-all duration-200',
      touched && errorMessage
        ? 'border-red-500 focus:ring-red-300 focus:border-red-500'
        : 'border-gray-400 focus:ring-blue-300 focus:border-blue-500',
      disabled ? 'bg-gray-100 cursor-not-allowed' : '',
      props.class
    ]"
    v-bind="$attrs"
    @input="handleInput"
    @blur="onBlur"
  />

  <p v-if="touched && errorMessage" class="text-sm text-red-500 mt-1">
    {{ errorMessage }}
  </p>
</template>
