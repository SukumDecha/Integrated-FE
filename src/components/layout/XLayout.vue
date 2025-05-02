<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl lg:max-w-7xl" :class="className">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  className: {
    type: String,
    default: '',
  },
})
</script>
