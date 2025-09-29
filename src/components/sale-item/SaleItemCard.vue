<script setup>
import { useRouter } from 'vue-router'
import XButton from '@/components/common/XButton.vue'
import { displayOrDash, formatPrice } from '@/utils/TextUtils'
import { ShoppingCart } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'

const fallbackImageUrl = new URL('/assets/sale-item/shopping.webp', import.meta.url).pathname

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  brand: {
    type: String,
    default: '',
  },
  model: {
    type: String,
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
    required: false,
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

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const handleAddToCart = () => {
  if (!authStore.isLoggedIn) {
    router.push('/signin')
    return
  }

  cartStore.addItem({
    userid: authStore.userId,
    id: props.id,
    brand: props.brand,
    model: props.model,
    price: props.price,
    imageUrl: props.imageUrl,
    quantity: 1,
  })
}
</script>

<template>
  <div
    v-show="isLoading"
    class="w-full bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col"
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
    class="itbms-row w-full bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow h-full flex flex-col"
  >
    <router-link v-if="!isLoading && id" :to="`/sale-items/${id}`">
      <div class="relative w-full h-64 overflow-hidden">
        <img
          :src="imageUrl || fallbackImageUrl"
          :alt="`${brand} ${model} product image`"
          class="w-full h-full object-cover object-center rounded-t-xl"
        />
        <span
          class="absolute top-4 left-4 bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full"
        >
          In Stock
        </span>
      </div>

      <div class="p-4 flex flex-col justify-between flex-grow">
        <p class="itbms-brand text-gray-700 text-base line-clamp-1" :class="`text-${color}-600`">
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
      </div>
    </router-link>

    <div class="p-5 flex justify-center -mt-5">
      <XButton class="itbms-add-to-cart-button" @click="handleAddToCart">
        <span class="flex items-center">
          <ShoppingCart class="mr-2 h-5 w-5" />
          ADD TO CART
        </span>
      </XButton>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
</style>
