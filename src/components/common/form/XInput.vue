<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  class: { type: String, default: '' },
  label: {
    type: String,
    default: null,
    required: false
  },
  placeholder: {
    type: String,
    default: null,
    required: false
  },
  required: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  type: { type: String, default: 'text' }, // 'text' | 'number' | 'textarea' | 'password'
  step: [Number, String],
  rows: { type: Number, default: 3 },
  errorMessage: { type: String, default: '' },
  error: { type: String, default: '' },
  maxlength: { type: [String, Number], default: null },
})

const emit = defineEmits(['update:modelValue', 'input', 'blur', 'focus'])

const inputTag = computed(() => (props.type === 'textarea' ? 'textarea' : 'input'))
const touched = ref(false)
const focused = ref(false)

// Use either errorMessage or error prop
const currentError = computed(() => props.errorMessage || props.error)

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
  emit('input', e)
}

const onBlur = (e) => {
  touched.value = true
  focused.value = false
  emit('blur', e)
}

const onFocus = (e) => {
  focused.value = true
  emit('focus', e)
}

// Compute classes based on state
const inputClasses = computed(() => {
  const baseClasses = [
    'w-full rounded-md border px-3 py-2 text-sm transition-all duration-200',
    'focus:outline-none'
  ]

  if (props.disabled) {
    baseClasses.push(
      'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed',
      'placeholder-gray-300 shadow-none'
    )
  } else if (props.readonly) {
    baseClasses.push(
      'bg-gray-50 text-gray-500 border-gray-200 cursor-default',
      'placeholder-gray-300'
    )
  } else {
    // Normal state styling
    if (touched.value && currentError.value) {
      // Error state
      baseClasses.push(
        'bg-white text-gray-900 border-red-400 placeholder-gray-400',
        'hover:border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
      )
    } else if (focused.value) {
      // Focused state
      baseClasses.push(
        'bg-white text-gray-900 border-blue-500 placeholder-gray-400',
        'ring-1 ring-blue-500'
      )
    } else {
      // Default state
      baseClasses.push(
        'bg-white text-gray-900 border-gray-300 placeholder-gray-400',
        'hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
      )
    }
  }

  return baseClasses.concat(props.class.split(' ').filter(Boolean))
})

// Label classes
const labelClasses = computed(() => {
  const baseClasses = ['mb-1 text-sm font-medium']

  if (props.disabled) {
    baseClasses.push('text-gray-400')
  } else {
    baseClasses.push('text-gray-700')
  }

  return baseClasses
})
</script>

<template>
  <div class="flex flex-col">
    <label
      v-if="label"
      :class="labelClasses"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-red-500 ml-1"
      >*</span>
    </label>

    <component
      :is="inputTag"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :step="step"
      :rows="rows"
      :maxlength="maxlength"
      :class="inputClasses"
      v-bind="$attrs"
      @input="handleInput"
      @blur="onBlur"
      @focus="onFocus"
    />

    <p
      v-if="touched && currentError"
      class="mt-1 text-xs text-red-500 flex items-center"
    >
      <svg
        class="w-3 h-3 mr-1 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      {{ currentError }}
    </p>
  </div>
</template>

<style scoped>
input:disabled,
textarea:disabled {
  -webkit-text-fill-color: #00000040; /* Ensures consistent disabled text color across browsers */
}

input:disabled::placeholder,
textarea:disabled::placeholder {
  color: #00000025;
  opacity: 1;
}

/* Remove default browser styling for disabled inputs */
input:disabled,
textarea:disabled {
  opacity: 1;
}

.focus\:ring-1:focus {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.focus\:ring-red-500:focus {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}
</style>
