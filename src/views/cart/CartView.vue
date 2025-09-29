<script setup>
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import CartSellerGroup from '@/components/cart/CartSellerGroup.vue'
import CartSummary from '@/components/cart/CartSummary.vue'
import { CartService } from '@/services'

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Cart', active: true },
]

const sellerGroups = CartService.getSellerGroups()



</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />

  <div class="max-w-6xl mx-auto py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Left: รายการสินค้า -->
    <div class="lg:col-span-2 space-y-4">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 -mt-5 flex items-center gap-2">
        <span>🛒</span> Shopping Cart
      </h1>

      <!-- Select All -->
      <div class="flex items-center space-x-2 mb-4">
        <input
          id="select-all"
          type="checkbox"
          class="itbms-select-all h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
        />
        <label
          for="select-all"
          class="itbms-select-all text-lg font-semibold text-gray-800 cursor-pointer tracking-wide"
        >
          Select All
        </label>
      </div>

      <!-- รายการกลุ่ม Seller -->

      <CartSellerGroup
        v-for="seller in sellerGroups"
        :key="seller.sellerNickname"
        :seller="seller.sellerNickname"
        :items="seller.items"
      />
    </div>

    <!-- Right: Summary -->
    <div class="mt-20">
      <CartSummary />
    </div>
  </div>
</template>
