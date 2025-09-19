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
  errorMessage: { type: String, default: '' },
  maxlength: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue'])

const inputTag = computed(() => (props.type === 'textarea' ? 'textarea' : 'input'))
const touched = ref(false)

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
}

const onBlur = () => {
  touched.value = true
}
</script>

<template>
  <div class="flex flex-col">
    <label
      v-if="label"
      class="mb-1 text-sm font-medium text-gray-700"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-red-500"
      >*</span>
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
        'w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-800',
        'placeholder-gray-400 transition-colors duration-200',
        'focus:outline-none focus:ring-1',
        touched && errorMessage
          ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
          : 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500',
        disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : '',
        props.class
      ]"
      v-bind="$attrs"
      v-on="$attrs"
      @input="handleInput"
      @blur="onBlur"
    />

    <p
      v-if="touched && errorMessage"
      class="mt-1 text-xs text-red-500"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>
