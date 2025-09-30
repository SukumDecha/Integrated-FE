<script setup>
import XButton from '@/components/common/XButton.vue'
import { useCartStore } from '@/stores/cart.store'

const cartStore = useCartStore()
</script>

<template>
  <div class="border rounded-lg p-4 space-y-4 shadow">
    <h1 class="font-semibold border-b pb-2">Cart Summary</h1>
    <p class="itbms-total-order-items">
      Total items : <span>{{ cartStore.selectedTotalItems }}</span>
    </p>
    <p class="itbms-total-order-price font-bold text-emerald-600 mt-2">
      Total price : <span>{{ cartStore.selectedTotalPrice.toLocaleString() }}</span> Baht
    </p>

    <XButton variant="primary" size="md" class="w-full itbms-place-order-button">
      Place Order
    </XButton>
  </div>
</template>
