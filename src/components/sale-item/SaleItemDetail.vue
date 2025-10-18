<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast.store'
import { SaleItemService } from '@/services'
import { formatPrice, getImageUrl } from '@/utils'

import SaleItemForm from './SaleItemForm.vue'
import XButton from '@/components/common/XButton.vue'
import XConfirmModal from '@/components/common/modal/XConfirmModal.vue'
import { ArrowLeft, ShoppingCart, Package, User } from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { computed } from 'vue'
import { CART_TOAST_MESSAGES } from '@/constants/cart.constant'

const imageUrl = new URL('/assets/fallback-image.jpg', import.meta.url).pathname

defineEmits(['cancel'])

const props = defineProps({
  product: {
    type: Object,
    default: () => ({}),
  },
  mode: {
    type: String,
    default: 'detail',
  },
  onSubmit: {
    type: Function,
    default: () => {},
  },
})

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const currentImage = ref(null)
const showConfirm = ref(false)
const productId = route.params.id

const modeTitle = {
  add: 'Add New Sale Item',
  edit: 'Edit Sale Item',
  detail: 'Sale Item Detail',
}[props.mode]

const selectCurrentImage = (image) => {
  currentImage.value = image
}

const deleteProduct = async () => {
  showConfirm.value = false
  if (!productId) {
    toast.add({ message: 'Invalid product ID', type: 'error' })
    return
  }
  const res = await SaleItemService.deleteSaleItem(productId)
  if (res.error) {
    toast.add({
      message: 'The requested sale item does not exist.',
      type: 'error',
    })
    router.push('/sale-items')
  } else {
    toast.add({
      message: 'The sale item has been deleted.',
      type: 'success',
    })
    router.push('/sale-items')
  }
}

const authStore = useAuthStore()
const cartStore = useCartStore()
const quantity = ref(1)

const increaseQty = () => {
  if (quantity.value < (props.product?.quantity || 0)) {
    quantity.value++
  }
}

const decreaseQty = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const isOwner = computed(() => {
  return authStore.user?.role === 'SELLER' && authStore.user?.id === props.product?.seller?.id
})

const handleAddToCart = () => {
  const isOwner = authStore.user?.id === props.product?.seller?.id

  if (isOwner) {
    toast.add({
      type: 'error',
      message: CART_TOAST_MESSAGES.OWNER_ERROR,
    })
    return
  }

  if (!authStore.isLoggedIn) {
    router.push('/signin')
    return
  }

  cartStore.addItem({
    userid: authStore.userId,
    id: props.product.id,
    brand: props.product.brandName,
    model: props.product.model,
    price: props.product.price,
    imageUrl: props.product.imageUrl,
    sellerNickname: props.product.seller?.nickname || 'Unknown',
    quantity: quantity.value,
    stock: props.product.quantity,
    storageGb: props.product.storageGb,
    color: props.product.color,
    sellerId: props.product.seller?.id,
  })
}

