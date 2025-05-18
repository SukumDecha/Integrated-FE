<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast.store'
import { BrandService } from '@/services'
import SaleItemDetail from '@/components/sale-item/SaleItemDetail.vue'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const saleItem = ref(null)
const productId = route.params.id

const fetchBrand = async () => {
  const res = await BrandService.getSaleItemById(productId)
  if (res.error) {
    toast.add({ message: 'Failed to load brand', type: 'error' })
    router.push('/brands')
  } else {
    saleItem.value = res.data
  }
}

const handleUpdate = async (data) => {
  const res = await BrandService.updateSaleItem(productId, data)
  if (res.error) {
    toast.add({ message: 'Failed to update item', type: 'error' })
  } else {
    toast.add({ message: 'The brand has been updated.', type: 'success' })
    router.push(`/sale-items/${productId}`)
  }
}

onMounted(fetchBrand)
</script>

<template>
  <SaleItemDetail
    v-if="saleItem"
    mode="edit"
    :product="saleItem"
    :onSubmit="handleUpdate"
    @cancel="$router.back()"
  />
</template>
