<script setup>
import { RouterView } from 'vue-router'
import XToast from './components/common/XToast.vue';
</script>

<template>
  <main>
    <RouterView />
    <XToast />
  </main>
</template>

<style scoped></style>
