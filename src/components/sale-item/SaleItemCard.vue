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
    default: null,
  },
  id: {
    type: Number,
    required: false,
    default: 0,
  },
  sellerNickname: {
    type: String,
    default: 'Unknown',
  },
  quantity: {
    type: Number,
    default: 0,
  },
  sellerId: {
    type: [Number, String],
    default: null,
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
    storageGb: props.storageGb,
    color: props.color,
    sellerId: props.sellerId,
    sellerNickname: props.sellerNickname || 'Unknown',
    quantity: 1,
    stock: props.quantity,
  })
}
</script>

<template>
  <!-- Loading Skeleton -->
  <div
    v-show="isLoading"
    class="w-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden h-full flex flex-col"
  >
    <div class="relative w-full h-64 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse overflow-hidden">
      <div class="w-full h-full bg-slate-300 animate-pulse" />
      <span class="absolute top-4 left-4 h-6 w-20 bg-slate-300 rounded-full animate-pulse" />
    </div>

    <div class="p-6 flex flex-col justify-between flex-grow space-y-4">
      <div class="space-y-3">
        <div class="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
        <div class="h-7 w-5/6 bg-slate-200 rounded animate-pulse" />
      </div>

      <div class="space-y-3 mt-4">
        <div class="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
        <div class="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
        <div class="h-4 w-4/5 bg-slate-200 rounded animate-pulse" />
        <div class="mt-4 h-8 w-1/2 bg-slate-200 rounded animate-pulse" />
      </div>

      <div class="mt-6 pt-4 border-t border-slate-200">
        <div class="h-12 w-full bg-slate-200 rounded-lg animate-pulse" />
      </div>
    </div>
  </div>

  <!-- Product Card -->
  <div
    v-show="!isLoading"
    class="itbms-row w-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-emerald-300 h-full flex flex-col group"
  >
    <router-link v-if="!isLoading && id" :to="`/sale-items/${id}`" class="flex flex-col flex-grow">
      <!-- Image Container -->
      <div class="relative w-full h-64 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
        <img
          :src="imageUrl || fallbackImageUrl"
          :alt="`${brand} ${model} product image`"
          class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
        />

        <!-- Stock Badge -->
        <span
          class="absolute top-4 left-4 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300"
          :class="quantity > 0
            ? 'bg-emerald-500/90 text-white border border-emerald-300'
            : 'bg-red-500/90 text-white border border-red-300'"
        >
          {{ quantity > 0 ? '✓ In Stock' : '✕ Out of Stock' }}
        </span>

        <!-- Hover Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <!-- Content Container -->
      <div class="p-6 flex flex-col justify-between flex-grow">
        <!-- Brand -->
        <div class="flex items-center gap-2 mb-2">
          <p class="itbms-brand text-emerald-600 text-sm font-semibold uppercase tracking-wide line-clamp-1">
            {{ brand }}
          </p>
        </div>

        <!-- Model -->
        <h3 class="itbms-model text-xl font-bold text-slate-900 tracking-tight line-clamp-2 mb-4 group-hover:text-emerald-600 transition-colors duration-300">
          {{ model }}
        </h3>

        <!-- Specifications -->
        <div class="space-y-2 mb-4">
          <!-- RAM -->
          <div class="flex items-center gap-2 text-sm text-slate-700">
            <div class="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-md">
              <span class="text-xs">🧠</span>
            </div>
            <span class="font-medium text-slate-600">RAM:</span>
            <span class="itbms-ramGb font-semibold text-slate-900">
              {{ displayOrDash(ramGb) }} <span v-if="ramGb" class="itbms-ramGb-unit text-slate-600">GB</span>
            </span>
          </div>

          <!-- Storage -->
          <div class="flex items-center gap-2 text-sm text-slate-700">
            <div class="flex items-center justify-center w-6 h-6 bg-purple-100 rounded-md">
              <span class="text-xs">💾</span>
            </div>
            <span class="font-medium text-slate-600">Storage:</span>
            <span class="itbms-storageGb font-semibold text-slate-900">
              {{ displayOrDash(storageGb) }} <span v-if="storageGb" class="itbms-storageGb-unit text-slate-600">GB</span>
            </span>
          </div>

          <!-- Color -->
          <div class="flex items-center gap-2 text-sm text-slate-700">
            <div class="flex items-center justify-center w-6 h-6 bg-pink-100 rounded-md">
              <span class="text-xs">🎨</span>
            </div>
            <span class="font-medium text-slate-600">Color:</span>
            <span class="itbms-color font-semibold text-slate-900 capitalize">
              {{ displayOrDash(color) }}
            </span>
          </div>
        </div>

        <!-- Price -->
        <div class="mt-auto pt-4 border-t border-slate-200">
          <div class="flex items-baseline gap-2">
            <span class="itbms-price-unit text-sm text-slate-500 font-medium">฿</span>
            <span class="itbms-price text-3xl font-bold text-emerald-600">
              {{ formatPrice(price) }}
            </span>
            <span class="text-sm text-slate-500 font-medium ml-1">Baht</span>
          </div>
        </div>
      </div>
    </router-link>

    <!-- Add to Cart Button -->
    <div class="p-6 pt-0">
      <XButton
        class="itbms-add-to-cart-button w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed"
        @click="handleAddToCart"
        :disabled="quantity <= 0"
      >
        <span class="flex items-center justify-center gap-2">
          <ShoppingCart class="h-5 w-5" />
          <span class="text-sm">{{ quantity > 0 ? 'ADD TO CART' : 'OUT OF STOCK' }}</span>
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

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
