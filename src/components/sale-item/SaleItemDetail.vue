<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast.store'
import { SaleItemService } from '@/services'
import { formatPrice, getImageUrl } from '@/utils'

import SaleItemForm from './SaleItemForm.vue'
import XButton from '@/components/common/XButton.vue'
import XConfirmModal from '@/components/common/modal/XConfirmModal.vue'
import { ArrowLeft } from 'lucide-vue-next'

import { useAuthStore } from '@/stores/auth.store'
import { useCartStore } from '@/stores/cart.store'
import { computed } from 'vue'

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

const handleAddToCart = () => {
  if (!authStore.isLoggedIn) {
    router.push('/signin')
    return
  }

  if (authStore.user?.role === 'BUYER') {
    cartStore.addItem({
      userid: authStore.userId,
      id: props.product.id,
      brand: props.product.brand,
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
}
const isMinusDisabled = computed(() => quantity.value <= 1)
const isPlusDisabled = computed(() => quantity.value >= (props.product?.quantity || 0))
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-5xl mx-auto">
      <!-- Header with back button -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">
          {{ modeTitle }}
        </h1>
        <XButton
          label="Back"
          variant="info"
          class-name="itbms-back-button flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700"
          @click="$router.back()"
        >
          <ArrowLeft class="h-4 w-4" />
          Back
        </XButton>
      </div>

      <!-- Main content card -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-0">
          <!-- Left: Image Gallery -->
          <div class="p-6 border-b md:border-b-0 md:border-r border-gray-100">
            <div
              class="aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center"
            >
              <img
                :src="
                  currentImage || getImageUrl(product.saleItemImages?.[0]?.imageUrl) || imageUrl
                "
                alt="Product image"
                class="w-full h-full object-contain"
              />
            </div>

            <!-- Thumbnails -->
            <div class="grid grid-cols-4 gap-3 mt-4">
              <div
                v-for="i in 4"
                :key="i"
                class="aspect-square bg-white border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
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

          <!-- ✅ Right: Product Details (ใส่ itbms-row ตรงนี้) -->
          <div class="p-6 itbms-row">
            <SaleItemForm
              v-if="mode !== 'detail'"
              :initial-data="product"
              :is-edit-mode="mode === 'edit'"
              :on-submit="onSubmit"
              @cancel="$emit('cancel')"
            />

            <div v-else class="space-y-6">
              <!-- Product title section -->
              <div class="space-y-1">
                <h2 class="text-2xl font-bold text-gray-800 itbms-model">
                  {{ product.model }}
                </h2>
                <p class="text-lg text-gray-600 itbms-brand">
                  {{ product.brandName }}
                </p>
              </div>

              <!-- Price section -->
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-baseline">
                  <span class="text-3xl font-bold text-gray-900 itbms-price">{{
                    formatPrice(product.price)
                  }}</span>
                  <span class="ml-2 text-gray-600 itbms-price-unit">Baht</span>
                </div>
                <div class="mt-2 flex items-center">
                  <span class="text-sm text-gray-500">
                    <span class="font-medium itbms-quantity">{{ product.quantity }}</span>
                    <span class="itbms-quantity-unit"> units available</span>
                  </span>
                </div>
              </div>

              <!-- Description -->
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p class="text-gray-700 itbms-description">
                  {{ product.description }}
                </p>
              </div>

              <!-- Specifications -->
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-3">Specifications</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  <div class="flex justify-between">
                    <span class="text-gray-500">RAM</span>
                    <span class="font-medium text-gray-800">
                      <span class="itbms-ramGb">{{ product.ramGb ?? '-' }}</span>
                      <span class="itbms-ramGb-unit"> GB</span>
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Screen Size</span>
                    <span class="font-medium text-gray-800">
                      <span class="itbms-screenSizeInch">{{ product.screenSizeInch ?? '-' }}</span>
                      <span class="itbms-screenSizeInch-unit"> Inches</span>
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Storage</span>
                    <span class="font-medium text-gray-800">
                      <span class="itbms-storageGb">{{ product.storageGb ?? '-' }}</span>
                      <span class="itbms-storageGb-unit"> GB</span>
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-500">Color</span>
                    <span class="font-medium text-gray-800 itbms-color">{{
                      product.color ?? '-'
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- SELLER -->
              <div
                v-if="authStore.user?.role === 'SELLER'"
                class="pt-4 border-t border-gray-100 flex gap-3 justify-end"
              >
                <XButton
                  label="Edit"
                  variant="outline"
                  class-name="itbms-edit-button"
                  @click="router.push(`/sale-items/${product.id}/edit`)"
                />
                <XButton
                  label="Delete"
                  variant="danger"
                  class-name="itbms-delete-button"
                  @click="showConfirm = true"
                />
              </div>

              <!-- ไม่ login -->
              <div v-else-if="!authStore.isLoggedIn" class="mt-4">
                <p class="text-gray-600 mb-5 -mt-2">
                  Seller: <span class="font-semibold">{{ product.seller.nickname }}</span>
                </p>
                <div class="flex items-center space-x-2">
                  <!-- ปุ่มลด -->
                  <XButton
                    variant="outline"
                    size="sm"
                    @click="decreaseQty"
                    :disabled="isMinusDisabled"
                    class="itbms-dec-qty-button"
                  >
                    -
                  </XButton>

                  <span class="px-4 itbms-add-to-cart-quantity">{{ quantity }}</span>

                  <!-- ปุ่มเพิ่ม -->
                  <XButton
                    variant="outline"
                    size="sm"
                    @click="increaseQty"
                    :disabled="isPlusDisabled"
                    class="itbms-inc-qty-button"
                  >
                    +
                  </XButton>

                  <!-- ปุ่ม Add to Cart -->
                  <XButton
                    variant="primary"
                    size="sm"
                    @click="handleAddToCart"
                    class="itbms-add-to-cart-button ml-5"
                  >
                    Add to Cart
                  </XButton>
                </div>
              </div>

              <!-- Buyer -->
              <div v-else-if="authStore.user?.role === 'BUYER'" class="mt-4">
                <!-- แสดงชื่อ Seller -->
                <p class="text-gray-600 mb-5 -mt-2">
                  Seller: <span class="font-semibold">{{ product.seller.nickname }}</span>
                </p>
                <div class="flex items-center space-x-2">
                  <!-- ปุ่มลด -->
                  <XButton
                    variant="outline"
                    size="sm"
                    @click="decreaseQty"
                    :disabled="isMinusDisabled"
                    class="itbms-dec-qty-button"
                  >
                    -
                  </XButton>

                  <span class="px-4 itbms-add-to-cart-quantity">{{ quantity }}</span>

                  <!-- ปุ่มเพิ่ม -->
                  <XButton
                    variant="outline"
                    size="sm"
                    @click="increaseQty"
                    :disabled="isPlusDisabled"
                    class="itbms-inc-qty-button"
                  >
                    +
                  </XButton>

                  <!-- ปุ่ม Add to Cart -->
                  <XButton
                    variant="primary"
                    size="sm"
                    @click="handleAddToCart"
                    class="itbms-add-to-cart-button ml-5"
                  >
                    Add to Cart
                  </XButton>
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
