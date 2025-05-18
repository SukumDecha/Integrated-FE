<script setup>
import { useRouter } from 'vue-router'
import { SaleItemService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import SaleItemDetail from '@/components/sale-item/SaleItemDetail.vue'
import XLayout from '@/components/layout/XLayout.vue'
import XNavbar from '@/components/layout/XNavbar.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'

const router = useRouter()
const toast = useToastStore()

const breadcrumbs = [
  { text: 'Home', path: '/' },
  { text: 'Sale Items', path: '/sale-items' },
  { text: 'Add', active: true },
]

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
  <div class="min-h-screen flex flex-col">
    <XNavbar />
    <XLayout class="space-y-6">
      <XBreadcrumb :items="breadcrumbs" />

      <SaleItemDetail
        :product="{}"
        mode="add"
        :onSubmit="handleSubmit"
        @cancel="$router.push('/sale-items')"
      />
    </XLayout>
  </div>
</template>
