<script setup>
import { RouterView } from 'vue-router'
import XToast from './components/common/XToast.vue';
// import XSpin from './components/common/XSpin.vue';
</script>

<template>
  <main>
    <RouterView />
    <XToast />
    <!-- <XSpin /> -->
  </main>
</template>

<style scoped></style>
