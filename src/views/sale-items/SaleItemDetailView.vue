<template>
  <XNavbar :brand-name="storeName" :cart-count="cartCount" />

  <XLayout class="space-y-4">
    <XBreadcrumb :items="breadCrumbs" />

    <SaleItemDetail :product="product" :loading="loading" :error="error" />
  </XLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import SaleItemDetail from '@/components/sale-item/SaleItemDetail.vue'
import SaleItemService from '@/services/sale-item.service'
import XNavbar from '@/components/layout/XNavbar.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import XLayout from '@/components/layout/XLayout.vue'

const route = useRoute()
const productId = route.params.id

const product = ref({})
const loading = ref(true)
const error = ref(null)

const breadCrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sale Items', path: '/sale-items' },
  { text: 'Product Detail', path: `/sale-items/${productId}` },
]

const fetchProduct = async () => {
  loading.value = true
  error.value = null

  try {
    product.value = await SaleItemService.getSaleItemById(productId)
  } catch (err) {
    console.error('Error fetching product:', err)
    error.value = 'Failed to load product. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProduct()
})
</script>
