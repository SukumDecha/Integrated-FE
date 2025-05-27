<template>
  <div class="min-h-screen flex flex-col">
    <XNavbar />
    <div
      class="container mx-auto px-4 py-8 max-w-2xl lg:max-w-7xl space-y-6"
      :class="className"
    >
      <router-view />
    </div>
    <XFooter />
  </div>
</template>

<script setup>
  import XNavbar from '@/components/layout/XNavbar.vue'
  import XFooter from '@/components/layout/XFooter.vue'

  defineProps({
    className: {
      type: String,
      default: '',
    },
  })
</script>
