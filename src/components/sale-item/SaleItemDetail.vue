<template>
  <!-- Loading -->
  <div v-if="loading" class="text-center py-10">
    <p class="text-lg text-gray-500">Loading...</p>
  </div>

  <!-- Error -->
  <div v-if="error" class="text-center py-10">
    <p class="text-lg text-red-500">{{ error }}</p>
  </div>

  <!-- Product not found -->
  <div v-if="product" class="text-center py-10 bg-green-100">
    <p class="text-lg text-gray-500 itbms-message">The requested sale item does not exist.</p>
    <XButton
      class="mt-4 itbms-button"
      @click="$router.push({ name: 'sale-items-gallery' })"
      variant="primary"
      size="lg"
    >
      ok
    </XButton>
  </div>

  <!-- Product Detail Card -->
  <div v-else class="rounded-lg overflow-hidden">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Product Images -->
      <div>
        <!-- Main Image -->
        <div class="mb-4 border rounded-lg overflow-hidden">
          <img
            :src="product.image || 'https://placehold.co/600x600/e6e6e6/52525b?text=Product+Image'"
            :alt="product.model"
            class="w-full h-auto object-contain"
          />
        </div>

        <!-- Thumbnails -->
        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="i in 4"
            :key="i"
            class="border rounded-lg overflow-hidden cursor-pointer hover:border-emerald-500"
          >
            <img
              :src="product.image || 'https://placehold.co/150x150/e6e6e6/52525b?text=Thumbnail'"
              :alt="`${product.model} thumbnail ${i}`"
              class="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>

      <!-- Product Info -->

      <div class="space-y-4 itbms-row">
        <div class="grid grid-cols-3 items-center">
          <span class="text-gray-600">Brand :</span>
          <span class="col-span-2 font-medium itbms-brand">{{ product.brandName }}</span>
        </div>

        <div class="grid grid-cols-3 items-center">
          <span class="text-gray-600">Model :</span>
          <span class="col-span-2 font-medium itbms-model">{{ product.model }}</span>
        </div>

        <div class="grid grid-cols-3 items-center">
          <span class="text-gray-600">Price :</span>
          <span class="col-span-2 font-medium text-emerald-600 itbms-price">{{
            formatPrice(product.price)
          }}</span>
          <span class="text-gray-600 itbms-price-unit">Baht</span>
        </div>

        <div class="grid grid-cols-3 items-start">
          <span class="text-gray-600">Description:</span>
          <span class="col-span-2 itbms-description">{{ product.description }}</span>
        </div>

        <div class="grid grid-cols-3 items-center">
          <span class="text-gray-600">Ram :</span>
          <span class="col-span-2 itbms-ramGb">{{ displayOrDash(product.ramGb) }} </span>
          <span class="itbms-ramGb-unit">GB</span>
        </div>

        <div class="grid grid-cols-3 items-center">
          <span class="text-gray-600">Screen Size :</span>
          <span class="col-span-2 itbms-screenSizeInch"
            >{{ displayOrDash(product.screenSizeInch) }}
          </span>
          <span class="itbms-screenSizeInch-unit">inches</span>
        </div>

        <div class="grid grid-cols-3 items-center">
          <span class="text-gray-600">Storage :</span>
          <span class="col-span-2 itbms">{{ displayOrDash(product.storageGb) }} </span>
          <span class="itbms-storageGb-unit">GB</span>
        </div>

        <div class="grid grid-cols-3 items-center">
          <span class="text-gray-600">Color :</span>
          <span class="col-span-2 itbms-color">{{ displayOrDash(product.color) }}</span>
        </div>

        <div class="grid grid-cols-3 items-center">
          <span class="text-gray-600">Available quantity :</span>
          <span class="col-span-2 itbms-quantity">{{ product.quantity }}</span>
          <span class="itbms-quantity-unit">units</span>
        </div>

        <!-- Add to Cart Button -->
        <div class="pt-6">
          <XButton @click="addToCart" full-width>
            <ShoppingCart class="w-5 h-5 mr-2" />
            Add to Cart
          </XButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { formatPrice } from '@/utils/TextUtils'
import XButton from '@/components/common/XButton.vue'
import { displayOrDash } from '@/utils/TextUtils'

// Define the props to receive the product and loading/error states
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  error: {
    type: String,
    default: null,
  },
})

// Method to add the product to the cart (optional implementation)
const addToCart = () => {
  console.log('Adding product to cart:', props.product)
}
</script>
