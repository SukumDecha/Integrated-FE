<template>
  <div class="min-h-screen flex flex-col">
    <XNavbar />
    <XLayout class="space-y-6">
      <XBreadcrumb :items="breadcrumbs" />

      <BrandForm
        :isEditMode="false"
        :onSubmit="handleSubmit"
        :onCancel="handleCancel"
      />
    </XLayout>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { BrandService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import BrandForm from '@/components/brand/BrandForm.vue'
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
    router.push({ path: '/brands', query: { toast: 'created'} })
  }
}


const handleCancel = () => {
  router.push({ path: '/brands' })
}

</script>


