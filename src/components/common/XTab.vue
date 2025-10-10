<script setup>
defineProps({
  tabs: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex items-center gap-3 border-b border-gray-200">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      @click="$emit('update:modelValue', tab.value)"
      class="relative py-2 px-4 text-sm font-medium rounded-t-md transition-all duration-200"
      :class="[
        tab.value === modelValue
          ? 'text-green-700 border-b-2 border-green-600 font-semibold'
          : 'text-gray-500 hover:text-green-700'
      ]"
    >
      {{ tab.label }}
    </button>
  </div>
</template>
