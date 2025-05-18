<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SaleItemService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import SaleItemDetail from '@/components/sale-item/SaleItemDetail.vue'
import XNavbar from '@/components/layout/XNavbar.vue'
import XLayout from '@/components/layout/XLayout.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const product = ref(null)
const loading = ref(true)
const error = ref(null)
const productId = route.params.id

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sale Items', path: '/sale-items' },
  { text: `Detail #${productId}`, active: true },
]

const fetchProduct = async () => {
  loading.value = true
  const response = await SaleItemService.getSaleItemById(productId)
  if (response.error) {
    error.value = 'Failed to load product'
    toast.add({ message: 'The requested sale item does not exist.', type: 'error' })
    router.push('/sale-items')
  } else {
    product.value = response.data
  }
  loading.value = false
}

onMounted(fetchProduct)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <XNavbar />

    <XLayout class="space-y-6">
      <XBreadcrumb :items="breadcrumbs" />

      <div v-if="loading" class="text-center py-10 text-gray-500 text-lg">Loading...</div>
      <div v-else-if="error" class="text-center text-red-500">{{ error }}</div>
      <SaleItemDetail
        v-else
        :product="product"
        mode="detail"
      />
    </XLayout>
  </div>
</template>
