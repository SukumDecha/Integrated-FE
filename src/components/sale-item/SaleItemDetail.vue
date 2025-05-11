<template>
  <div class="min-h-screen flex flex-col">
    <XNavbar />

    <XLayout class="space-y-6">
      <XBreadcrumb :items="breadcrumbs" />

      <div class="p-6 bg-white rounded-xl shadow space-y-6 max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">
            {{ modeTitle }}
          </h2>
          <button
            @click="$router.back()"
            class="text-sm text-blue-600 underline itbms-back-button"
          >
            Back
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Left: Image -->
          <div>
            <div class="border rounded-lg overflow-hidden">
              <img
                :src="'/assets/sale-item/shopping.webp'"
                alt="product image"
                class="w-full object-contain"
              />
            </div>
            <div class="grid grid-cols-4 gap-2 mt-4">
              <img
                v-for="i in 4"
                :key="i"
                :src="'/assets/sale-item/shopping.webp'"
                alt="thumbnail"
                class="w-full h-auto border rounded-lg"
              />
            </div>
          </div>

          <!-- Right: Form/Detail -->
          <div>
            <SaleItemForm
              v-if="mode !== 'detail'"
              :initial-data="product"
              :is-edit-mode="mode === 'edit'"
              :on-submit="onSubmit"
              @cancel="$emit('cancel')"
            />
            <template v-else>
              <!-- Detail Mode: Read-only -->
              <div class="space-y-4 itbms-row">
                <div class="field">
                  <span class="label">Brand:</span>
                  <span class="itbms-brand">{{ product.brandName }}</span>
                </div>
                <div class="field">
                  <span class="label">Model:</span>
                  <span class="itbms-model">{{ product.model }}</span>
                </div>
                <div class="field">
                  <span class="label">Price:</span>
                  <span class="itbms-price">{{ formatPrice(product.price) }}</span>
                  <span class="itbms-price-unit">Baht</span>
                </div>
                <div class="field">
                  <span class="label">Description:</span>
                  <span class="itbms-description">{{ product.description }}</span>
                </div>
                <div class="field">
                  <span class="label">RAM:</span>
                  <span class="itbms-ramGb">{{ product.ramGb ?? '-' }}</span>
                  <span class="itbms-ramGb-unit">GB</span>
                </div>
                <div class="field">
                  <span class="label">Screen Size:</span>
                  <span class="itbms-screenSizeInch">{{ product.screenSizeInch ?? '-' }}</span>
                  <span class="itbms-screenSizeInch-unit">Inches</span>
                </div>
                <div class="field">
                  <span class="label">Storage:</span>
                  <span class="itbms-storageGb">{{ product.storageGb ?? '-' }}</span>
                  <span class="itbms-storageGb-unit">GB</span>
                </div>
                <div class="field">
                  <span class="label">Color:</span>
                  <span class="itbms-color">{{ product.color ?? '-' }}</span>
                </div>
                <div class="field">
                  <span class="label">Quantity:</span>
                  <span class="itbms-quantity">{{ product.quantity }}</span>
                  <span class="itbms-quantity-unit">units</span>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </XLayout>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import SaleItemForm from './SaleItemForm.vue'
import XNavbar from '@/components/layout/XNavbar.vue'
import XLayout from '@/components/layout/XLayout.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import { formatPrice } from '@/utils/TextUtils'
import { useRoute } from 'vue-router'

defineEmits(['cancel'])

const props = defineProps({
  product: Object,
  mode: {
    type: String,
    default: 'detail' // 'add' | 'edit' | 'detail'
  },
  onSubmit: Function
})

const route = useRoute()
const productId = route.params.id

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sale Items', path: '/sale-items' },
  { text: 'Detail', path: `/sale-items/${productId}` }
]

const modeTitle = {
  add: 'Add New Sale Item',
  edit: 'Edit Sale Item',
  detail: 'Sale Item Detail'
}[props.mode]
</script>

<style scoped lang="postcss">
.field {
  @apply flex justify-between items-center border-b py-2 text-gray-700;
}
.label {
  @apply font-medium text-gray-600;
}
</style>
