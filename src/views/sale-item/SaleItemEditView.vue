\
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToastStore } from '@/stores/toast.store'
import { SaleItemService } from '@/services'
import SaleItemDetail from '@/components/sale-item/SaleItemDetail.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const saleItem = ref(null)
const productId = route.params.id

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sale Items', path: '/sale-items' },
  { text: `Edit #${productId}`, active: true },
]

const fetchItem = async () => {
  if (productId === undefined) return

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
    toast.add({ message: 'The sale item has been updated.', type: 'success' })
    router.push(`/sale-items/${productId}`)
  }
}

onMounted(fetchItem)
</script>

<template>
  <XBreadcrumb :items="breadcrumbs" />

  <SaleItemDetail
    v-if="saleItem"
    :product="saleItem"
    mode="edit"
    :on-submit="handleUpdate"
    @cancel="$router.back()"
  />
</template>
