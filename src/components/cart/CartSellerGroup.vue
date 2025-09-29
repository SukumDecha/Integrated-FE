<script setup>
import CartItemRow from './CartItemRow.vue'
import { defineProps } from 'vue'
const props = defineProps({
  seller: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="border rounded-lg p-4 space-y-2 itbms-row">
    <!-- Seller -->
    <div class="flex items-center space-x-2 border-b pb-2">
      <input
        type="checkbox"
        class="itbms-select-nickname h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600 cursor-pointer"
      >
      <span class="font-semibold itbms-nickname">{{ props.seller }}</span>
    </div>

    <!-- สินค้าในกลุ่มนี้ -->
    <CartItemRow
      v-for="(item, index) in props.items"
      :key="index"
      :item="item"
    />
  </div>
</template>
