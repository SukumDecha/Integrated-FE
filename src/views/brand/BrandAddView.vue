<template>
  <div class="min-h-screen flex flex-col">
    <XNavbar />
    <XLayout class="space-y-6">
      <XBreadcrumb :items="breadcrumbs" />

      <BrandForm
        :product="{}"
        mode="add"
        :onSubmit="handleSubmit"
        @cancel="$router.push('/sale-items')"
      />
    </XLayout>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { BrandService, SaleItemService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import BrandForm from '@/components/common/form/BrandForm.vue'
import XLayout from '@/components/layout/XLayout.vue'
import XNavbar from '@/components/layout/XNavbar.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'

const router = useRouter()
const toast = useToastStore()

const breadcrumbs = [
  { text: 'Sale Item List', path: '/sale-items/list' },
  { text: 'Brand List', path: '/brands' },
  { text: 'New Brand', active: true },
]

const handleSubmit = async (data) => {
  const res = await BrandService.createBrand(data)
  if (res.error) {
    toast.add({ message: 'Failed to save item', type: 'error' })
    throw new Error('Backend error')
  } else {
    router.push({ path: '/sale-items', query: { toast: 'created' } })
  }
}
</script>


