<script setup>
import { useRouter } from 'vue-router'
import { SaleItemService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import SaleItemDetail from '@/components/sale-item/SaleItemDetail.vue'

const router = useRouter()
const toast = useToastStore()

const handleSubmit = async (data) => {
  const res = await SaleItemService.addSaleItem(data)
  if (res.error) {
    toast.add({ message: 'Failed to save item', type: 'error' })
    throw new Error('Backend error')
  } else {
    router.push({ path: '/sale-items', query: { toast: 'created' } })
  }
}
</script>

<template>
  <SaleItemDetail
    :product="{}"
    mode="add"
    :onSubmit="handleSubmit"
    @cancel="$router.push('/sale-items')"
  />
</template>
