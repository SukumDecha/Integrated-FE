<script setup>
import { useRoute, useRouter } from 'vue-router'
import { BrandService } from '@/services'
import { useToastStore } from '@/stores/toast.store'
import BrandForm from '@/components/brand/BrandForm.vue'
import XLayout from '@/components/layout/XLayout.vue'
import XNavbar from '@/components/layout/XNavbar.vue'
import XBreadcrumb from '@/components/layout/XBreadcrumb.vue'
import { onMounted, ref } from 'vue'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const brandId = route.params.id

const breadcrumbs = [
  { text: 'Sale Item List', path: '/sale-items/list' },
  { text: 'Brand List', path: '/brands' },
  { text: `Edit #${brandId}`, active: true },
]

const brand = ref({})

const fetchBrand = async () => {
  const res = await BrandService.getBrandById(brandId)
    if (res.error) {
      toast.add({ message: 'Failed to fetch brand', type: 'error' })
    } else {
      brand.value = res.data
    }
}

const handleSubmit = async (data) => {
  const res = await BrandService.updateBrand(brandId, data)
  if (res.error) {
    toast.add({ message: 'Failed to save item', type: 'error' })
    throw new Error('Backend error')
  } else {
    toast.add({ message: 'The brand has been edited.', type: 'success' })
    router.push({ path: '/brands' })
  }
}

const handleCancel = () => {
  router.push({ path: '/brands' })
}

onMounted(fetchBrand)
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <XNavbar />
    <XLayout class="space-y-6">
      <XBreadcrumb :items="breadcrumbs" />

      <BrandForm
        :initialData="brand"
        :isEditMode="false"
        :onSubmit="handleSubmit"
        :onCancel="handleCancel"
      />
    </XLayout>
  </div>
</template>
