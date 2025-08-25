<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <!-- ใช้ flex ครอบทั้งหน้า -->
  <div class="relative min-h-screen flex items-center justify-center bg-white">
    <!-- พื้นหลังฝั่งซ้าย -->
    <div
      class="absolute top-0 left-0 w-full md:w-[40%] h-[180px] md:h-full bg-green-custom"
    ></div>

    <!-- กล่องฟอร์ม -->
    <div
      class="relative w-full max-w-4xl bg-white shadow-2xl p-6 sm:p-8 overflow-y-auto transition-shadow duration-300"
      style="max-height: calc(100vh - 40px);"
    >
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.bg-green-custom {
  background-color: rgba(1, 100, 64, 1);
}

html,
body,
#app {
  height: 100%;
}
</style>
