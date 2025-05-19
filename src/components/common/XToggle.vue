<template>
  <input 
    type="checkbox" 
    class="toggle appearance-none w-11 h-6 bg-gray-300 rounded-full relative cursor-pointer transition-all duration-300 ease-in-out checked:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
    :checked="modelValue"
    :disabled="disabled"
    @change="$emit('update:modelValue', $event.target.checked)"
    v-bind="$attrs"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.toggle {
  position: relative;
}

.toggle:before {
  content: "";
  position: absolute;
  top: 0.25rem;
  left: 0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease-in-out;
}

.toggle:checked:before {
  transform: translateX(1.25rem);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>