const isMinusDisabled = computed(() => quantity.value <= 1)
const isPlusDisabled = computed(() => quantity.value >= (props.product?.quantity || 0))
const isOutOfStock = computed(() => props.product?.quantity <= 0)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br py-8 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header with back button -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 mb-1">
            {{ modeTitle }}
          </h1>
          <p class="text-slate-600 text-sm">View detailed product information</p>
        </div>
        <XButton
          label="Back"
          variant="info"
          class-name="itbms-back-button flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-all duration-200"
          @click="$router.back()"
        >
          <ArrowLeft class="h-4 w-4" />
          Back
        </XButton>
      </div>

      <!-- Main content card -->
      <div class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <!-- Left: Image Gallery -->
          <div class="p-8 bg-gradient-to-br from-slate-50 to-white border-b lg:border-b-0 lg:border-r border-slate-200">
            <div class="aspect-square bg-white rounded-2xl overflow-hidden flex items-center justify-center shadow-lg border border-slate-200 group">
              <img
                :src="
                  currentImage || getImageUrl(product.saleItemImages?.[0]?.imageUrl) || imageUrl
                "
                alt="Product image"
                class="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <!-- Thumbnails -->
            <div class="grid grid-cols-4 gap-3 mt-6">
              <div
                v-for="i in 4"
                :key="i"
                class="aspect-square bg-white border-2 border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500 hover:shadow-md transition-all duration-200"
                :class="currentImage === getImageUrl(product.saleItemImages?.[i - 1]?.imageUrl) ? 'border-emerald-500 ring-2 ring-emerald-200' : ''"
              >
                <img
                  :src="getImageUrl(product.saleItemImages?.[i - 1]?.imageUrl) || imageUrl"
                  alt="Thumbnail"
                  class="w-full h-full object-cover"
                  @click="
                    selectCurrentImage(
                      getImageUrl(product.saleItemImages[i - 1]?.imageUrl) || imageUrl,
                    )
                  "
                />
              </div>
            </div>
          </div>

          <!-- Right: Product Details -->
          <div class="p-8 itbms-row">
            <SaleItemForm
              v-if="mode !== 'detail'"
              :initial-data="product"
              :is-edit-mode="mode === 'edit'"
              :on-submit="onSubmit"
              @cancel="$emit('cancel')"
            />

            <div v-else class="space-y-6">
              <!-- Product title section -->
              <div class="space-y-2 pb-6 border-b border-slate-200">
                <!-- Brand Badge -->
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-emerald-600 text-sm font-bold uppercase tracking-wide itbms-brand">
                    {{ product.brandName }}
                  </span>
                </div>

                <h2 class="text-3xl font-bold text-slate-900 itbms-model leading-tight">
                  {{ product.model }}
                </h2>
              </div>

              <!-- Price section -->
              <div class="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200 shadow-sm">
                <div class="flex items-baseline gap-2">
                  <span class="text-sm text-emerald-700 font-medium itbms-price-unit">฿</span>
                  <span class="text-4xl font-bold text-emerald-600 itbms-price">{{
                    formatPrice(product.price)
                  }}</span>
                  <span class="text-emerald-700 font-medium ml-1">Baht</span>
                </div>

                <!-- Stock display -->
                <div class="mt-4 flex items-center gap-2">
                  <Package class="h-5 w-5 text-emerald-600" />
                  <span v-if="product.quantity > 0" class="text-sm text-slate-700 font-medium">
                    <span class="font-bold text-emerald-600 itbms-quantity">{{ product.quantity }}</span>
                    <span class="itbms-quantity-unit"> units in stock</span>
                  </span>
                  <span v-else class="text-sm text-red-600 font-bold itbms-outofstock">
                    Out of Stock
                  </span>
                </div>
              </div>

              <!-- Description -->
              <div class="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h3 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Description
                </h3>
                <p class="text-slate-700 leading-relaxed itbms-description">
                  {{ product.description }}
                </p>
              </div>

              <!-- Specifications -->
              <div>
                <h3 class="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  Technical Specifications
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
                    <span class="text-slate-600 font-medium">RAM</span>
                    <span class="font-bold text-slate-900">
                      <span class="itbms-ramGb">{{ product.ramGb ?? '-' }}</span>
                      <span class="itbms-ramGb-unit text-slate-600"> GB</span>
                    </span>
                  </div>
                  <div class="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
                    <span class="text-slate-600 font-medium">Screen Size</span>
                    <span class="font-bold text-slate-900">
                      <span class="itbms-screenSizeInch">{{ product.screenSizeInch ?? '-' }}</span>
                      <span class="itbms-screenSizeInch-unit text-slate-600"> inch</span>
                    </span>
                  </div>
                  <div class="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
                    <span class="text-slate-600 font-medium">Storage</span>
                    <span class="font-bold text-slate-900">
                      <span class="itbms-storageGb">{{ product.storageGb ?? '-' }}</span>
                      <span class="itbms-storageGb-unit text-slate-600"> GB</span>
                    </span>
                  </div>
                  <div class="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
                    <span class="text-slate-600 font-medium">Color</span>
                    <span class="font-bold text-slate-900 itbms-color capitalize">{{
                      product.color ?? '-'
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- Seller Info -->
              <div class="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                    <User class="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p class="text-xs text-slate-600 font-medium uppercase tracking-wide">Sold by</p>
                    <p class="text-lg font-bold text-slate-900">{{ product.seller?.nickname || 'Unknown' }}</p>
                  </div>
                </div>
              </div>

              <!-- Owner Actions (Edit/Delete) -->
              <div v-if="isOwner" class="pt-6 border-t border-slate-200">
                <div class="flex gap-3">
                  <XButton
                    label="Edit Product"
                    variant="outline"
                    class-name="itbms-edit-button flex-1 bg-white hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-600 transition-all duration-200"
                    @click="router.push(`/sale-items/${product.id}/edit`)"
                  />
                  <XButton
                    label="Delete Product"
                    variant="danger"
                    class-name="itbms-delete-button flex-1 hover:shadow-lg transition-all duration-200"
                    @click="showConfirm = true"
                  />
                </div>
              </div>

              <!-- Buyer Actions (Quantity + Add to Cart) -->
              <div v-else class="pt-6 border-t border-slate-200">
                <div class="bg-white rounded-xl border-2 border-emerald-200 p-6 shadow-sm">
                  <h4 class="text-sm font-bold text-slate-800 mb-4">Select Quantity</h4>

                  <div class="flex items-center gap-4 mb-6">
                    <!-- Quantity Controls -->
                    <div class="flex items-center gap-3 bg-slate-50 rounded-lg p-2 border border-slate-200">
                      <XButton
                        variant="outline"
                        size="sm"
                        @click="decreaseQty"
                        :disabled="isMinusDisabled"
                        class="itbms-dec-qty-button w-10 h-10 flex items-center justify-center font-bold text-lg hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-600 transition-all duration-200"
                      >
                        −
                      </XButton>

                      <span class="itbms-add-to-cart-quantity text-2xl font-bold text-slate-900 min-w-[3rem] text-center">{{ quantity }}</span>

                      <XButton
                        variant="outline"
                        size="sm"
                        @click="increaseQty"
                        :disabled="isPlusDisabled"
                        class="itbms-inc-qty-button w-10 h-10 flex items-center justify-center font-bold text-lg hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-600 transition-all duration-200"
                      >
                        +
                      </XButton>
                    </div>

                    <!-- Add to Cart Button -->
                    <XButton
                      variant="primary"
                      size="md"
                      @click="handleAddToCart"
                      :disabled="isOutOfStock"
                      class="itbms-add-to-cart-button flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:from-slate-300 disabled:to-slate-400"
                    >
                      <span class="flex items-center justify-center gap-2">
                        <ShoppingCart class="h-5 w-5" />
                        {{ isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART' }}
                      </span>
                    </XButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <XConfirmModal
      v-model="showConfirm"
      title="Delete Confirmation"
      message="Do you want to delete this sale item?"
      @confirm="deleteProduct"
    />
  </div>
</template>
