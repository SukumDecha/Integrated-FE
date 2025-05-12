<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SaleItemService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import SaleItemDetail from '@/components/sale-item/SaleItemDetail.vue'

const route = useRoute()
const toast = useToastStore()
const router = useRouter()

const product = ref(null)
const loading = ref(true)
const error = ref(null)
const productId = route.params.id

const fetchProduct = async () => {
  loading.value = true
  const response = await SaleItemService.getSaleItemById(productId)
  if (response.error) {
    error.value = 'Failed to load product'
    toast.add({ message: 'The requested sale item does not exist.', type: 'error' })
    router.push("/sale-items")
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
