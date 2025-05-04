<script setup>
// import { ref } from 'vue'
import { displayOrDash, formatPrice } from '@/utils/TextUtils'
import { EyeIcon } from 'lucide-vue-next'

defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
  brand: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  ramGb: {
    type: Number,
    default: null,
  },
  storageGb: {
    type: Number,
    default: null,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  color: {
    type: String,
    default: 'emerald',
  },
  id: {
    type: Number,
    required: true,
  },
})
</script>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
</style>

<template>
  <div v-if="isLoading" class="itbms-row w-full bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="flex items justify-center w-full h-64 bg-gray-200 animate-pulse rounded-t-xl">
      <div class="w-1/2 h-full bg-gray-300 animate-pulse"></div>
    </div>
  </div>

  <div v-if="error" class="itbms-row w-full bg-white rounded-xl shadow-lg overflow-hidden">
    <div class="flex items justify-center w-full h-64 bg-red-200 rounded-t-xl">
      <p class="text-red-600 text-lg font-semibold">{{ error }}</p>
    </div>
  </div>

  <router-link
    :to="`/sale-items/${id}`"
    v-else
    class="itbms-row w-full bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow h-full flex flex-col"
  >
    <!-- Image Section -->
    <div class="relative w-full h-64 overflow-hidden">
      <img
        :src="imageUrl || '/assets/sale-item/shopping.webp'"
        :alt="`${brand} ${model} product image`"
        class="w-full h-full object-cover object-center rounded-t-xl"
      />
      <!-- Stock Badge -->
      <span
        class="absolute top-4 left-4 bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
      >
        In Stock
      </span>
    </div>

    <!-- Content Section -->
    <div class="p-4 flex flex-col justify-between flex-grow">
      <!-- Product Brand and Model -->
      <p class="itbms-brand text-gray-700 text-base line-clamp-1" :class="`text-${color}-600`">
        {{ brand }}
      </p>

      <p class="itbms-model text-xl font-semibold text-gray-900 tracking-tight line-clamp-1">
        {{ model }}
      </p>

      <!-- Product Specifications -->
      <div class="text-base text-gray-600 space-y-1">
        <p class="itbms-ramGb">
          <span class="mr-2">🧠</span>
          RAM: {{ displayOrDash(ramGb) }} <span class="itbms-ramGb-unit">GB</span>
        </p>
        <p class="itbms-storageGb">
          <span class="mr-2">💾</span>
          Storage: {{ displayOrDash(storageGb) }} <span class="itbms-storageGb-unit">GB</span>
        </p>
        <p class="mt-3 text-2xl font-bold text-emerald-600">
          <span class="itbms-price-unit"> Baht </span>
          <span class="itbms-price">
            {{ formatPrice(price) }}
          </span>
        </p>
      </div>

      <!-- Action Button -->
      <div class="mt-6">
        <router-link
          :to="`/sale-items/${id}`"
          class="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="flex items-center">
            <EyeIcon class="mr-2 h-5 w-5" />
            View Details
          </span>
        </router-link>
      </div>
    </div>
  </router-link>
</template>
