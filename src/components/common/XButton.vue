<template>
  <button
    :type="type"
    :class="[
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500',
      sizeClasses,
      variantClasses,
      fullWidth ? 'w-full' : '',
      disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
      className,
    ]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="mr-2">
      <Loader2 class="animate-spin" :class="iconSizeClasses" />
    </span>
    <span v-else-if="leftIcon" class="mr-2">
      <component :is="leftIcon" :class="iconSizeClasses" />
    </span>

    <slot>{{ label }}</slot>

    <span v-if="rightIcon && !loading" class="ml-2">
      <component :is="rightIcon" :class="iconSizeClasses" />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps({
  // Button content
  label: {
    type: String,
    default: 'Button',
  },

  // Button type
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },

  // Button variants
  variant: {
    type: String,
    default: 'primary',
    validator: (value) =>
      ['primary', 'secondary', 'outline', 'ghost', 'link', 'danger', 'info'].includes(value),
  },

  // Button sizes
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
  },

  // Button states
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },

  // Button styling
  fullWidth: {
    type: Boolean,
    default: false,
  },
  className: {
    type: String,
    default: '',
  },

  // Button icons
  leftIcon: {
    type: [Object, null],
    default: null,
  },
  rightIcon: {
    type: [Object, null],
    default: null,
  },
})

defineEmits(['click'])

// Size classes
const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'px-2.5 py-1 text-xs'
    case 'sm':
      return 'px-3 py-1.5 text-sm'
    case 'lg':
      return 'px-5 py-3 text-base'
    case 'xl':
      return 'px-6 py-4 text-lg'
    default: // md
      return 'px-4 py-2 text-sm'
  }
})

// Icon size classes
const iconSizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'h-3 w-3'
    case 'sm':
      return 'h-3.5 w-3.5'
    case 'lg':
      return 'h-5 w-5'
    case 'xl':
      return 'h-6 w-6'
    default: // md
      return 'h-4 w-4'
  }
})

// Variant classes
const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
    case 'secondary':
      return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
    case 'outline':
      return 'bg-transparent border border-emerald-600 text-emerald-600 hover:bg-emerald-50'
    case 'ghost':
      return 'bg-transparent text-emerald-600 hover:bg-emerald-50'
    case 'link':
      return 'bg-transparent text-emerald-600 hover:underline shadow-none px-0 py-0'
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
    case 'info':
      return 'bg-white border border-gray-300 rounded-lg hover:bg-gray-200'
    default:
      return 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
  }
})
</script>
