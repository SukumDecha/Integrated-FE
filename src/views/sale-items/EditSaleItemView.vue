<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast.store'
import { SaleItemService } from '@/services'
import SaleItemDetail from '@/components/sale-item/SaleItemDetail.vue'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const saleItem = ref(null)
const productId = route.params.id

const fetchItem = async () => {
  const res = await SaleItemService.getSaleItemById(productId)
  if (res.error) {
    toast.add({ message: 'Failed to load sale item', type: 'error' })
    router.push('/sale-items')
  } else {
    saleItem.value = res.data
  }
}

const handleUpdate = async (data) => {
  const res = await SaleItemService.updateSaleItem(productId, data)
  if (res.error) {
    toast.add({ message: 'Failed to update item', type: 'error' })
    throw new Error('Backend error')
  } else {
    toast.add({ message: 'Sale item updated successfully', type: 'success' })
    router.push(`/sale-items/${productId}`)
  }
}

onMounted(fetchItem)
</script>

<template>
  <SaleItemDetail
    v-if="saleItem"
    :product="saleItem"
    mode="edit"
    :onSubmit="handleUpdate"
    @cancel="$router.back()"
  />
</template>
