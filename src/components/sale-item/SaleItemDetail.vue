<template>
  <div class="min-h-screen bg-gray-50 py-10 px-4 space-y-6">
    <div class="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">{{ modeTitle }}</h2>

        <XButton
          label="← Back"
          variant="outline"
          size="sm"
          className="itbms-back-button"
          @click="$router.back()"
        />
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

        <!-- Right: Form / Detail -->
        <div>
          <SaleItemForm
            v-if="mode !== 'detail'"
            :initial-data="product"
            :is-edit-mode="mode === 'edit'"
            :on-submit="onSubmit"
            @cancel="$emit('cancel')"
          />
          <template v-else>
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

              <div class="flex justify-end gap-4 mt-4">
                <XButton
                  label="Edit"
                  variant="outline"
                  className="itbms-edit-button"
                  @click="router.push(`/sale-items/${product.id}/edit`)"
                />
                <XButton
                  label="Delete"
                  variant="danger"
                  className="itbms-delete-button"
                  @click="showConfirm = true"
                />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <XConfirmModal
      v-model="showConfirm"
      title="Delete Confirmation"
      message="Do you want to delete this sale item?"
      @confirm="deleteProduct"
    />
    
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast.store'
import { SaleItemService } from '@/services'
import { formatPrice } from '@/utils/TextUtils'

import SaleItemForm from './SaleItemForm.vue'
import XButton from '@/components/common/XButton.vue'
import XConfirmModal from '@/components/common/XConfirmModal.vue'

defineEmits(['cancel'])

const props = defineProps({
  product: Object,
  mode: {
    type: String,
    default: 'detail',
  },
  onSubmit: Function,
})

const route = useRoute()
const router = useRouter()
const toast = useToastStore()
const showConfirm = ref(false)
const productId = route.params.id

const modeTitle = {
  add: 'Add New Sale Item',
  edit: 'Edit Sale Item',
  detail: 'Sale Item Detail',
}[props.mode]

const deleteProduct = async () => {
  showConfirm.value = false
  if (!productId) {
    toast.add({ message: 'Invalid product ID', type: 'error' })
    return
  }
  const res = await SaleItemService.deleteSaleItem(productId)
  if (res.error) {
    toast.add({ message: 'The requested sale item does not exist.', type: 'error' })
    router.push('/sale-items')
  } else {
    toast.add({ message: 'The sale item has been deleted.', type: 'success' })
    router.push('/sale-items')
  }
}
</script>

<style scoped lang="postcss">
.field {
  @apply flex justify-between items-center border-b py-2 text-gray-700;
}
.label {
  @apply font-medium text-gray-600;
}
</style>
