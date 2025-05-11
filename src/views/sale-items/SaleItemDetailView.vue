<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { SaleItemService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import SaleItemDetail from '@/components/sale-item/SaleItemDetail.vue'

const route = useRoute()
const toast = useToastStore()

const product = ref(null)
const loading = ref(true)
const error = ref(null)
const productId = route.params.id

const fetchProduct = async () => {
  loading.value = true
  const response = await SaleItemService.getSaleItemById(productId)
  if (response.error) {
    error.value = 'Failed to load product'
    toast.add({ message: error.value, type: 'error' })
  } else {
    product.value = response.data
  }
  loading.value = false
}

onMounted(fetchProduct)
</script>

<template>
  <SaleItemDetail
    v-if="product"
    :product="product"
    mode="detail"
  />
</template>
