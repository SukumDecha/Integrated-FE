<script setup>
import XButton from '@/components/common/XButton.vue'
import { displayOrDash, formatPrice } from '@/utils/TextUtils';
import { EyeIcon } from 'lucide-vue-next'

const fallbackImageUrl = new URL('/assets/sale-item/shopping.webp', import.meta.url).pathname

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
    required: false, // Changed to false as it won't be present during loading
    default: '',
  },
  model: {
    type: String,
    required: false, // Changed to false
    default: '',
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
    required: false, // Changed to false
    default: 0,
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
    required: false, // Changed to false
    default: 0,
  },
})
</script>

<template>
  <div
    v-if="isLoading"
    class="itbms-row w-full bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col"
  >
    <div class="relative w-full h-64 bg-gray-200 animate-pulse overflow-hidden rounded-t-xl">
      <div class="w-full h-full bg-gray-300 animate-pulse" />
      <span class="absolute top-4 left-4 h-5 w-16 bg-gray-300 rounded-full animate-pulse" />
    </div>

    <div class="p-4 flex flex-col justify-between flex-grow">
      <p class="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-2" />
      <p class="h-6 w-5/6 bg-gray-200 rounded animate-pulse mb-4" />

      <div class="space-y-2">
        <p class="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
        <p class="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
        <p class="mt-3 h-8 w-1/2 bg-gray-200 rounded animate-pulse" />
      </div>

      <div class="mt-6">
        <div class="h-10 w-full bg-gray-200 rounded-md animate-pulse" />
      </div>
    </div>
  </div>

  <div
    v-else-if="error"
    class="itbms-row w-full bg-white rounded-xl shadow-lg overflow-hidden"
  >
    <div class="flex items-center justify-center w-full h-64 bg-red-100 rounded-t-xl">
      <p class="text-red-600 text-lg font-semibold">
        {{ error }}
      </p>
    </div>
  </div>

  <router-link
    v-else
    :to="`/sale-items/${id}`"
    class="itbms-row w-full bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow h-full flex flex-col"
  >
    <div class="relative w-full h-64 overflow-hidden">
      <img
        :src="imageUrl || fallbackImageUrl"
        :alt="`${brand} ${model} product image`"
        class="w-full h-full object-cover object-center rounded-t-xl"
      >
      <span
        class="absolute top-4 left-4 bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
      >
        In Stock
      </span>
    </div>

    <div class="p-4 flex flex-col justify-between flex-grow">
      <p
        class="itbms-brand text-gray-700 text-base line-clamp-1"
        :class="`text-${color}-600`"
      >
        {{ brand }}
      </p>

      <p class="itbms-model text-xl font-semibold text-gray-900 tracking-tight line-clamp-1">
        {{ model }}
      </p>

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

      <div class="mt-6">
        <router-link
          :to="`/sale-items/${id}`"
        >
          <XButton>
            <span class="flex items-center">
              <EyeIcon class="mr-2 h-5 w-5" />
              View Details
            </span>
          </XButton>
        </router-link>
      </div>
    </div>
  </router-link>
</template>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
</style>
