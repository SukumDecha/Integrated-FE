<template>
  <div class="min-h-[100dvh] flex flex-col relative mt-auto">
    <XNavbar />

    <div
      class="container mx-auto px-4 py-8 max-w-2xl lg:max-w-7xl space-y-6 h-full flex-grow"
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
