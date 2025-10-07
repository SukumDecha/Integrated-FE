<script setup>
import XButton from '@/components/common/XButton.vue'
import XInput from '@/components/common/form/XInput.vue'
import { useCartStore } from '@/stores/cart.store'

const cartStore = useCartStore()
</script>

<template>
  <div class="border rounded-lg p-4 space-y-4 shadow">
    <h1 class="font-semibold border-b pb-2">Cart Summary</h1>
    <h3 class="font-semibold">Ship To</h3>
    <!-- Shipping Address -->
    <XInput
      v-model="cartStore.shippingAddress"
      label="Address"
      type="textarea"
      placeholder="Address (No, Street, Subdistrict, District, Province, Postal Code)"
      :class="itbms - shipping - address"
      required
      rows="3"
    />
    <!-- Order Note -->
    <XInput
      v-model="cartStore.orderNote"
      label="Note"
      type="textarea"
      placeholder="Additional instructions or requests"
      :class="itbms - order - note"
      rows="2"
    />

    <div class="border-t pt-5 mt-5">
      <p class="itbms-total-order-items">
        Total items : <span>{{ cartStore.selectedTotalItems }}</span>
      </p>
      <p class="itbms-total-order-price font-bold text-emerald-600 mt-2">
        Total price : <span>{{ cartStore.selectedTotalPrice.toLocaleString() }}</span> Baht
      </p>
    </div>

    <XButton variant="primary" size="md" class="w-full itbms-place-order-button">
      Place Order
    </XButton>
  </div>
</template>
